import path from 'node:path';
import { PUBLIC_DIR, RATIOS } from './config.js';
import { clamp, escapeAttr, escapeHtml } from './util.js';

export const RATIO_OPTIONS = [
  { value: 'natural', label: 'Original ratio' },
  { value: '4/5', label: 'Portrait · 4:5' },
  { value: '5/4', label: 'Landscape · 5:4' },
  { value: '3/2', label: 'Landscape · 3:2' },
  { value: '2/3', label: 'Portrait · 2:3' },
  { value: '1/1', label: 'Square · 1:1' },
  { value: '16/9', label: 'Wide · 16:9' },
  { value: '9/16', label: 'Tall · 9:16' },
];

export function findMedia(content, id) {
  if (!id) return null;
  return (content.media || []).find((m) => m.id === id) || null;
}

export function sortedVariants(media) {
  return [...(media?.variants || [])].sort((a, b) => a.w - b.w);
}

export function variantAt(media, target = 960) {
  const variants = sortedVariants(media);
  if (!variants.length) return null;
  return variants.find((v) => v.w >= target) || variants[variants.length - 1];
}

export function mediaSrcset(media) {
  return sortedVariants(media)
    .map((v) => `${v.url} ${v.w}w`)
    .join(', ');
}

export function mediaUrl(media, width = 960) {
  return variantAt(media, width)?.url || '';
}

export function mediaFullUrl(media) {
  const variants = sortedVariants(media);
  return variants[variants.length - 1]?.url || '';
}

export function mediaThumb(media) {
  return sortedVariants(media)[0]?.url || '';
}

export function mediaFilePath(media) {
  const url = mediaFullUrl(media);
  if (!url) return null;
  const file = path.resolve(PUBLIC_DIR, url.replace(/^\//, ''));
  if (!file.startsWith(PUBLIC_DIR)) return null;
  return file;
}

export function ratioCss(ref, media) {
  const ratio = ref?.ratio || 'natural';
  if (ratio !== 'natural' && RATIOS[ratio]) return RATIOS[ratio];
  if (!media) return '3 / 2';
  return `${media.width} / ${media.height}`;
}

export function focal(ref) {
  return {
    x: clamp(ref?.focalX ?? 50, 0, 100),
    y: clamp(ref?.focalY ?? 50, 0, 100),
  };
}

export function picture(content, ref, opts = {}) {
  const media = findMedia(content, ref?.mediaId);
  if (!media) {
    return `<span class="media-placeholder ${escapeAttr(opts.class || '')}" role="img" aria-label="Photograph coming soon">
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 7.5h3l1.5-2h9L18 7.5h3v11H3z"/><circle cx="12" cy="13" r="3.2"/></svg>
      <span>Photograph coming soon</span>
    </span>`;
  }

  const variants = sortedVariants(media);
  const srcVariant = variantAt(media, opts.width || 960) || variants[0];
  const { x, y } = focal(ref);
  const alt = opts.decorative ? '' : (opts.alt ?? ref?.alt ?? media.alt ?? '');
  const loading = opts.priority ? 'eager' : (opts.loading || 'lazy');
  const classes = ['media-img', opts.class].filter(Boolean).join(' ');
  const sizes = opts.sizes || '100vw';
  const srcset = mediaSrcset(media);
  const width = media.width || srcVariant.w;
  const height = media.height || srcVariant.h;
  const fetchPriority = opts.priority ? ' fetchpriority="high"' : '';

  return `<img src="${escapeAttr(srcVariant.url)}" srcset="${escapeAttr(srcset)}" sizes="${escapeAttr(sizes)}" width="${width}" height="${height}" alt="${escapeAttr(alt)}" loading="${loading}" decoding="async"${fetchPriority} class="${escapeAttr(classes)}" data-media-id="${escapeAttr(media.id)}" style="--ratio:${ratioCss(ref, media)};--focal-x:${x}%;--focal-y:${y}%;">`;
}

export function imageUsage(content, mediaId) {
  const uses = [];
  const check = (ref, label) => {
    if (ref?.mediaId === mediaId) uses.push(label);
  };
  check(content.home?.hero?.image, 'Home — hero');
  check(content.home?.intro?.image, 'Home — introduction');
  check(content.home?.cta?.image, 'Home — contact call-to-action');
  check(content.about?.portrait, 'About — portrait');
  check(content.contact?.image, 'Contact — page image');
  for (const project of content.projects || []) {
    check(project.cover, `Project — ${project.title} (cover)`);
  }
  for (const gallery of content.galleries || []) {
    for (const photo of gallery.photos || []) {
      if (photo.mediaId === mediaId) {
        uses.push(`Gallery — ${gallery.title} (${photo.caption || photo.alt || 'photo'})`);
      }
    }
  }
  return uses;
}

export function mediaUsageCount(content, mediaId) {
  return imageUsage(content, mediaId).length;
}

export function refFromMedia(mediaId, ratio = 'natural', focalX = 50, focalY = 50) {
  return { mediaId, ratio, focalX, focalY };
}

export function mediaAlt(media, fallback = 'Photograph by Yugan Photography') {
  return escapeHtml(media?.alt || fallback);
}
