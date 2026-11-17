import { RATIOS } from './config.js';
import { clamp, isEmail, isHttpUrl, normalizeUrl, slugify } from './util.js';
import { findMedia } from './media.js';

export class ValidationError extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.name = 'ValidationError';
    this.status = 422;
    this.fields = fields;
  }
}

function fail(field, message) {
  throw new ValidationError(message, { [field]: message });
}

export function text(value, field, label, { required = false, min = 0, max = 4000, multiline = false } = {}) {
  let out = String(value ?? '');
  if (multiline) {
    out = out.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/[ \t]+\n/g, '\n').trim();
  } else {
    out = out.replace(/\s+/g, ' ').trim();
  }
  if (required && !out) fail(field, `${label} is required.`);
  if (out && out.length < min) fail(field, `${label} needs at least ${min} characters.`);
  if (out.length > max) fail(field, `${label} must be ${max} characters or fewer.`);
  return out;
}

export function bool(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 'on' || value === 1 || value === '1') return true;
  if (value === 'false' || value === 'off' || value === 0 || value === '0') return false;
  return fallback;
}

export function integer(value, field, label, { min = 0, max = 9999, fallback = 0 } = {}) {
  if (value === undefined || value === null || value === '') return fallback;
  const num = Number(value);
  if (!Number.isInteger(num)) fail(field, `${label} must be a whole number.`);
  if (num < min || num > max) fail(field, `${label} must be between ${min} and ${max}.`);
  return num;
}

export function cleanSlug(value, field, fallback = 'untitled') {
  const out = slugify(value || fallback);
  if (!out) fail(field, 'Choose a URL slug using letters and numbers.');
  return out;
}

export function cleanYear(value, field = 'year') {
  const out = String(value ?? '').trim();
  if (!/^\d{4}$/.test(out) || Number(out) < 1900 || Number(out) > 2100) {
    fail(field, 'Year should be a four-digit year, for example 2025.');
  }
  return out;
}

export function cleanEmail(value, field, label, { required = false } = {}) {
  const out = text(value, field, label, { required, max: 160 });
  if (out && !isEmail(out)) fail(field, `${label} does not look like a valid email address.`);
  return out;
}

export function cleanUrl(value, field, label, { required = false } = {}) {
  const raw = text(value, field, label, { required, max: 500 });
  if (!raw) return '';
  const normalized = normalizeUrl(raw);
  if (!isHttpUrl(normalized)) fail(field, `${label} must start with http:// or https://.`);
  return normalized;
}

export function cleanPhone(value, field = 'phone') {
  const out = text(value, field, 'Phone number', { max: 60 });
  if (out && !/^[+\d][\d\s().-]{5,}$/.test(out)) {
    fail(field, 'Enter a phone number using digits, spaces, +, or hyphens.');
  }
  return out;
}

export function cleanRatio(value, field = 'ratio') {
  const out = String(value ?? 'natural');
  if (!(out in RATIOS)) fail(field, 'Choose a valid display ratio.');
  return out;
}

export function cleanFocal(value, field = 'focal') {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0 || num > 100) {
    fail(field, 'Crop focus must be between 0 and 100.');
  }
  return Math.round(clamp(num, 0, 100) * 10) / 10;
}

export function cleanMediaRef(value, content, field, label, { required = false } = {}) {
  if (!value || !value.mediaId) {
    if (required) fail(field, `${label} is required.`);
    return null;
  }
  const media = findMedia(content, value.mediaId);
  if (!media) fail(field, `${label} refers to an image that no longer exists. Choose another.`);
  return {
    mediaId: media.id,
    ratio: cleanRatio(value.ratio, `${field}.ratio`),
    focalX: cleanFocal(value.focalX ?? 50, `${field}.focalX`),
    focalY: cleanFocal(value.focalY ?? 50, `${field}.focalY`),
  };
}

export function cleanStringList(value, field, label, { maxItems = 40, maxLength = 200 } = {}) {
  const raw = Array.isArray(value)
    ? value
    : String(value ?? '').split(/\n+/);
  const items = raw
    .map((item) => String(item ?? '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  if (items.length > maxItems) fail(field, `${label} can contain at most ${maxItems} items.`);
  for (const item of items) {
    if (item.length > maxLength) fail(field, `${label} items must be ${maxLength} characters or fewer.`);
  }
  return items;
}

export function cleanSocials(value, field = 'socials') {
  if (!Array.isArray(value)) return [];
  if (value.length > 12) fail(field, 'Keep social links to 12 or fewer.');
  const seen = new Set();
  return value
    .map((item, index) => {
      const label = text(item?.label, `${field}.${index}.label`, 'Social label', { required: true, max: 40 });
      const url = cleanUrl(item?.url, `${field}.${index}.url`, 'Social URL', { required: true });
      const handle = text(item?.handle, `${field}.${index}.handle`, 'Social handle', { max: 60 });
      let id = String(item?.id || '').trim();
      if (!/^s_[a-z0-9_]{3,30}$/i.test(id) || seen.has(id)) id = `s_${Math.random().toString(36).slice(2, 10)}`;
      seen.add(id);
      return { id, label, url, handle };
    })
    .filter((item) => item.label && item.url);
}

export function cleanSocialsSafe(value) {
  try {
    return cleanSocials(value);
  } catch {
    return [];
  }
}

export function projectPayload(body, content, existing = null) {
  const title = text(body.title, 'title', 'Project title', { required: true, min: 2, max: 120 });
  const slug = cleanSlug(body.slug || title, 'slug', title);
  const otherSlugs = new Set(
    (content.projects || [])
      .filter((p) => p.id !== existing?.id)
      .map((p) => p.slug),
  );
  let uniqueSlug = slug;
  let counter = 2;
  while (otherSlugs.has(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter += 1;
  }

  const galleryId = String(body.galleryId || '').trim();
  if (galleryId && !(content.galleries || []).some((g) => g.id === galleryId)) {
    fail('galleryId', 'Choose an existing gallery.');
  }

  return {
    id: existing?.id || `p_${Math.random().toString(36).slice(2, 10)}`,
    slug: uniqueSlug,
    title,
    category: text(body.category, 'category', 'Category', { required: true, max: 60 }),
    year: cleanYear(body.year, 'year'),
    location: text(body.location, 'location', 'Location', { max: 100 }),
    summary: text(body.summary, 'summary', 'Summary', { required: true, max: 240 }),
    description: text(body.description, 'description', 'Description', { max: 12000, multiline: true }),
    cover: cleanMediaRef(body.cover, content, 'cover', 'Cover image', { required: true }),
    galleryId,
    featured: bool(body.featured),
    visible: bool(body.visible, true),
    order: integer(body.order, 'order', 'Order', { min: 0, max: 9999, fallback: existing?.order ?? 999 }),
  };
}

export function galleryPayload(body, content, existing = null) {
  const title = text(body.title, 'title', 'Gallery title', { required: true, min: 2, max: 120 });
  const slug = cleanSlug(body.slug || title, 'slug', title);
  const otherSlugs = new Set(
    (content.galleries || [])
      .filter((g) => g.id !== existing?.id)
      .map((g) => g.slug),
  );
  let uniqueSlug = slug;
  let counter = 2;
  while (otherSlugs.has(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter += 1;
  }
  return {
    id: existing?.id || `g_${Math.random().toString(36).slice(2, 10)}`,
    slug: uniqueSlug,
    title,
    description: text(body.description, 'description', 'Gallery description', { max: 600, multiline: true }),
    createdAt: existing?.createdAt || new Date().toISOString(),
    photos: existing?.photos || [],
  };
}

export function photoPayload(body, content, existing = null) {
  const mediaId = String(body.mediaId || existing?.mediaId || '').trim();
  if (!findMedia(content, mediaId)) fail('mediaId', 'Choose an image for this photo.');
  return {
    id: existing?.id || `ph_${Math.random().toString(36).slice(2, 10)}`,
    mediaId,
    alt: text(body.alt, 'alt', 'Alt text', { max: 300 }),
    caption: text(body.caption, 'caption', 'Caption', { max: 200 }),
    ratio: cleanRatio(body.ratio),
    focalX: cleanFocal(body.focalX ?? 50, 'focalX'),
    focalY: cleanFocal(body.focalY ?? 50, 'focalY'),
    order: integer(body.order, 'order', 'Order', { min: 0, max: 9999, fallback: existing?.order ?? 999 }),
  };
}

export function homePayload(body, content) {
  return {
    hero: {
      eyebrow: text(body.hero?.eyebrow, 'hero.eyebrow', 'Hero eyebrow', { max: 120 }),
      title: text(body.hero?.title, 'hero.title', 'Hero title', { required: true, max: 120 }),
      statement: text(body.hero?.statement, 'hero.statement', 'Hero statement', { required: true, max: 220 }),
      ctaLabel: text(body.hero?.ctaLabel, 'hero.ctaLabel', 'Hero link label', { required: true, max: 60 }),
      image: cleanMediaRef(body.hero?.image, content, 'hero.image', 'Hero image', { required: true }),
    },
    intro: {
      kicker: text(body.intro?.kicker, 'intro.kicker', 'Introduction eyebrow', { max: 120 }),
      title: text(body.intro?.title, 'intro.title', 'Introduction title', { required: true, max: 160 }),
      body: text(body.intro?.body, 'intro.body', 'Introduction text', { required: true, max: 2000, multiline: true }),
      image: cleanMediaRef(body.intro?.image, content, 'intro.image', 'Introduction image'),
    },
    quote: {
      text: text(body.quote?.text, 'quote.text', 'Pull quote', { required: true, max: 500, multiline: true }),
      attribution: text(body.quote?.attribution, 'quote.attribution', 'Quote attribution', { max: 120 }),
    },
    cta: {
      title: text(body.cta?.title, 'cta.title', 'Contact title', { required: true, max: 160 }),
      body: text(body.cta?.body, 'cta.body', 'Contact text', { required: true, max: 600, multiline: true }),
      linkLabel: text(body.cta?.linkLabel, 'cta.linkLabel', 'Contact link label', { required: true, max: 60 }),
      image: cleanMediaRef(body.cta?.image, content, 'cta.image', 'Contact image'),
    },
  };
}

export function aboutPayload(body, content) {
  const approach = Array.isArray(body.approach) ? body.approach : [];
  if (approach.length > 12) fail('approach', 'Keep the approach to 12 items or fewer.');
  const experience = Array.isArray(body.experience) ? body.experience : [];
  if (experience.length > 30) fail('experience', 'Keep experience to 30 items or fewer.');

  return {
    kicker: text(body.kicker, 'kicker', 'About eyebrow', { max: 120 }),
    title: text(body.title, 'title', 'About title', { required: true, max: 160 }),
    lead: text(body.lead, 'lead', 'About lead', { required: true, max: 1200, multiline: true }),
    portrait: cleanMediaRef(body.portrait, content, 'portrait', 'Portrait'),
    bio: cleanStringList(body.bio, 'bio', 'Biography', { maxItems: 12, maxLength: 4000 }),
    approach: approach.map((item, index) => ({
      title: text(item?.title, `approach.${index}.title`, 'Approach title', { required: true, max: 120 }),
      body: text(item?.body, `approach.${index}.body`, 'Approach text', { required: true, max: 1200, multiline: true }),
    })),
    experience: experience.map((item, index) => ({
      years: text(item?.years, `experience.${index}.years`, 'Years', { max: 80 }),
      role: text(item?.role, `experience.${index}.role`, 'Role', { required: true, max: 160 }),
      place: text(item?.place, `experience.${index}.place`, 'Place', { max: 160 }),
    })),
    highlights: {
      clients: cleanStringList(body.highlights?.clients, 'highlights.clients', 'Clients', { maxItems: 40, maxLength: 120 }),
      publications: cleanStringList(body.highlights?.publications, 'highlights.publications', 'Publications', { maxItems: 40, maxLength: 160 }),
      awards: cleanStringList(body.highlights?.awards, 'highlights.awards', 'Awards', { maxItems: 40, maxLength: 160 }),
      services: cleanStringList(body.highlights?.services, 'highlights.services', 'Services', { maxItems: 40, maxLength: 160 }),
    },
  };
}

export function contactPayload(body, content) {
  return {
    kicker: text(body.kicker, 'kicker', 'Contact eyebrow', { max: 120 }),
    title: text(body.title, 'title', 'Contact title', { required: true, max: 160 }),
    invitation: text(body.invitation, 'invitation', 'Invitation', { required: true, max: 1600, multiline: true }),
    image: cleanMediaRef(body.image, content, 'image', 'Contact image'),
    formNote: text(body.formNote, 'formNote', 'Form note', { max: 300 }),
    projectTypes: cleanStringList(body.projectTypes, 'projectTypes', 'Project types', { maxItems: 12, maxLength: 80 }),
  };
}

export function contactDetailsPayload(body) {
  return {
    email: cleanEmail(body.email, 'email', 'Email', { required: true }),
    phone: cleanPhone(body.phone),
    location: text(body.location, 'location', 'Location', { max: 120 }),
    availability: text(body.availability, 'availability', 'Availability', { max: 160 }),
    socials: cleanSocials(body.socials),
  };
}

export function sitePayload(body, content) {
  return {
    name: text(body.name, 'name', 'Studio name', { required: true, min: 2, max: 120 }),
    role: text(body.role, 'role', 'Role', { max: 160 }),
    location: text(body.location, 'location', 'Location', { max: 120 }),
    email: cleanEmail(body.email, 'email', 'Email', { required: true }),
    phone: cleanPhone(body.phone),
    availability: text(body.availability, 'availability', 'Availability', { max: 160 }),
    footerNote: text(body.footerNote, 'footerNote', 'Footer note', { max: 300 }),
    metaDescription: text(body.metaDescription, 'metaDescription', 'Meta description', { max: 320 }),
    socials: cleanSocials(body.socials),
  };
}
