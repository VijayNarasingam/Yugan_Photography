// src/server/app.ts
import { Hono } from "hono";

// src/content.ts
var CATEGORIES = ["Weddings", "Reception", "Engagement", "Pre-wedding", "Destination"];
var img = (name) => `/images/gallery/${name}.webp`;
var defaultSite = {
  brand: "Yugan Photography",
  photographer: "Ajith Kumar",
  tagline: "Wedding photography in Salem, Tamil Nadu",
  hero: {
    image: img("hero-muhurtham"),
    alt: "A bride in a red and gold saree and a groom in white, garlanded and sitting together at their reception",
    eyebrow: "Wedding photography \xB7 Salem, Tamil Nadu",
    lineOne: "Your day,",
    lineTwo: "held in light.",
    sub: "Candid, unhurried wedding photography across Tamil Nadu \u2014 muhurtham mornings, reception evenings, and the small minutes in between that nobody planned.",
    note: "2027 dates open \xB7 Booking Dec 2026 \u2014 Jun 2027"
  },
  about: {
    portrait: img("portrait-ajith"),
    standfirst: "I photograph weddings the way they actually happen. No stopped ceremonies, no rehearsed smiles \u2014 just the two of you, your families, and whatever light turns up that day.",
    bio: [
      "I am Ajith Kumar. I grew up in Salem, studied architecture in Coimbatore, and photographed my cousin\u2019s wedding in 2017 on a borrowed camera. By the end of that muhurtham I had stopped caring about buildings and started caring about the two minutes before the thaali is tied.",
      "Yugan Photography has been full time since 2019. We are a small team: I shoot, and a second photographer covers the other side of the hall so nothing important happens off-frame. Around 260 weddings so far \u2014 muhurthams in Salem and Namakkal, church weddings in Trichy, receptions in Coimbatore hotels, and a handful of destination weeks in Puducherry and Kodaikanal.",
      "The approach is candid first. The ceremony runs untouched, families are photographed quickly and kindly, and the couple portraits happen after the crowd has gone for lunch. Every wedding is backed up twice the same night and delivered with a hand-bound album you can hand to your grandchildren."
    ],
    facts: [
      { label: "Based in", value: "Fairlands, Salem 636016" },
      { label: "Shooting since", value: "2017" },
      { label: "Coverage", value: "Tamil Nadu, Bengaluru, destination" },
      { label: "Team", value: "Two photographers, one assistant" },
      { label: "Gear", value: "2\xD7 Sony \xB7 24\u201370, 35, 85mm" },
      { label: "Languages", value: "Tamil, English, a little Hindi" },
      { label: "Albums", value: "Hand-bound in Chennai" }
    ],
    approach: [
      {
        title: "Two cameras, never one",
        text: "The second photographer stays with the other family, so the groom\u2019s side and the bride\u2019s side both exist in the album. No re-enacting the garland exchange two weeks later."
      },
      {
        title: "The ceremony runs untouched",
        text: "We never stop the muhurtham for a photograph. Two primes at the edge of the mandapam, and enough familiarity with the order of things to be in the right place before it happens."
      },
      {
        title: "Candid first, portraits after",
        text: "Twenty unhurried minutes with the two of you once the hall empties. That is usually the only part of the day you will actually remember."
      },
      {
        title: "Backed up before I sleep",
        text: "Two cards in camera, two drives at the studio the same night. Teaser in 48 hours, full gallery in three weeks, album proof at six."
      }
    ]
  },
  contact: {
    email: "hello@yuganphotography.in",
    phone: "+91 98430 00000",
    whatsapp: "919843000000",
    instagram: "yugan.weddings",
    address: "12, Fairlands, Salem 636016, Tamil Nadu",
    hours: "Mon\u2013Sat \xB7 9:00\u201318:00 IST",
    note: "I take a limited number of weddings each month so every one gets a full edit. Dates are held with a 30% advance; travel outside Salem is quoted before booking.",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Fairlands+Salem+Tamil+Nadu"
  },
  projects: [
    {
      id: "p-aishwarya-karthik",
      title: "Aishwarya & Karthik",
      slug: "aishwarya-and-karthik",
      category: "Weddings",
      location: "Salem",
      year: "2026",
      client: "Sri Lakshmi Mahal, Salem",
      summary: "A four-hour muhurtham in a hall that was full of cousins by nine, and the two of them on a rose-covered couch by eleven.",
      body: [
        "The muhurtham was at 7:40am, which meant the getting-ready rooms were chaos at six and completely silent at half past. Karthik\u2019s side arrived by the busload from Rasipuram; Aishwarya\u2019s grandmother had been in the hall since five, straightening flowers nobody had asked her to straighten.",
        "We shot the ceremony from two corners of the mandapam and never stepped inside it. The reception portraits came later, on the couch, with the hall half-empty and both of them finally laughing at something their cousin said off-camera."
      ],
      cover: img("hero-muhurtham"),
      images: [
        { src: img("hero-muhurtham"), caption: "Aishwarya and Karthik, reception portraits, 11:10am" },
        { src: img("decor-detail"), caption: "Mandapam florals, before the guests came in" },
        { src: img("hands-ring"), caption: "The thaali, straight after the muhurtham" }
      ],
      featured: true
    },
    {
      id: "p-divya-surya",
      title: "Divya & Surya",
      slug: "divya-and-surya",
      category: "Reception",
      location: "Salem",
      year: "2026",
      client: "Sattva Convention, Salem",
      summary: "Four hundred guests on a lawn, twelve chandeliers under a canopy, and a first dance that nobody had rehearsed.",
      body: [
        "The brief was simple: make a very large reception feel like a private one. We started at four, while the light was still soft and the tables were still empty, and stayed through the speeches until the last plate was cleared.",
        "The photograph they printed largest is not the stage shot. It is the two of them walking back through the empty tables at eleven, shoes off, holding one plate of food between them."
      ],
      cover: img("reception-decor"),
      images: [
        { src: img("reception-decor"), caption: "Lawn reception, 4:40pm" },
        { src: img("ritual-fire"), caption: "The hall before the guests arrived" },
        { src: img("couple-grass"), caption: "The two of them, last light" }
      ],
      featured: true
    },
    {
      id: "p-nandhini-vignesh",
      title: "Nandhini & Vignesh",
      slug: "nandhini-and-vignesh",
      category: "Weddings",
      location: "Erode",
      year: "2025",
      client: "Karpagam Thirumana Mandapam, Erode",
      summary: "An open-air mandapam under a blue sky, a very punctual priest, and a family that filled the aisle before the bride did.",
      body: [
        "Outdoor muhurthams are a gamble in Tamil Nadu in June. This one got a clean sky for ninety minutes and rain twenty minutes after the thaali \u2014 which meant the portraits had to happen fast and the family groups had to happen under the canopy.",
        "We kept the coverage to the ceremony and the immediate family, and it is still one of the fullest albums we have delivered: 780 frames from five hours."
      ],
      cover: img("muhurtham-canopy"),
      images: [
        { src: img("muhurtham-canopy"), caption: "The mandapam, 9:20am" },
        { src: img("bride-sari"), caption: "Nandhini, before the ceremony" },
        { src: img("getting-ready"), caption: "The getting-ready room, 6:15am" }
      ],
      featured: true
    },
    {
      id: "p-keerthana-arun",
      title: "Keerthana & Arun",
      slug: "keerthana-and-arun",
      category: "Engagement",
      location: "Coimbatore",
      year: "2026",
      client: "Palm Court, Coimbatore",
      summary: "A nischayathartham in the late afternoon: two families, one ring, and forty-five minutes of portraits on the lawn.",
      body: [
        "Engagements are short and entirely about the families, so the coverage is different from a wedding day. We photographed the ring exchange from the front, then pulled both sets of parents in for groups while the coffee went round.",
        "The portraits at the end took twenty minutes and produced the frame they used on the wedding invitation six months later."
      ],
      cover: img("couple-grass"),
      images: [
        { src: img("couple-grass"), caption: "Keerthana and Arun, garden portraits" },
        { src: img("couple-river"), caption: "Walking back to the hall" },
        { src: img("hands-ring"), caption: "The ring" }
      ],
      featured: true
    },
    {
      id: "p-meera-rohan",
      title: "Meera & Rohan",
      slug: "meera-and-rohan",
      category: "Pre-wedding",
      location: "Yercaud",
      year: "2025",
      client: "Yercaud hills",
      summary: "A half day above the clouds for a save-the-date film, shot in the two hours before the mist closed in.",
      body: [
        "Pre-wedding shoots work best when nobody is performing. We drove up before dawn, walked to a viewpoint neither of them had seen, and shot for two hours with one lens and no direction beyond \u201Cwalk towards me and talk about something else\u201D.",
        "The film cut to forty seconds and went out on WhatsApp three weeks before the wedding. It was forwarded more than the invitation was."
      ],
      cover: img("couple-river"),
      images: [
        { src: img("couple-river"), caption: "Yercaud, 6:50am" },
        { src: img("couple-portrait"), caption: "Portrait, first light" },
        { src: img("bride-sari"), caption: "Between takes" }
      ],
      featured: true
    },
    {
      id: "p-lakshmi-prashanth",
      title: "Lakshmi & Prashanth",
      slug: "lakshmi-and-prashanth",
      category: "Weddings",
      location: "Chennai",
      year: "2025",
      client: "Mylapore, Chennai",
      summary: "A morning wedding in Mylapore with a bride in heavy gold, a very small hall, and no room to move \u2014 which turned out to be the point.",
      body: [
        "Small halls are harder than big ones. There is no second angle, no long lens across the room. We worked close with a 35mm and let the family crowd into the frame, because that crowd is what the day actually looked like.",
        "The candids from the queue outside the hall are the ones the couple asked for prints of."
      ],
      cover: img("bride-gold"),
      images: [
        { src: img("bride-gold"), caption: "Lakshmi, before the muhurtham" },
        { src: img("decor-detail"), caption: "Hall florals" },
        { src: img("getting-ready"), caption: "Jewellery, 5:50am" }
      ],
      featured: false
    },
    {
      id: "p-sowmya-dinesh",
      title: "Sowmya & Dinesh",
      slug: "sowmya-and-dinesh",
      category: "Reception",
      location: "Coimbatore",
      year: "2024",
      client: "Green Park, Coimbatore",
      summary: "A hotel ballroom reception with a chandelier the size of a car, photographed mostly by its own candlelight.",
      body: [
        "Hotel ballrooms are lit for dinner, not for photographs, and we rarely use flash during a reception. The answer here was to shoot the room before the guests, at 1/30th, and then work the tables with a fast prime."
      ],
      cover: img("ritual-fire"),
      images: [
        { src: img("ritual-fire"), caption: "The ballroom, before the doors opened" },
        { src: img("reception-decor"), caption: "The lawn, later that evening" },
        { src: img("couple-portrait"), caption: "Portrait by the entrance" }
      ],
      featured: false
    },
    {
      id: "p-anitha-gokul",
      title: "Anitha & Gokul",
      slug: "anitha-and-gokul",
      category: "Weddings",
      location: "Namakkal",
      year: "2024",
      client: "Anandha Bhavan, Namakkal",
      summary: "A traditional muhurtham photographed almost entirely on one 85mm, from the far side of a very crowded hall.",
      body: [
        "The family wanted traditional coverage with very little interruption, so we stayed out of the centre and worked long. The compression of the 85mm turned a crowded hall into a series of small, quiet moments."
      ],
      cover: img("bride-sari"),
      images: [
        { src: img("bride-sari"), caption: "Anitha, between rituals" },
        { src: img("bride-gold"), caption: "The bride\u2019s side of the mandapam" },
        { src: img("hands-ring"), caption: "Hands, mid-ceremony" }
      ],
      featured: false
    },
    {
      id: "p-varsha-naveen",
      title: "Varsha & Naveen",
      slug: "varsha-and-naveen",
      category: "Destination",
      location: "Puducherry",
      year: "2026",
      client: "Villa Shanti, Puducherry",
      summary: "Three days in a French-quarter villa: mehendi on the terrace, a courtyard muhurtham, and a Sunday morning swim before the flight home.",
      body: [
        "Destination weeks are mostly logistics. We arrived a day early to walk the light, shot the mehendi at golden hour on the terrace, and kept the ceremony coverage tight because the courtyard seated sixty and the family was eighty.",
        "The album runs in three chapters \u2014 terrace, courtyard, sea \u2014 and it is the only one we have designed with a colour spine."
      ],
      cover: img("couple-portrait"),
      images: [
        { src: img("couple-portrait"), caption: "Villa Shanti courtyard, 5:30pm" },
        { src: img("couple-river"), caption: "The morning after" },
        { src: img("muhurtham-canopy"), caption: "The courtyard mandapam" }
      ],
      featured: true
    },
    {
      id: "p-harini-ashwin",
      title: "Harini & Ashwin",
      slug: "harini-and-ashwin",
      category: "Engagement",
      location: "Salem",
      year: "2025",
      client: "Fairlands, Salem",
      summary: "A small engagement at home, shot in the front room with the doors open and the whole street invited.",
      body: [
        "Home functions are the least predictable and the most fun. There is no stage, no lighting rig and no schedule \u2014 just a family, a ring, and a lot of food being carried through the frame."
      ],
      cover: img("getting-ready"),
      images: [
        { src: img("getting-ready"), caption: "Harini, getting ready at home" },
        { src: img("bride-gold"), caption: "The ring exchange" },
        { src: img("decor-detail"), caption: "The front room, dressed for the morning" }
      ],
      featured: false
    },
    {
      id: "p-priyanka-manoj",
      title: "Priyanka & Manoj",
      slug: "priyanka-and-manoj",
      category: "Weddings",
      location: "Tiruchengode",
      year: "2026",
      client: "Sri Ayyappan Mahal, Tiruchengode",
      summary: "A dawn muhurtham, a hall dressed in marigold, and a bride who asked for exactly three posed photographs.",
      body: [
        "She meant it. Three posed photographs, everything else candid. We spent the extra time on the details instead \u2014 the garlands, the thali plate, her mother\u2019s hands \u2014 and those frames ended up running across the album."
      ],
      cover: img("decor-detail"),
      images: [
        { src: img("decor-detail"), caption: "Marigold and brass, 6:10am" },
        { src: img("muhurtham-canopy"), caption: "The mandapam at sunrise" },
        { src: img("reception-decor"), caption: "The hall, ready" }
      ],
      featured: false
    },
    {
      id: "p-deepa-sanjay",
      title: "Deepa & Sanjay",
      slug: "deepa-and-sanjay",
      category: "Reception",
      location: "Bengaluru",
      year: "2025",
      client: "The Leela, Bengaluru",
      summary: "A reception for two families who live in three cities, and a stage that only came together forty minutes before doors.",
      body: [
        "Reception stages are built late and photographed early. We arrived with the florists, shot the stage while it was still being wired, and came back for the family portraits the moment it was finished."
      ],
      cover: img("hands-ring"),
      images: [
        { src: img("hands-ring"), caption: "The rings, before the doors" },
        { src: img("ritual-fire"), caption: "The ballroom, 6:40pm" },
        { src: img("couple-grass"), caption: "The two of them, outside" }
      ],
      featured: false
    }
  ]
};
var services = [
  {
    title: "Full wedding day",
    text: "Two photographers from the getting-ready rooms to the last guest at the reception. Muhurtham, lunch, evening function \u2014 600 to 900 edited frames.",
    image: img("hero-muhurtham")
  },
  {
    title: "Muhurtham only",
    text: "Four to five hours of ceremony coverage for families who only need the wedding itself, delivered as a 250-frame set.",
    image: img("muhurtham-canopy")
  },
  {
    title: "Reception & stage",
    text: "The evening: stage, garlands, speeches, the cousin who planned a dance. We work around the video team without blocking them.",
    image: img("reception-decor")
  },
  {
    title: "Engagement / nischayathartham",
    text: "A three-hour family function with quick portraits of both families and the ring exchange \u2014 usually delivered inside a week.",
    image: img("couple-grass")
  },
  {
    title: "Pre-wedding & save-the-date",
    text: "Half a day at a location you like \u2014 Yercaud, Kodaikanal, a beach \u2014 plus a forty-second save-the-date film for WhatsApp.",
    image: img("couple-river")
  },
  {
    title: "Albums, prints & films",
    text: "Hand-bound 12\xD712 albums made in Chennai, parent copies, framed prints and a three to five minute highlight film.",
    image: img("bride-gold")
  }
];

// src/server/app.ts
var SESSION_COOKIE = "yp_studio";
var SESSION_DAYS = 7;
var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
var enc = new TextEncoder();
var str = (v, max = 400) => typeof v === "string" ? v.trim().slice(0, max) : "";
var asRecord = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : null;
var asImage = (v, fallback) => {
  const s = str(v, 500);
  return s.startsWith("/") || s.startsWith("http") ? s : fallback;
};
async function readSite(store) {
  try {
    const row = await store.getSite();
    if (row) return { site: JSON.parse(row), source: "db" };
  } catch (error) {
    console.error("site read failed", error);
  }
  try {
    await store.putSite(JSON.stringify(defaultSite));
  } catch (error) {
    console.error("site seed failed", error);
  }
  return { site: defaultSite, source: "default" };
}
async function writeSite(store, site) {
  await store.putSite(JSON.stringify(site));
}
function secretOf(options) {
  return options.sessionSecret || "yugan-local-session";
}
async function hmac(secret, payload) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  return btoa(String.fromCharCode(...sig)).replace(/=+$/, "");
}
function same(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function readCookie(header, name) {
  if (!header) return "";
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return "";
}
async function isAdmin(headers, options) {
  const raw = readCookie(headers.get("cookie") ?? void 0, SESSION_COOKIE) || (headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const parts = raw.split(".");
  if (parts.length !== 3) return false;
  const [tag, expires, sig] = parts;
  if (tag !== "studio") return false;
  const expected = await hmac(secretOf(options), `${tag}.${expires}`);
  const expiry = Number(expires);
  return same(sig, expected) && Number.isFinite(expiry) && expiry > Date.now();
}
var unauthorized = (c) => c.json({ error: "Sign in to the studio first." }, 401);
function slugify(input, fallback) {
  const slug = input.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  return slug || fallback;
}
function sanitizeProject(input, i) {
  const p = asRecord(input) ?? {};
  const title = str(p.title, 90) || `Untitled set ${i + 1}`;
  const category = CATEGORIES.includes(str(p.category)) ? str(p.category) : "Weddings";
  const images = Array.isArray(p.images) ? p.images.slice(0, 24).map((img2, j) => {
    const r = asRecord(img2) ?? {};
    return { src: asImage(r.src, ""), caption: str(r.caption, 160) || `Photograph ${j + 1}` };
  }).filter((img2) => img2.src) : [];
  return {
    id: str(p.id, 60) || `p-${i}-${Date.now().toString(36)}`,
    title,
    slug: slugify(str(p.slug, 60) || title, `set-${i + 1}`),
    category,
    location: str(p.location, 80) || "Salem",
    year: str(p.year, 8) || String((/* @__PURE__ */ new Date()).getFullYear()),
    client: str(p.client, 120),
    summary: str(p.summary, 320),
    body: Array.isArray(p.body) ? p.body.slice(0, 12).map((para) => str(para, 2500)).filter(Boolean) : [],
    cover: asImage(p.cover, defaultSite.hero.image),
    images,
    featured: p.featured === true
  };
}
function sanitizeSite(input) {
  const b = asRecord(input) ?? {};
  const hero = asRecord(b.hero) ?? {};
  const about = asRecord(b.about) ?? {};
  const contact = asRecord(b.contact) ?? {};
  const projects = Array.isArray(b.projects) ? b.projects.slice(0, 60).map(sanitizeProject).map((p, i, all) => {
    const clash = all.findIndex((x) => x.slug === p.slug) !== i;
    return clash ? { ...p, slug: `${p.slug}-${i + 1}` } : p;
  }) : defaultSite.projects;
  const facts = Array.isArray(about.facts) ? about.facts.slice(0, 20).map((f, i) => {
    const r = asRecord(f) ?? {};
    return { label: str(r.label, 40) || `Fact ${i + 1}`, value: str(r.value, 120) };
  }) : defaultSite.about.facts;
  const approach = Array.isArray(about.approach) ? about.approach.slice(0, 12).map((a, i) => {
    const r = asRecord(a) ?? {};
    return { title: str(r.title, 80) || `Step ${i + 1}`, text: str(r.text, 600) };
  }) : defaultSite.about.approach;
  const bio = Array.isArray(about.bio) ? about.bio.slice(0, 12).map((para) => str(para, 2500)).filter(Boolean) : defaultSite.about.bio;
  return {
    brand: str(b.brand, 80) || defaultSite.brand,
    photographer: str(b.photographer, 80) || defaultSite.photographer,
    tagline: str(b.tagline, 160) || defaultSite.tagline,
    hero: {
      image: asImage(hero.image, defaultSite.hero.image),
      alt: str(hero.alt, 200) || defaultSite.hero.alt,
      eyebrow: str(hero.eyebrow, 160) || defaultSite.hero.eyebrow,
      lineOne: str(hero.lineOne, 80) || defaultSite.hero.lineOne,
      lineTwo: str(hero.lineTwo, 80) || defaultSite.hero.lineTwo,
      sub: str(hero.sub, 600) || defaultSite.hero.sub,
      note: str(hero.note, 160) || defaultSite.hero.note
    },
    about: {
      portrait: asImage(about.portrait, defaultSite.about.portrait),
      standfirst: str(about.standfirst, 500) || defaultSite.about.standfirst,
      bio,
      facts,
      approach
    },
    contact: {
      email: str(contact.email, 120) || defaultSite.contact.email,
      phone: str(contact.phone, 40) || defaultSite.contact.phone,
      whatsapp: str(contact.whatsapp, 20).replace(/\D/g, "") || defaultSite.contact.whatsapp,
      instagram: str(contact.instagram, 60).replace(/^@/, "") || defaultSite.contact.instagram,
      address: str(contact.address, 200) || defaultSite.contact.address,
      hours: str(contact.hours, 120) || defaultSite.contact.hours,
      note: str(contact.note, 500) || defaultSite.contact.note,
      mapUrl: asImage(contact.mapUrl, defaultSite.contact.mapUrl)
    },
    projects
  };
}
function createApp(options) {
  const app2 = new Hono();
  const { store } = options;
  app2.get("/api/health", (c) => c.json({ ok: true, storage: store.driver }));
  app2.get("/api/site", async (c) => {
    const { site, source } = await readSite(store);
    return c.json({ site, source }, 200, { "cache-control": "no-store" });
  });
  app2.get("/api/auth", async (c) => c.json({ admin: await isAdmin(c.req.raw.headers, options) }));
  app2.post("/api/auth", async (c) => {
    const body = asRecord(await c.req.json().catch(() => null)) ?? {};
    const passcode = str(body.passcode, 120);
    const expected = options.adminPasscode || "yugan2026";
    if (!same(passcode, expected)) {
      await new Promise((r) => setTimeout(r, 350));
      return c.json({ error: "That passcode is not right." }, 401);
    }
    const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1e3;
    const payload = `studio.${expires}`;
    const token2 = `${payload}.${await hmac(secretOf(options), payload)}`;
    const secure = new URL(c.req.url).protocol === "https:" ? "; Secure" : "";
    return c.json({ admin: true }, 200, {
      "set-cookie": `${SESSION_COOKIE}=${token2}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DAYS * 86400}${secure}`,
      "cache-control": "no-store"
    });
  });
  app2.post(
    "/api/auth/logout",
    (c) => c.json({ admin: false }, 200, { "set-cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0` })
  );
  app2.put("/api/admin/site", async (c) => {
    if (!await isAdmin(c.req.raw.headers, options)) return unauthorized(c);
    const body = await c.req.json().catch(() => null);
    if (!asRecord(body)) return c.json({ error: "Send the site as JSON." }, 400);
    const site = sanitizeSite(body);
    await writeSite(store, site);
    return c.json({ site }, 200, { "cache-control": "no-store" });
  });
  app2.post("/api/admin/site/reset", async (c) => {
    if (!await isAdmin(c.req.raw.headers, options)) return unauthorized(c);
    await writeSite(store, defaultSite);
    return c.json({ site: defaultSite }, 200, { "cache-control": "no-store" });
  });
  app2.post("/api/admin/media", async (c) => {
    if (!await isAdmin(c.req.raw.headers, options)) return unauthorized(c);
    const form = await c.req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) return c.json({ error: "Choose an image to upload." }, 400);
    if (!file.type.startsWith("image/")) return c.json({ error: "Only image files can be uploaded." }, 415);
    if (file.size > 10 * 1024 * 1024) return c.json({ error: "Keep images under 10 MB." }, 413);
    const ext = (file.name.split(".").pop() ?? "webp").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "webp";
    const key = `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    await store.putMedia?.(key, await file.arrayBuffer(), file.type);
    return c.json({ url: `/media/${key}` }, 201);
  });
  if (options.generateUploadToken) {
    app2.post("/api/admin/media/upload", async (c) => {
      if (!await isAdmin(c.req.raw.headers, options)) return unauthorized(c);
      const body = await c.req.json().catch(() => null);
      const result = await options.generateUploadToken({ request: c.req.raw, body });
      return c.json(result);
    });
  }
  const serveMedia = async (c) => {
    const key = decodeURIComponent(c.req.path.replace(/^(\/api)?\/media\//, ""));
    if (!key || key.includes("..")) return Response.json({ error: "Not found" }, { status: 404 });
    const object = await store.getMedia(key);
    if (!object) return Response.json({ error: "Not found" }, { status: 404 });
    return new Response(object.stream, {
      headers: {
        "content-type": object.contentType,
        etag: object.etag,
        "cache-control": "public, max-age=31536000, immutable"
      }
    });
  };
  app2.get("/media/*", serveMedia);
  app2.get("/api/media/*", serveMedia);
  app2.post("/api/contact", async (c) => {
    const body = asRecord(await c.req.json().catch(() => null));
    if (!body) return c.json({ error: "Send the brief as JSON." }, 400);
    const fields = {};
    const name = str(body.name, 80);
    const email = str(body.email, 160);
    const phone = str(body.phone, 40);
    const projectType = str(body.projectType, 40);
    const location = str(body.location, 100);
    const timeline = str(body.timeline, 60);
    const budget = str(body.budget, 60);
    const message = str(body.message, 4e3);
    if (name.length < 2) fields.name = "Your name, so I know who is writing.";
    if (!EMAIL.test(email)) fields.email = "A working email address.";
    if (phone && phone.replace(/\D/g, "").length < 8) fields.phone = "Include the country or STD code.";
    if (![...CATEGORIES, "Other"].includes(projectType)) fields.projectType = "Pick the closest wedding function.";
    if (location.length < 2) fields.location = "The city or site is enough.";
    if (message.length < 10) fields.message = "A sentence or two about the project, please.";
    if (Object.keys(fields).length) return c.json({ error: "Check the highlighted fields.", fields }, 422);
    await store.addMessage({
      id: crypto.randomUUID(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      name,
      email,
      phone,
      projectType,
      location,
      timeline,
      budget,
      message
    });
    const reference = `YP-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    return c.json({ reference }, 201);
  });
  app2.get("/api/admin/messages", async (c) => {
    if (!await isAdmin(c.req.raw.headers, options)) return unauthorized(c);
    return c.json({ messages: await store.listMessages() }, 200, { "cache-control": "no-store" });
  });
  app2.delete("/api/admin/messages/:id", async (c) => {
    if (!await isAdmin(c.req.raw.headers, options)) return unauthorized(c);
    await store.deleteMessage(c.req.param("id"));
    return c.json({ ok: true });
  });
  app2.all("/api/*", (c) => c.json({ error: "Not found" }, 404));
  if (options.serveAsset) {
    app2.all("*", (c) => options.serveAsset(c.req.raw));
  }
  app2.onError((err, c) => {
    console.error("api error", err);
    return c.json({ error: "Something broke on the studio side." }, 500);
  });
  return app2;
}

// src/server/vercel.ts
import { del, get, list, put } from "@vercel/blob";
import { handleUpload } from "@vercel/blob/client";
var SITE_KEY = "data/site.json";
var MESSAGES_KEY = "data/messages.json";
var MEDIA_PREFIX = "media/";
var token = () => process.env.BLOB_READ_WRITE_TOKEN;
async function readJson(key, fallback) {
  try {
    const result = await get(key, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) return fallback;
    const text = await new Response(result.stream).text();
    return JSON.parse(text);
  } catch (error) {
    console.error(`blob read failed: ${key}`, error);
    return fallback;
  }
}
async function writeJson(key, value) {
  await put(key, JSON.stringify(value), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60
  });
}
function vercelStore() {
  return {
    driver: "blob",
    async getSite() {
      try {
        const result = await get(SITE_KEY, { access: "private", useCache: false });
        if (!result || result.statusCode !== 200) return null;
        return await new Response(result.stream).text();
      } catch (error) {
        console.error("blob site read failed", error);
        return null;
      }
    },
    async putSite(data) {
      await writeJson(SITE_KEY, JSON.parse(data));
    },
    async addMessage(message) {
      const messages = await readJson(MESSAGES_KEY, []);
      messages.unshift(message);
      await writeJson(MESSAGES_KEY, messages);
    },
    async listMessages() {
      const messages = await readJson(MESSAGES_KEY, []);
      return messages.slice(0, 200);
    },
    async deleteMessage(id) {
      const messages = await readJson(MESSAGES_KEY, []);
      await writeJson(
        MESSAGES_KEY,
        messages.filter((message) => message.id !== id)
      );
    },
    async getMedia(key) {
      const result = await get(`${MEDIA_PREFIX}${key}`, { access: "private" });
      if (!result || result.statusCode !== 200) return null;
      return {
        stream: result.stream,
        contentType: result.blob.contentType ?? "application/octet-stream",
        etag: result.blob.etag
      };
    }
  };
}
async function generateUploadToken({ request, body }) {
  return handleUpload({
    token: token(),
    request,
    body,
    onBeforeGenerateToken: async (pathname) => {
      if (!pathname.startsWith(MEDIA_PREFIX)) throw new Error("Uploads must live under media/.");
      return {
        allowedContentTypes: ["image/*"],
        maximumSizeInBytes: 10 * 1024 * 1024,
        addRandomSuffix: false,
        allowOverwrite: false
      };
    }
  });
}

// src/server/vercel-entry.ts
var app = createApp({
  store: vercelStore(),
  adminPasscode: process.env.ADMIN_PASSCODE,
  sessionSecret: process.env.SESSION_SECRET,
  generateUploadToken
});
var fetch = (request) => app.fetch(request);
export {
  fetch
};
