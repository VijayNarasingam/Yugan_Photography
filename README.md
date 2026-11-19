# Yugan Photography

Wedding portfolio for **Ajith Kumar** — candid wedding, reception and pre-wedding
photography in Salem, Tamil Nadu. Built with Vite, React 19, Tailwind v4 and a
Hono Worker that stores the editable content in D1 and uploaded photographs in R2.

```sh
npm install        # or bun install
npm run dev        # http://localhost:5363
npm run typecheck
npm run build
```

## Screens

| Route | What it is |
| --- | --- |
| `/` | Hero (editable banner), manifesto, selected weddings, frames rail, coverage, process, testimonial, venues, CTA |
| `/work` | Wedding gallery with function filters, grid/index views and a keyboard lightbox |
| `/work/:slug` | One wedding: venue meta, story, photograph stack, next wedding |
| `/about` | Ajith's story, portrait, facts, approach, kit, timeline |
| `/contact` | Enquiry form (saved to the studio inbox), direct lines, studio card, FAQ |
| `/studio` | **Hidden** admin: not linked anywhere on the public site |
| anything else | 404 |

## The hidden studio

Open **`/studio`** directly. The local passcode is `yugan2026` (set in
`wrangler.jsonc` as `ADMIN_PASSCODE`). Change it — and `SESSION_SECRET` — before
publishing, and keep the passcode in a secret rather than a var on a real host.

From the studio you can change:

- **Hero** — banner image (upload or URL), eyebrow, both headline lines,
  standfirst, availability line, with a live preview.
- **Gallery** — add, edit, reorder and delete weddings; cover image, every
  photograph with its own caption, function, year, venue, story paragraphs and
  whether it appears in the home page selection.
- **About** — portrait, standfirst, biography paragraphs, facts and approach steps.
- **Contact** — email, phone, WhatsApp, Instagram, address, hours, map link,
  availability note, brand and photographer names.
- **Inbox** — every enquiry sent from the contact form, with delete.

Uploads go to R2 (`env.FILES`) and are served from `/media/*`. Saving writes one
JSON row to D1 (`env.DB`); the public site reads it from `GET /api/site`.
`Reset defaults` restores `defaultSite` from `src/content.ts`.

## Where things live

| What | File |
| --- | --- |
| Copy, weddings, coverage, FAQ, defaults | `src/content.ts` |
| Tokens, grain, marquee, motion | `src/styles.css` |
| Header, footer, cursor, scroll progress | `src/components/Chrome.tsx` |
| Wedding cards, index, lightbox | `src/components/Gallery.tsx` |
| Buttons, fields, reveals, counters, accordion | `src/components/ui.tsx` |
| Site data context | `src/lib/site.tsx` |
| API client | `src/lib/api.ts` |
| Worker routes, auth, validation | `src/server/app.ts` |
| D1 + R2 adapter | `src/server/cloudflare.ts` |
| Vercel Blob adapter | `src/server/vercel.ts` |
| Cloudflare entry | `src/worker/index.ts` |
| Vercel entry + bundler | `src/server/vercel-entry.ts`, `scripts/build-api.mjs` |

## Worker routes

| Route | Notes |
| --- | --- |
| `GET /api/site` | Public site JSON, seeded from `defaultSite` on first run |
| `GET /api/auth` · `POST /api/auth` · `POST /api/auth/logout` | HMAC session cookie, 7 days |
| `PUT /api/admin/site` · `POST /api/admin/site/reset` | Auth required |
| `POST /api/admin/media` | Auth required, image only, 10 MB cap |
| `GET /media/*` | R2 object with immutable caching |
| `POST /api/contact` | Validated, stored in D1, returns a reference |
| `GET /api/admin/messages` · `DELETE /api/admin/messages/:id` | Auth required |

## Photographs and details to replace

The photographs in `public/images/gallery/` are Unsplash placeholders standing in
for Ajith's real wedding work — replace them in the studio, or drop files at the
same paths. The phone number, email and address in `src/content.ts` are sample
values, and the venue names are illustrative.

## Deploying

The same Hono API runs on two hosts through the `Store` contract in
`src/server/store.ts`.

### Cloudflare (original target)

`npm run build` writes `dist/client` (assets) and `dist/yugan_photography`
(Worker). `deploy.json` describes both for the Sites uploader. Provision a D1
database and an R2 bucket, put their ids in `wrangler.jsonc`, then move
`ADMIN_PASSCODE` and `SESSION_SECRET` into secrets.

### Vercel

`api/[[...route]].js` is generated at build time by `scripts/build-api.mjs`
(the Hono app is bundled with esbuild), and the SPA is built with
`vite.vercel.config.ts`. Content, enquiry briefs and uploaded photographs live
in a **private Vercel Blob store**; images are streamed back through `/media/*`
so URLs stay the same on both hosts.

```sh
vercel link                       # link this directory to the project
vercel storage create yugan-media --type blob --access private
vercel storage connect yugan-media --auth token --add-rw-token --yes
vercel env add ADMIN_PASSCODE      # production, preview, development
vercel env add SESSION_SECRET
vercel deploy --target preview
```

Required environment variables: `BLOB_READ_WRITE_TOKEN` (from the connected
store), `ADMIN_PASSCODE`, and `SESSION_SECRET`. Studio uploads go from the
browser straight to Blob, so camera-sized files are not limited by the 4.5 MB
function body cap. `GET /api/health` reports which store is in use
(`r2` or `blob`).

