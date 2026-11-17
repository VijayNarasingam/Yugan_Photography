import crypto from 'node:crypto';
import express from 'express';
import compression from 'compression';
import path from 'node:path';
import {
  APP_VERSION,
  IS_PROD,
  MEDIA_DIR,
  OG_CACHE_DIR,
  PUBLIC_DIR,
  SITE_URL,
  UPLOAD_DIR,
  VIEWS_DIR,
} from './config.js';
import { contentStore } from './store.js';
import {
  attachSecurityContext,
  ensureAuth,
  requireAuthPage,
} from './auth.js';
import {
  findMedia,
  mediaFullUrl,
  mediaThumb,
  picture,
  RATIO_OPTIONS,
} from './media.js';
import {
  escapeHtml,
  formatDate,
  formatDateTime,
  paragraphs,
} from './util.js';
import { publicRoutes } from './routes/public.js';
import { authRoutes } from './routes/auth.js';
import { adminApiRoutes } from './routes/admin-api.js';
import { adminPageRoutes } from './routes/admin-page.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (IS_PROD) app.set('trust proxy', 1);
  app.set('view engine', 'ejs');
  app.set('views', VIEWS_DIR);

  app.use(compression());

  app.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64');
    res.locals.cspNonce = nonce;
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}'`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "manifest-src 'self'",
    ].join('; ');
    res.setHeader('Content-Security-Policy', csp);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (IS_PROD) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    if (req.path.startsWith('/admin') || req.path.startsWith('/api')) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    }
    next();
  });

  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(express.json({ limit: '2mb' }));

  app.use('/images', express.static(path.join(PUBLIC_DIR, 'images'), {
    maxAge: IS_PROD ? '30d' : 0,
    etag: true,
    fallthrough: true,
  }));
  app.use('/uploads', express.static(UPLOAD_DIR, {
    maxAge: '1y',
    immutable: true,
    etag: true,
    fallthrough: true,
  }));
  app.use('/fonts', express.static(path.join(PUBLIC_DIR, 'fonts'), {
    maxAge: '1y',
    immutable: true,
    etag: true,
    fallthrough: true,
  }));
  app.use(express.static(PUBLIC_DIR, {
    maxAge: IS_PROD ? '1h' : 0,
    etag: true,
    index: false,
    dotfiles: 'deny',
  }));

  app.use(attachSecurityContext);

  app.use((req, res, next) => {
    const content = contentStore.get();
    const site = content.site;
    res.locals.content = content;
    res.locals.site = site;
    res.locals.currentPath = req.path;
    res.locals.navSection = req.path.startsWith('/work') ? 'work' : req.path.replace(/^\//, '') || 'home';
    res.locals.siteUrl = SITE_URL;
    res.locals.appVersion = APP_VERSION;
    res.locals.year = new Date().getFullYear();
    res.locals.picture = (ref, opts = {}) => picture(content, ref, opts);
    res.locals.findMedia = (id) => findMedia(content, id);
    res.locals.mediaFullUrl = mediaFullUrl;
    res.locals.mediaThumb = mediaThumb;
    res.locals.formatDate = formatDate;
    res.locals.formatDateTime = formatDateTime;
    res.locals.escapeHtml = escapeHtml;
    res.locals.paragraphs = paragraphs;
    res.locals.ratioOptions = RATIO_OPTIONS;
    res.locals.pageTitle = `${site.name} — ${site.role}`;
    res.locals.metaDescription = site.metaDescription;
    res.locals.canonical = `${SITE_URL}${req.path}`;
    res.locals.ogImage = `${SITE_URL}/images/og-default.jpg`;
    res.locals.ogType = 'website';
    res.locals.headerOverlay = false;
    res.locals.bodyClass = '';
    res.locals.noindex = false;
    res.locals.extraCss = '';
    res.locals.preloadImage = '';
    res.locals.structuredData = null;
    res.setHeader('Cache-Control', 'no-cache');
    next();
  });

  app.use(publicRoutes);
  app.use('/admin', authRoutes);
  app.use('/admin', adminPageRoutes);
  app.use('/api/admin', adminApiRoutes);

  app.use((req, res) => {
    res.status(404).render('404', {
      pageTitle: `Page not found — ${contentStore.get().site.name}`,
      metaDescription: 'The page you are looking for could not be found.',
      noindex: true,
      bodyClass: 'page-404',
    });
  });

  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    const status = Number(err.status) || 500;
    if (status >= 500) console.error('[error]', err);
    const wantsJson =
      req.path.startsWith('/api/') ||
      req.get('accept')?.includes('application/json');
    if (wantsJson) {
      const payload = {
        error: status >= 500 ? 'Something went wrong on the server. Please try again.' : err.message,
      };
      if (err.fields) payload.fields = err.fields;
      if (err.name === 'MulterError') {
        payload.error =
          err.code === 'LIMIT_FILE_SIZE'
            ? 'One of the images is larger than 30 MB.'
            : err.code === 'LIMIT_FILE_COUNT'
              ? 'Too many files in one upload. Try 20 or fewer.'
              : 'The upload could not be accepted.';
        return res.status(400).json(payload);
      }
      return res.status(status).json(payload);
    }
    if (err.name === 'MulterError') {
      return res.status(400).render('error', {
        pageTitle: 'Upload error',
        status: 400,
        message: 'The upload could not be accepted. Please check the file size and try again.',
        noindex: true,
      });
    }
    return res.status(status).render('error', {
      pageTitle: status === 404 ? 'Page not found' : 'Something went wrong',
      status,
      message: status >= 500 ? 'Something went wrong on the server. Please try again in a moment.' : err.message,
      noindex: true,
    });
  });

  return app;
}
