/**
 * All the words, venues, dates and defaults for Yugan Photography.
 *
 * The live site is served from `defaultSite` until the studio (admin) saves a
 * change, after which the Worker's D1 row is the source of truth. Keep this
 * file free of browser APIs: the Worker imports it to seed the database.
 */

export const CATEGORIES = ['Weddings', 'Reception', 'Engagement', 'Pre-wedding', 'Destination'] as const
export type Category = (typeof CATEGORIES)[number]

export type Photo = { src: string; caption: string }

export type Project = {
  id: string
  title: string
  slug: string
  category: Category
  location: string
  year: string
  client: string
  summary: string
  body: string[]
  cover: string
  images: Photo[]
  featured: boolean
}

export type Fact = { label: string; value: string }
export type Approach = { title: string; text: string }

export type Site = {
  brand: string
  photographer: string
  tagline: string
  hero: {
    image: string
    alt: string
    eyebrow: string
    lineOne: string
    lineTwo: string
    sub: string
    note: string
  }
  about: {
    portrait: string
    standfirst: string
    bio: string[]
    facts: Fact[]
    approach: Approach[]
  }
  contact: {
    email: string
    phone: string
    whatsapp: string
    instagram: string
    address: string
    hours: string
    note: string
    mapUrl: string
  }
  projects: Project[]
}

const img = (name: string) => `/images/gallery/${name}.webp`

export const defaultSite: Site = {
  brand: 'Yugan Photography',
  photographer: 'Ajith Kumar',
  tagline: 'Wedding photography in Salem, Tamil Nadu',
  hero: {
    image: img('hero-muhurtham'),
    alt: 'A bride in a red and gold saree and a groom in white, garlanded and sitting together at their reception',
    eyebrow: 'Wedding photography · Salem, Tamil Nadu',
    lineOne: 'Your day,',
    lineTwo: 'held in light.',
    sub: 'Candid, unhurried wedding photography across Tamil Nadu — muhurtham mornings, reception evenings, and the small minutes in between that nobody planned.',
    note: '2027 dates open · Booking Dec 2026 — Jun 2027',
  },
  about: {
    portrait: img('portrait-ajith'),
    standfirst:
      'I photograph weddings the way they actually happen. No stopped ceremonies, no rehearsed smiles — just the two of you, your families, and whatever light turns up that day.',
    bio: [
      'I am Ajith Kumar. I grew up in Salem, studied architecture in Coimbatore, and photographed my cousin’s wedding in 2017 on a borrowed camera. By the end of that muhurtham I had stopped caring about buildings and started caring about the two minutes before the thaali is tied.',
      'Yugan Photography has been full time since 2019. We are a small team: I shoot, and a second photographer covers the other side of the hall so nothing important happens off-frame. Around 260 weddings so far — muhurthams in Salem and Namakkal, church weddings in Trichy, receptions in Coimbatore hotels, and a handful of destination weeks in Puducherry and Kodaikanal.',
      'The approach is candid first. The ceremony runs untouched, families are photographed quickly and kindly, and the couple portraits happen after the crowd has gone for lunch. Every wedding is backed up twice the same night and delivered with a hand-bound album you can hand to your grandchildren.',
    ],
    facts: [
      { label: 'Based in', value: 'Fairlands, Salem 636016' },
      { label: 'Shooting since', value: '2017' },
      { label: 'Coverage', value: 'Tamil Nadu, Bengaluru, destination' },
      { label: 'Team', value: 'Two photographers, one assistant' },
      { label: 'Gear', value: '2× Sony · 24–70, 35, 85mm' },
      { label: 'Languages', value: 'Tamil, English, a little Hindi' },
      { label: 'Albums', value: 'Hand-bound in Chennai' },
    ],
    approach: [
      {
        title: 'Two cameras, never one',
        text: 'The second photographer stays with the other family, so the groom’s side and the bride’s side both exist in the album. No re-enacting the garland exchange two weeks later.',
      },
      {
        title: 'The ceremony runs untouched',
        text: 'We never stop the muhurtham for a photograph. Two primes at the edge of the mandapam, and enough familiarity with the order of things to be in the right place before it happens.',
      },
      {
        title: 'Candid first, portraits after',
        text: 'Twenty unhurried minutes with the two of you once the hall empties. That is usually the only part of the day you will actually remember.',
      },
      {
        title: 'Backed up before I sleep',
        text: 'Two cards in camera, two drives at the studio the same night. Teaser in 48 hours, full gallery in three weeks, album proof at six.',
      },
    ],
  },
  contact: {
    email: 'hello@yuganphotography.in',
    phone: '+91 98430 00000',
    whatsapp: '919843000000',
    instagram: 'yugan.weddings',
    address: '12, Fairlands, Salem 636016, Tamil Nadu',
    hours: 'Mon–Sat · 9:00–18:00 IST',
    note: 'I take a limited number of weddings each month so every one gets a full edit. Dates are held with a 30% advance; travel outside Salem is quoted before booking.',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Fairlands+Salem+Tamil+Nadu',
  },
  projects: [
    {
      id: 'p-aishwarya-karthik',
      title: 'Aishwarya & Karthik',
      slug: 'aishwarya-and-karthik',
      category: 'Weddings',
      location: 'Salem',
      year: '2026',
      client: 'Sri Lakshmi Mahal, Salem',
      summary:
        'A four-hour muhurtham in a hall that was full of cousins by nine, and the two of them on a rose-covered couch by eleven.',
      body: [
        'The muhurtham was at 7:40am, which meant the getting-ready rooms were chaos at six and completely silent at half past. Karthik’s side arrived by the busload from Rasipuram; Aishwarya’s grandmother had been in the hall since five, straightening flowers nobody had asked her to straighten.',
        'We shot the ceremony from two corners of the mandapam and never stepped inside it. The reception portraits came later, on the couch, with the hall half-empty and both of them finally laughing at something their cousin said off-camera.',
      ],
      cover: img('hero-muhurtham'),
      images: [
        { src: img('hero-muhurtham'), caption: 'Aishwarya and Karthik, reception portraits, 11:10am' },
        { src: img('decor-detail'), caption: 'Mandapam florals, before the guests came in' },
        { src: img('hands-ring'), caption: 'The thaali, straight after the muhurtham' },
      ],
      featured: true,
    },
    {
      id: 'p-divya-surya',
      title: 'Divya & Surya',
      slug: 'divya-and-surya',
      category: 'Reception',
      location: 'Salem',
      year: '2026',
      client: 'Sattva Convention, Salem',
      summary:
        'Four hundred guests on a lawn, twelve chandeliers under a canopy, and a first dance that nobody had rehearsed.',
      body: [
        'The brief was simple: make a very large reception feel like a private one. We started at four, while the light was still soft and the tables were still empty, and stayed through the speeches until the last plate was cleared.',
        'The photograph they printed largest is not the stage shot. It is the two of them walking back through the empty tables at eleven, shoes off, holding one plate of food between them.',
      ],
      cover: img('reception-decor'),
      images: [
        { src: img('reception-decor'), caption: 'Lawn reception, 4:40pm' },
        { src: img('ritual-fire'), caption: 'The hall before the guests arrived' },
        { src: img('couple-grass'), caption: 'The two of them, last light' },
      ],
      featured: true,
    },
    {
      id: 'p-nandhini-vignesh',
      title: 'Nandhini & Vignesh',
      slug: 'nandhini-and-vignesh',
      category: 'Weddings',
      location: 'Erode',
      year: '2025',
      client: 'Karpagam Thirumana Mandapam, Erode',
      summary:
        'An open-air mandapam under a blue sky, a very punctual priest, and a family that filled the aisle before the bride did.',
      body: [
        'Outdoor muhurthams are a gamble in Tamil Nadu in June. This one got a clean sky for ninety minutes and rain twenty minutes after the thaali — which meant the portraits had to happen fast and the family groups had to happen under the canopy.',
        'We kept the coverage to the ceremony and the immediate family, and it is still one of the fullest albums we have delivered: 780 frames from five hours.',
      ],
      cover: img('muhurtham-canopy'),
      images: [
        { src: img('muhurtham-canopy'), caption: 'The mandapam, 9:20am' },
        { src: img('bride-sari'), caption: 'Nandhini, before the ceremony' },
        { src: img('getting-ready'), caption: 'The getting-ready room, 6:15am' },
      ],
      featured: true,
    },
    {
      id: 'p-keerthana-arun',
      title: 'Keerthana & Arun',
      slug: 'keerthana-and-arun',
      category: 'Engagement',
      location: 'Coimbatore',
      year: '2026',
      client: 'Palm Court, Coimbatore',
      summary:
        'A nischayathartham in the late afternoon: two families, one ring, and forty-five minutes of portraits on the lawn.',
      body: [
        'Engagements are short and entirely about the families, so the coverage is different from a wedding day. We photographed the ring exchange from the front, then pulled both sets of parents in for groups while the coffee went round.',
        'The portraits at the end took twenty minutes and produced the frame they used on the wedding invitation six months later.',
      ],
      cover: img('couple-grass'),
      images: [
        { src: img('couple-grass'), caption: 'Keerthana and Arun, garden portraits' },
        { src: img('couple-river'), caption: 'Walking back to the hall' },
        { src: img('hands-ring'), caption: 'The ring' },
      ],
      featured: true,
    },
    {
      id: 'p-meera-rohan',
      title: 'Meera & Rohan',
      slug: 'meera-and-rohan',
      category: 'Pre-wedding',
      location: 'Yercaud',
      year: '2025',
      client: 'Yercaud hills',
      summary:
        'A half day above the clouds for a save-the-date film, shot in the two hours before the mist closed in.',
      body: [
        'Pre-wedding shoots work best when nobody is performing. We drove up before dawn, walked to a viewpoint neither of them had seen, and shot for two hours with one lens and no direction beyond “walk towards me and talk about something else”.',
        'The film cut to forty seconds and went out on WhatsApp three weeks before the wedding. It was forwarded more than the invitation was.',
      ],
      cover: img('couple-river'),
      images: [
        { src: img('couple-river'), caption: 'Yercaud, 6:50am' },
        { src: img('couple-portrait'), caption: 'Portrait, first light' },
        { src: img('bride-sari'), caption: 'Between takes' },
      ],
      featured: true,
    },
    {
      id: 'p-lakshmi-prashanth',
      title: 'Lakshmi & Prashanth',
      slug: 'lakshmi-and-prashanth',
      category: 'Weddings',
      location: 'Chennai',
      year: '2025',
      client: 'Mylapore, Chennai',
      summary:
        'A morning wedding in Mylapore with a bride in heavy gold, a very small hall, and no room to move — which turned out to be the point.',
      body: [
        'Small halls are harder than big ones. There is no second angle, no long lens across the room. We worked close with a 35mm and let the family crowd into the frame, because that crowd is what the day actually looked like.',
        'The candids from the queue outside the hall are the ones the couple asked for prints of.',
      ],
      cover: img('bride-gold'),
      images: [
        { src: img('bride-gold'), caption: 'Lakshmi, before the muhurtham' },
        { src: img('decor-detail'), caption: 'Hall florals' },
        { src: img('getting-ready'), caption: 'Jewellery, 5:50am' },
      ],
      featured: false,
    },
    {
      id: 'p-sowmya-dinesh',
      title: 'Sowmya & Dinesh',
      slug: 'sowmya-and-dinesh',
      category: 'Reception',
      location: 'Coimbatore',
      year: '2024',
      client: 'Green Park, Coimbatore',
      summary:
        'A hotel ballroom reception with a chandelier the size of a car, photographed mostly by its own candlelight.',
      body: [
        'Hotel ballrooms are lit for dinner, not for photographs, and we rarely use flash during a reception. The answer here was to shoot the room before the guests, at 1/30th, and then work the tables with a fast prime.',
      ],
      cover: img('ritual-fire'),
      images: [
        { src: img('ritual-fire'), caption: 'The ballroom, before the doors opened' },
        { src: img('reception-decor'), caption: 'The lawn, later that evening' },
        { src: img('couple-portrait'), caption: 'Portrait by the entrance' },
      ],
      featured: false,
    },
    {
      id: 'p-anitha-gokul',
      title: 'Anitha & Gokul',
      slug: 'anitha-and-gokul',
      category: 'Weddings',
      location: 'Namakkal',
      year: '2024',
      client: 'Anandha Bhavan, Namakkal',
      summary:
        'A traditional muhurtham photographed almost entirely on one 85mm, from the far side of a very crowded hall.',
      body: [
        'The family wanted traditional coverage with very little interruption, so we stayed out of the centre and worked long. The compression of the 85mm turned a crowded hall into a series of small, quiet moments.',
      ],
      cover: img('bride-sari'),
      images: [
        { src: img('bride-sari'), caption: 'Anitha, between rituals' },
        { src: img('bride-gold'), caption: 'The bride’s side of the mandapam' },
        { src: img('hands-ring'), caption: 'Hands, mid-ceremony' },
      ],
      featured: false,
    },
    {
      id: 'p-varsha-naveen',
      title: 'Varsha & Naveen',
      slug: 'varsha-and-naveen',
      category: 'Destination',
      location: 'Puducherry',
      year: '2026',
      client: 'Villa Shanti, Puducherry',
      summary:
        'Three days in a French-quarter villa: mehendi on the terrace, a courtyard muhurtham, and a Sunday morning swim before the flight home.',
      body: [
        'Destination weeks are mostly logistics. We arrived a day early to walk the light, shot the mehendi at golden hour on the terrace, and kept the ceremony coverage tight because the courtyard seated sixty and the family was eighty.',
        'The album runs in three chapters — terrace, courtyard, sea — and it is the only one we have designed with a colour spine.',
      ],
      cover: img('couple-portrait'),
      images: [
        { src: img('couple-portrait'), caption: 'Villa Shanti courtyard, 5:30pm' },
        { src: img('couple-river'), caption: 'The morning after' },
        { src: img('muhurtham-canopy'), caption: 'The courtyard mandapam' },
      ],
      featured: true,
    },
    {
      id: 'p-harini-ashwin',
      title: 'Harini & Ashwin',
      slug: 'harini-and-ashwin',
      category: 'Engagement',
      location: 'Salem',
      year: '2025',
      client: 'Fairlands, Salem',
      summary:
        'A small engagement at home, shot in the front room with the doors open and the whole street invited.',
      body: [
        'Home functions are the least predictable and the most fun. There is no stage, no lighting rig and no schedule — just a family, a ring, and a lot of food being carried through the frame.',
      ],
      cover: img('getting-ready'),
      images: [
        { src: img('getting-ready'), caption: 'Harini, getting ready at home' },
        { src: img('bride-gold'), caption: 'The ring exchange' },
        { src: img('decor-detail'), caption: 'The front room, dressed for the morning' },
      ],
      featured: false,
    },
    {
      id: 'p-priyanka-manoj',
      title: 'Priyanka & Manoj',
      slug: 'priyanka-and-manoj',
      category: 'Weddings',
      location: 'Tiruchengode',
      year: '2026',
      client: 'Sri Ayyappan Mahal, Tiruchengode',
      summary:
        'A dawn muhurtham, a hall dressed in marigold, and a bride who asked for exactly three posed photographs.',
      body: [
        'She meant it. Three posed photographs, everything else candid. We spent the extra time on the details instead — the garlands, the thali plate, her mother’s hands — and those frames ended up running across the album.',
      ],
      cover: img('decor-detail'),
      images: [
        { src: img('decor-detail'), caption: 'Marigold and brass, 6:10am' },
        { src: img('muhurtham-canopy'), caption: 'The mandapam at sunrise' },
        { src: img('reception-decor'), caption: 'The hall, ready' },
      ],
      featured: false,
    },
    {
      id: 'p-deepa-sanjay',
      title: 'Deepa & Sanjay',
      slug: 'deepa-and-sanjay',
      category: 'Reception',
      location: 'Bengaluru',
      year: '2025',
      client: 'The Leela, Bengaluru',
      summary:
        'A reception for two families who live in three cities, and a stage that only came together forty minutes before doors.',
      body: [
        'Reception stages are built late and photographed early. We arrived with the florists, shot the stage while it was still being wired, and came back for the family portraits the moment it was finished.',
      ],
      cover: img('hands-ring'),
      images: [
        { src: img('hands-ring'), caption: 'The rings, before the doors' },
        { src: img('ritual-fire'), caption: 'The ballroom, 6:40pm' },
        { src: img('couple-grass'), caption: 'The two of them, outside' },
      ],
      featured: false,
    },
  ],
}

export const stats = [
  { value: 9, suffix: '', label: 'Years photographing weddings' },
  { value: 260, suffix: '+', label: 'Weddings covered' },
  { value: 30, suffix: '', label: 'Towns and cities' },
  { value: 48, suffix: '', label: 'Families who sent a friend' },
]

export const services = [
  {
    title: 'Full wedding day',
    text: 'Two photographers from the getting-ready rooms to the last guest at the reception. Muhurtham, lunch, evening function — 600 to 900 edited frames.',
    image: img('hero-muhurtham'),
  },
  {
    title: 'Muhurtham only',
    text: 'Four to five hours of ceremony coverage for families who only need the wedding itself, delivered as a 250-frame set.',
    image: img('muhurtham-canopy'),
  },
  {
    title: 'Reception & stage',
    text: 'The evening: stage, garlands, speeches, the cousin who planned a dance. We work around the video team without blocking them.',
    image: img('reception-decor'),
  },
  {
    title: 'Engagement / nischayathartham',
    text: 'A three-hour family function with quick portraits of both families and the ring exchange — usually delivered inside a week.',
    image: img('couple-grass'),
  },
  {
    title: 'Pre-wedding & save-the-date',
    text: 'Half a day at a location you like — Yercaud, Kodaikanal, a beach — plus a forty-second save-the-date film for WhatsApp.',
    image: img('couple-river'),
  },
  {
    title: 'Albums, prints & films',
    text: 'Hand-bound 12×12 albums made in Chennai, parent copies, framed prints and a three to five minute highlight film.',
    image: img('bride-gold'),
  },
]

export const process = [
  {
    step: '01',
    title: 'Enquiry',
    text: 'Send the date, the venue and how many functions. I reply within a working day with availability and a fixed quote.',
  },
  {
    step: '02',
    title: 'Call & timeline',
    text: 'Half an hour on the phone: muhurtham time, both families, the photographs that matter, and who will be there with keys.',
  },
  {
    step: '03',
    title: 'The day',
    text: 'Two photographers, the ceremony untouched, family groups in twenty minutes, couple portraits once the hall empties.',
  },
  {
    step: '04',
    title: 'Delivery',
    text: 'A thirty-frame teaser in 48 hours, the full gallery in three weeks, the album proof at six.',
  },
]

export const testimonials = [
  {
    quote:
      'Ajith and his second photographer were invisible during the muhurtham and still had every photograph we wanted. My mother has not stopped opening the album.',
    name: 'Aishwarya & Karthik',
    role: 'Married at Sri Lakshmi Mahal, Salem',
  },
  {
    quote:
      'Four hundred guests and a very tight timeline. He knew the hall better than the hall manager, and never once made us stand and pose in the middle of the ceremony.',
    name: 'Divya & Surya',
    role: 'Reception at Sattva Convention, Salem',
  },
  {
    quote:
      'The teaser arrived two days later while we were still unpacking gifts. Half our family had forwarded it before we did.',
    name: 'Nandhini & Vignesh',
    role: 'Married in Erode',
  },
]

export const clients = [
  'Sri Lakshmi Mahal',
  'Sattva Convention',
  'Karpagam Thirumana Mandapam',
  'Palm Court Coimbatore',
  'Green Park Coimbatore',
  'Villa Shanti Puducherry',
  'Anandha Bhavan Namakkal',
  'Yercaud Hill Resort',
  'Linework Events',
  'Nest & Nook Decor',
]

export const toolkit = [
  { label: 'Cameras', value: '2× Sony A7 IV' },
  { label: 'Lenses', value: '24–70mm f2.8 · 35mm f1.4 · 85mm f1.4' },
  { label: 'Light', value: 'Godox V1, bounced — no flash during the muhurtham' },
  { label: 'Film', value: '3–5 minute highlight, cut in-house' },
  { label: 'Backup', value: 'Dual cards, two drives, uploaded the same night' },
  { label: 'Albums', value: 'Hand-bound 12×12, made in Chennai' },
  { label: 'Team', value: 'Second photographer on every full day' },
]

export const timeline = [
  { year: '2017', text: 'First wedding: a cousin’s muhurtham, shot on a borrowed camera in Salem.' },
  { year: '2019', text: 'Yugan Photography goes full time; the first twenty weddings come from referrals.' },
  { year: '2022', text: 'A second photographer joins, and the hundredth wedding is covered.' },
  { year: '2025', text: 'Destination weeks in Puducherry and Kodaikanal; 250 weddings photographed.' },
  { year: '2026', text: 'Albums are hand-bound in Chennai, with parent copies as standard.' },
]

export const faq = [
  {
    q: 'How many photographs do we get?',
    a: 'A full day is 600–900 edited images; a muhurtham-only booking is around 250. Every frame is colour-corrected by hand and delivered in an online gallery you can share with the whole family.',
  },
  {
    q: 'Do you photograph both families?',
    a: 'Always. Two photographers means the bride’s side and the groom’s side are both covered — the getting-ready rooms, the welcome at the gate, the relatives who came from Singapore.',
  },
  {
    q: 'Candid or traditional?',
    a: 'Both, in that order. The ceremony is never stopped for a photograph. Formal family groups take about twenty minutes, and the couple portraits happen after the hall empties.',
  },
  {
    q: 'How far do you travel?',
    a: 'Anywhere in Tamil Nadu and Bengaluru, and destination weddings across India with travel at actual cost. Yercaud, Kodaikanal and Puducherry are regular trips.',
  },
  {
    q: 'When do we see the photographs?',
    a: 'A thirty-frame teaser within 48 hours for WhatsApp, the full gallery in three weeks, and the album proof at six weeks.',
  },
  {
    q: 'Is an album included?',
    a: 'Every full-day booking includes a hand-bound 12×12 album and one parent copy. Extra parent albums and framed prints are quoted separately.',
  },
  {
    q: 'How do we book a date?',
    a: 'A 30% advance holds the date and the balance is due on the wedding day. One page, fixed quote — no hidden travel or editing charges.',
  },
]
