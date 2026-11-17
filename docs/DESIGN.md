# Yugan Photography — Design System

## Visual Direction

**Editorial Minimalism / Monochrome + Accent**

- Generous whitespace
- Confident typography
- Restrained palette
- Large photographs
- Warm paper neutrals, ink type, clay accent

## Color Tokens

| Token | Usage | Value |
|-------|-------|-------|
| `--paper` | Page background | Warm off-white (`#F5F1E9`) |
| `--ink` | Primary text | Near-black (`#14120F`) |
| `--muted` | Secondary text | Muted brown-grey |
| `--muted-2` | Fine print / captions | Lighter muted grey |
| `--line` | Borders / dividers | Soft grey line |
| `--accent` | Highlights, links, buttons | Clay terracotta (`#B4552D`) |

## Typography

- **Headings / display:** Newsreader (serif, self-hosted variable WOFF2)
- **Body / UI:** Inter (sans, self-hosted variable WOFF2)

Fonts are self-hosted locally under `public/fonts/` rather than loaded from the Google Fonts CDN, for privacy and performance.

## Layout Principles

- Large hero images that fill the viewport
- Staggered two-column grids with intentional empty areas (editorial feel)
- Grids collapse to a single column at `<=720px` for mobile
- Generous section padding
- Visible focus states for keyboard navigation
- Accessible contrast ratios throughout

## Components

- **Hero:** Full-screen opening image with statement and CTA
- **Project cards:** Staggered grid with category badges
- **Recent frames:** Three-column masonry of photographs pulled from the visible project galleries, excluding featured covers
- **Approach:** Numbered three-column principles drawn from About → Approach
- **Services:** Editorial split layout listing coverage options from About → Highlights → Services
- **Work mosaic:** Dark, fixed-palette gallery grid with a large intro panel, overlay heading, and CTA; stays dark in both themes
- **Lightbox:** Accessible keyboard-navigable image lightbox
- **Contact form:** AJAX submission with success/error states, honeypot spam protection, rate limiting
- **Admin:** Hash-routed SPA with `<dialog>` editors, media picker, confirm dialogs, and toasts

## Home Page Flow

1. Hero
2. Introduction
3. Selected work
4. Recent frames
5. Approach
6. Pull quote
7. Services
8. Contact CTA

Recent frames, Approach, and Services reuse existing Gallery and About content, so no additional Admin fields are required.

## Font Licenses

All fonts are sourced from Google Fonts and distributed under the **SIL Open Font License (OFL)**:

| File | Font | License |
|------|------|---------|
| `public/fonts/inter-latin.woff2` | Inter | SIL OFL |
| `public/fonts/newsreader-latin.woff2` | Newsreader | SIL OFL |
| `public/fonts/newsreader-italic-latin.woff2` | Newsreader Italic | SIL OFL |

The OFL permits embedding, modification, and redistribution. Full license text is available at https://scripts.sil.org/OFL. Font files were downloaded from the Google Fonts GitHub repository (google/fonts).

## Image Credits

Sample photographs are sourced from [Pexels](https://pexels.com) under the Pexels License (free to use and modify). They are placeholders intended to be replaced through the Admin → Media library. See `source-images/CREDITS.md` for the complete photo list with attribution.

## Responsive Breakpoints

- **Desktop:** > 1024px
- **Tablet:** 721–1024px
- **Mobile:** <= 720px (grids collapse to one column)

## Accessibility

- Skip to content link
- Visible keyboard focus indicators
- Alt text on all images (admin-manageable)
- ARIA labels on interactive elements
- Semantic HTML5 structure
- Color contrast meets WCAG AA
- Reduced motion support (`prefers-reduced-motion`)
