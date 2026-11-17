# Yugan Photography

A polished, editorial five-page wedding photographer portfolio website with a working single-administrator CMS.

**Photographer:** Ajit Kumar  
**Brand:** Yugan Photography  
**Location:** Jaipur, Rajasthan, India  
**Email:** yuganphotography@gmail.com  
**Instagram:** @yugan.photography

## Pages

| Page | Path | Public? |
|------|------|---------|
| Home | `/` | Yes |
| About | `/about` | Yes |
| Work | `/work` | Yes |
| Project detail | `/work/:slug` | Yes |
| Contact | `/contact` | Yes |
| Admin login | `/admin/login` | No (auth required) |
| Admin (SPA) | `/admin` | No (auth required) |

The Admin area is **not linked from public navigation** and requires real authentication — it is not hidden by URL alone.

## Stack

- Node 24 + Express 5
- EJS server-rendered pages
- Vanilla JavaScript (no build step)
- JSON file store (`data/content.json`, `data/inquiries.json`, `data/auth.json`)
- Sharp image processing with WebP variants (5 responsive sizes)
- bcryptjs password hashing
- HMAC-signed HttpOnly session cookie (SameSite=Strict)
- CSRF cookie + token protection
- Login rate limiting
- Self-hosted Google Fonts (Newsreader serif, Inter sans)

## Getting Started

### Prerequisites

- Node.js 24+
- `npm` or `yarn`

### Install

```bash
npm install
```

### Prepare images

The media library is built from source photographs:

```bash
npm run prepare:images
```

This downloads/grades source images and writes `data/media.seed.json` plus optimized WebP variants under `public/images/media/`.

### Configure

Copy `.env.example` to `.env` and set a strong admin password:

```bash
cp .env.example .env
```

Edit `.env`:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here
```

### Run

```bash
npm start
```

The site runs at `http://127.0.0.1:3000`.  
The admin studio is at `http://127.0.0.1:3000/admin/login`.

### First login

Seed credentials (from `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env`):

- **Username:** `admin`
- **Password:** set in `.env` (default example: `change-this-before-first-run`)

You **must** change the password after first login via Admin → Site settings → Password.

## Admin

The admin is a single-page hash-routed app:

- `#/overview` — Studio dashboard and stats
- `#/home` — Hero, introduction, quote, contact panel
- `#/about` — Biography, approach, experience, highlights
- `#/contact` — Page wording, email/phone, project types
- `#/work` — Projects: add, edit, reorder, delete
- `#/galleries` — Galleries list
- `#/galleries/:id` — Gallery detail: upload, edit, replace, reorder, delete photos
- `#/library` — Image library: alt text, delete
- `#/inquiries` — Contact form enquiries: mark read, delete, reply
- `#/settings` — Site identity, social links, password change, backup

All changes save to the public site immediately.

## Home page content

The home page runs: hero → introduction → selected work → recent frames → approach → quote → services → contact CTA.

- **Recent frames** pulls six photographs from the visible project galleries, skipping featured project covers.
- **Approach** reuses About → Approach.
- **Services** reuses About → Highlights → Services.

No separate Admin fields are needed for these sections — edit the underlying About or Gallery content and the home page updates.

## Image credits

The sample photographs are sourced from [Pexels](https://pexels.com) under the Pexels License. They are placeholders intended to be replaced through the Admin → Media library. See `source-images/CREDITS.md` for the full photo list.

## Fonts

Fonts are self-hosted from Google Fonts under the SIL Open Font License (OFL):

- `public/fonts/inter-latin.woff2` — Inter (sans)
- `public/fonts/newsreader-latin.woff2` — Newsreader (serif)
- `public/fonts/newsreader-italic-latin.woff2` — Newsreader Italic (serif)

See `docs/DESIGN.md` for the font license note.

## Data

Written content lives in `data/`:
- `content.json` — site, home, about, contact, projects, galleries, media references
- `inquiries.json` — contact form submissions
- `auth.json` — administrator credentials (hashed)
- `session-secret` — session signing key (generated at runtime)

Uploaded images live in `public/uploads/`. For a complete backup, copy `data/` and `public/uploads/`.

```bash
# Download a JSON content backup from the admin (Site settings → Backup)
# or curl: curl http://127.0.0.1:3000/api/admin/backup > backup.json
```

## Visual QA

Visual QA was performed with Playwright headless Chromium at 1440px, 1024px, and 390px viewport widths. No horizontal overflow, no console or network errors, and images load on scroll.

## License

Site code: MIT.  
Photographs: Pexels License (placeholders — replace via Admin).  
Fonts: SIL Open Font License (OFL).
