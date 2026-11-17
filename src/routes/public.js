import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {
  OG_CACHE_DIR,
  PUBLIC_DIR,
  SITE_URL,
} from '../config.js';
import { contentStore, inquiryStore } from '../store.js';
import {
  findMedia,
  mediaSrcset,
  mediaUrl,
  mediaFilePath,
  mediaFullUrl,
} from '../media.js';
import { cleanEmail, text, ValidationError } from '../validate.js';
import { contactLimiter, minutesUntil } from '../rate-limit.js';
import { requireSameOrigin } from '../auth.js';
import { escapeAttr, randomId, truncate } from '../util.js';

export const publicRoutes = express.Router();

function preloadFor(content, ref, sizes = '100vw') {
  const media = findMedia(content, ref?.mediaId);
  if (!media) return '';
  const href = mediaUrl(media, 1600);
  return `<link rel="preload" as="image" href="${escapeAttr(href)}" imagesrcset="${escapeAttr(mediaSrcset(media))}" imagesizes="${escapeAttr(sizes)}" fetchpriority="high">`;
}

function ogFor(content, ref) {
  const media = findMedia(content, ref?.mediaId);
  if (!media) return `${SITE_URL}/images/og-default.jpg`;
  return `${SITE_URL}/og/${media.id}.jpg`;
}

function personSchema(content) {
  const site = content.site;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: site.role,
    description: site.metaDescription,
    url: SITE_URL,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.location,
      addressCountry: 'IN',
    },
    sameAs: (site.socials || []).map((social) => social.url).filter(Boolean),
  };
}

/**
 * Collect photographs from the visible projects' galleries, interleaving one
 * image per gallery at a time so the selection feels like a broad archive.
 */
function gallerySelection(content, visibleProjects, limit, excludeMediaIds) {
  const excluded = excludeMediaIds instanceof Set ? excludeMediaIds : new Set(excludeMediaIds || []);
  const projectsByGallery = new Map();
  for (const project of visibleProjects) {
    if (project.galleryId) projectsByGallery.set(project.galleryId, project);
  }

  const galleries = (content.galleries || [])
    .map((gallery) => ({
      ...gallery,
      photos: [...(gallery.photos || [])]
        .filter((photo) => photo.mediaId && !excluded.has(photo.mediaId))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }))
    .filter((gallery) => projectsByGallery.has(gallery.id) && gallery.photos.length);

  const out = [];
  const maxPhotos = Math.max(0, ...galleries.map((gallery) => gallery.photos.length));

  for (let index = 0; index < maxPhotos && out.length < limit; index += 1) {
    for (const gallery of galleries) {
      const photo = gallery.photos[index];
      if (!photo) continue;
      const project = projectsByGallery.get(gallery.id);
      out.push({
        ...photo,
        galleryId: gallery.id,
        galleryTitle: gallery.title,
        projectSlug: project.slug,
      });
      if (out.length >= limit) break;
    }
  }

  return out;
}

publicRoutes.get('/', (req, res) => {
  const content = contentStore.get();
  const visible = content.projects.filter((p) => p.visible).sort((a, b) => a.order - b.order);
  let featured = visible.filter((p) => p.featured).slice(0, 3);
  if (featured.length < 3) {
    const ids = new Set(featured.map((p) => p.id));
    featured = [...featured, ...visible.filter((p) => !ids.has(p.id))].slice(0, 3);
  }
  const featuredCoverIds = new Set(featured.map((p) => p.cover?.mediaId).filter(Boolean));
  const recentPhotos = gallerySelection(content, visible, 6, featuredCoverIds);

  res.render('home', {
    pageTitle: `${content.site.name} — ${content.site.role}`,
    metaDescription: content.site.metaDescription,
    canonical: `${SITE_URL}/`,
    ogImage: ogFor(content, content.home.hero.image),
    headerOverlay: true,
    bodyClass: 'page-home',
    navSection: 'home',
    featured,
    recentPhotos,
    preloadImage: preloadFor(content, content.home.hero.image),
    structuredData: personSchema(content),
  });
});

publicRoutes.get('/about', (req, res) => {
  const content = contentStore.get();
  res.render('about', {
    pageTitle: `About — ${content.site.name}`,
    metaDescription: truncate(content.about.lead, 180),
    canonical: `${SITE_URL}/about`,
    ogImage: ogFor(content, content.about.portrait),
    bodyClass: 'page-about',
    navSection: 'about',
    preloadImage: preloadFor(content, content.about.portrait, '(min-width: 900px) 40vw, 100vw'),
    structuredData: personSchema(content),
  });
});

publicRoutes.get('/work', (req, res) => {
  const content = contentStore.get();
  const projects = content.projects.filter((p) => p.visible).sort((a, b) => a.order - b.order);
  const categories = [...new Set(projects.map((p) => p.category).filter(Boolean))];
  const projectCoverIds = new Set(projects.map((p) => p.cover?.mediaId).filter(Boolean));
  const mosaicPhotos = gallerySelection(content, projects, 8, projectCoverIds);
  res.render('work', {
    pageTitle: `Work — ${content.site.name}`,
    metaDescription: content.site.metaDescription,
    canonical: `${SITE_URL}/work`,
    ogImage: `${SITE_URL}/images/og-default.jpg`,
    bodyClass: 'page-work',
    navSection: 'work',
    projects,
    categories,
    mosaicPhotos,
  });
});

publicRoutes.get('/work/:slug', (req, res, next) => {
  const content = contentStore.get();
  const projects = content.projects.filter((p) => p.visible).sort((a, b) => a.order - b.order);
  const index = projects.findIndex((p) => p.slug === req.params.slug);
  if (index === -1) return next();
  const project = projects[index];
  const gallery = content.galleries.find((g) => g.id === project.galleryId) || null;
  const photos = gallery ? [...gallery.photos].sort((a, b) => a.order - b.order) : [];
  const nextProject = projects.length > 1 ? projects[(index + 1) % projects.length] : null;

  res.render('project', {
    pageTitle: `${project.title} — ${content.site.name}`,
    metaDescription: project.summary,
    canonical: `${SITE_URL}/work/${project.slug}`,
    ogImage: ogFor(content, project.cover),
    ogType: 'article',
    bodyClass: 'page-project',
    navSection: 'work',
    project,
    gallery,
    photos,
    nextProject,
    preloadImage: preloadFor(content, project.cover),
  });
});

publicRoutes.get('/contact', (req, res) => {
  const content = contentStore.get();
  res.render('contact', {
    pageTitle: `Contact — ${content.site.name}`,
    metaDescription: truncate(content.contact.invitation, 180),
    canonical: `${SITE_URL}/contact`,
    ogImage: ogFor(content, content.contact.image),
    bodyClass: 'page-contact',
    navSection: 'contact',
    preloadImage: preloadFor(content, content.contact.image, '(min-width: 900px) 42vw, 100vw'),
  });
});

publicRoutes.post('/api/contact', requireSameOrigin, async (req, res, next) => {
  try {
    const content = contentStore.get();
    const limit = contactLimiter.consume(req.ip || 'unknown');
    if (!limit.allowed) {
      return res.status(429).json({
        error: `That is a few notes in a short time. Please try again in about ${minutesUntil(limit.retryAfterMs)} minutes.`,
      });
    }

    const body = req.body || {};
    if (String(body.website || '').trim()) {
      return res.status(201).json({ ok: true, message: 'Thank you — your note is with me.' });
    }

    const name = text(body.name, 'name', 'Your name', { required: true, min: 2, max: 80 });
    const email = cleanEmail(body.email, 'email', 'Email address', { required: true });
    const projectType = text(body.projectType, 'projectType', 'Project type', { max: 80 });
    if (projectType && content.contact.projectTypes.length && !content.contact.projectTypes.includes(projectType)) {
      throw new ValidationError('Choose one of the listed project types.', {
        projectType: 'Choose one of the listed project types.',
      });
    }
    const message = text(body.message, 'message', 'Your message', {
      required: true,
      min: 10,
      max: 2000,
      multiline: true,
    });

    const inquiry = {
      id: randomId('inq'),
      name,
      email,
      projectType,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      userAgent: String(req.get('user-agent') || '').slice(0, 220),
    };

    await inquiryStore.update((draft) => {
      draft.inquiries.unshift(inquiry);
    });

    return res.status(201).json({
      ok: true,
      message: 'Thank you — your note is with me. I will reply within two working days.',
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(422).json({ error: err.message, fields: err.fields });
    }
    return next(err);
  }
});

publicRoutes.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /admin/',
      'Disallow: /api',
      'Disallow: /api/',
      `Sitemap: ${SITE_URL}/sitemap.xml`,
      '',
    ].join('\n'),
  );
});

publicRoutes.get('/sitemap.xml', (req, res) => {
  const content = contentStore.get();
  const urls = [
    { loc: `${SITE_URL}/`, priority: '1.0' },
    { loc: `${SITE_URL}/about`, priority: '0.7' },
    { loc: `${SITE_URL}/work`, priority: '0.9' },
    { loc: `${SITE_URL}/contact`, priority: '0.6' },
    ...content.projects
      .filter((p) => p.visible)
      .map((p) => ({ loc: `${SITE_URL}/work/${p.slug}`, priority: '0.8' })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `  <url>
    <loc>${item.loc.replaceAll('&', '&amp;')}</loc>
    <priority>${item.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;
  res.type('application/xml').send(xml);
});

publicRoutes.get('/og/:file', async (req, res) => {
  const content = contentStore.get();
  const id = String(req.params.file || '').replace(/\.jpg$/i, '');
  const media = findMedia(content, id);
  const fallback = path.join(PUBLIC_DIR, 'images', 'og-default.jpg');
  res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
  if (!media) return res.sendFile(fallback);

  const cacheName = `${media.id.replace(/[^a-z0-9_-]/gi, '')}.jpg`;
  const cacheFile = path.join(OG_CACHE_DIR, cacheName);
  try {
    await fs.access(cacheFile);
    return res.sendFile(cacheFile);
  } catch {
    // generate below
  }

  try {
    const source = mediaFilePath(media);
    if (!source) return res.sendFile(fallback);
    await fs.mkdir(OG_CACHE_DIR, { recursive: true });
    await sharp(source)
      .resize({ width: 1200, height: 630, fit: 'cover', position: 'attention' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(cacheFile);
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    return res.sendFile(cacheFile);
  } catch (err) {
    console.error('[og]', err.message);
    return res.sendFile(fallback);
  }
});
