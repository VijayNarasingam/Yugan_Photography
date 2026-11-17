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
| `--accent` | Highlights, links, buttons | Clay terracotta (`#8C4E2F`) |

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
- **Introduction:** Serif statement, studio facts row (location, practice, coverage), and a tall portrait figure
- **Featured intro:** Oversized serif heading paired with a short lead-in above the selected-work grid
- **Project cards:** Staggered grid with category badges
- **Recent frames:** Three-column masonry of photographs pulled from the visible project galleries, excluding featured covers; each frame carries a small caption and source project
- **Approach:** Numbered three-column principles drawn from About → Approach
- **Services:** Editorial split layout listing coverage options from About → Highlights → Services, with a closing note under the list
- **Kind words:** Soft paper-2 band with a sticky left intro and a stacked testimonial list; quote marks, serif quotes, and uppercase couple/context captions
- **Recognition:** Two-part layout with a serif heading and three bordered lists for publications, awards, and clients
- **Work mosaic:** Dark, fixed-palette gallery grid with a large intro panel, overlay heading, and CTA; stays dark in both themes
- **Lightbox:** Accessible keyboard-navigable image lightbox
- **Contact form:** AJAX submission with success/error states, honeypot spam protection, rate limiting
- **Admin:** Hash-routed SPA with `<dialog>` editors, media picker, confirm dialogs, and toasts

## Home Page Flow

1. Hero
2. Introduction — 01 / 07
3. Selected work — 02 / 07
4. Recent frames — 03 / 07
5. Approach — 04 / 07
6. Pull quote (unnumbered dark band)
7. Services — 05 / 07
8. Kind words — 06 / 07
9. Recognition — 07 / 07
10. Contact CTA

Recent frames, Approach, Services, and Recognition reuse existing Gallery and About content. Kind words is the only new home-specific collection, stored at `home.testimonials` and edited under Admin → Home page. Testimonials and Recognition hide gracefully when their data is empty.

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
