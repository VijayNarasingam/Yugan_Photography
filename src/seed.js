import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './config.js';

function readMediaSeed() {
  const file = path.join(DATA_DIR, 'media.seed.json');
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    console.warn('[seed] data/media.seed.json not found — run `npm run prepare:images` first.');
    return {};
  }
}

export function buildSeedContent() {
  const mediaMap = readMediaSeed();
  const media = [...new Map(Object.values(mediaMap).map((item) => [item.id, item])).values()];
  const mediaId = (key) => mediaMap[key]?.id ?? null;

  const ref = (key, ratio = 'natural', focalX = 50, focalY = 50) => ({
    mediaId: mediaId(key),
    ratio,
    focalX,
    focalY,
  });

  const now = new Date().toISOString();

  const projects = [
    {
      id: 'p_heritage-mandap',
      slug: 'heritage-mandap',
      title: 'Heritage Mandap',
      category: 'Wedding',
      year: '2025',
      location: 'Jaipur, Rajasthan',
      summary: 'A heritage wedding under cascading marigolds and jasmine.',
      description:
        'Heritage Mandap is a celebration of tradition framed by light. The ceremony unfolded beneath a canopy of marigold and jasmine garlands, with warm golden light filtering through the drapes. We photographed the couple through every ritual — the exchange of garlands, the sacred fire, and the quiet moments between the vows.\n\nThe bride wore a hand-embroidered red lehenga with heritage gold jewellery, while the groom stood in a cream sherwani and a peach turban. Every frame holds the colour, the emotion, and the stillness that lives inside a big Indian wedding.',
      cover: ref('hero-mandap', '2/3'),
      galleryId: 'g_heritage-mandap',
      featured: true,
      visible: true,
      order: 1,
    },
    {
      id: 'p_golden-hour',
      slug: 'golden-hour',
      title: 'Golden Hour',
      category: 'Portrait',
      year: '2025',
      location: 'Udaipur, Rajasthan',
      summary: 'Couple portraits as the sun sets over the lake.',
      description:
        'Golden Hour is a portrait series made in the last light of the day. We met the couple by the lake in Udaipur as the sun began to dip behind the hills, painting everything in amber and rose.\n\nThe series is about the quiet intimacy between two people when the noise of the day has settled. No stiff poses, no performance — just the couple, the light, and the space between them. The groom\u2019s cream sherwani glows against the water, and the bride\u2019s red dupatta catches the breeze like a flame.',
      cover: ref('couple-01', '2/3'),
      galleryId: 'g_golden-hour',
      featured: true,
      visible: true,
      order: 2,
    },
    {
      id: 'p_sangeet-night',
      slug: 'sangeet-night',
      title: 'Sangeet Night',
      category: 'Celebration',
      year: '2024',
      location: 'Delhi, India',
      summary: 'Music, dance, and colour before the big day.',
      description:
        'Sangeet Night captures the energy of the pre-wedding celebration — the dancing, the laughter, and the family coming together before the ceremony.\n\nWe photographed the couple on the dance floor, the family performances, and the bursts of colour from every outfit in the room. The sangeet is where the wedding truly begins to breathe, and this series holds that movement and joy in still frames.',
      cover: ref('sangeet-01', '3/2'),
      galleryId: 'g_sangeet-night',
      featured: true,
      visible: true,
      order: 3,
    },
    {
      id: 'p_still-details',
      slug: 'still-details',
      title: 'Still Details',
      category: 'Details',
      year: '2024',
      location: 'Jaipur, Rajasthan',
      summary: 'The quiet objects that hold the day together.',
      description:
        'Still Details is a study of the small things — the rings beside the bouquet, the mehndi on a hand, the jewellery laid out before the ceremony.\n\nThese photographs are made slowly, in quiet corners where the noise of the day cannot reach. They are the anchors of the wedding story, the objects the couple will look back on and remember exactly how the day felt.',
      cover: ref('detail-bouquet', '4/5'),
      galleryId: 'g_still-details',
      featured: false,
      visible: true,
      order: 4,
    },
    {
      id: 'p_heritage-portraits',
      slug: 'heritage-portraits',
      title: 'Heritage Portraits',
      category: 'Portrait',
      year: '2024',
      location: 'Jaipur, Rajasthan',
      summary: 'The bride and groom in full ceremonial dress.',
      description:
        'Heritage Portraits is a formal series of the couple in their full wedding attire. The bride in her red lehenga and heritage jewellery, the groom in his sherwani and turban, standing together against the architecture of Jaipur.\n\nThese are the portraits that hang on walls and live in albums — the couple as they wish to be remembered, in full colour and full ceremony.',
      cover: ref('bride-portrait', '4/5'),
      galleryId: 'g_heritage-portraits',
      featured: false,
      visible: true,
      order: 5,
    },
  ];

  const galleries = [
    {
      id: 'g_heritage-mandap',
      slug: 'heritage-mandap',
      title: 'Heritage Mandap',
      description: 'Jaipur wedding ceremony, 2025.',
      createdAt: now,
      photos: [
        photo('ph_mandap_01', 'hero-mandap', 'Bride and groom under a flower mandap at the wedding ceremony.', 'Ceremony, late afternoon', '2/3', 1),
        photo('ph_mandap_02', 'ceremony-01', 'Bride and groom seated by the sacred fire during the ceremony.', 'Sacred fire ritual', '3/2', 2),
        photo('ph_mandap_03', 'ritual-hands', 'Close-up of hands and offerings during the wedding ritual.', 'Ritual details', '3/2', 3),
        photo('ph_mandap_04', 'bride-sindoor', 'Bride with sindoor and heritage jewellery during the ceremony.', 'Bride, ceremonial', '2/3', 4),
      ],
    },
    {
      id: 'g_golden-hour',
      slug: 'golden-hour',
      title: 'Golden Hour',
      description: 'Couple portraits, Udaipur, 2025.',
      createdAt: now,
      photos: [
        photo('ph_golden_01', 'couple-01', 'Bride and groom embracing at night with warm bokeh lights.', 'Golden hour portrait', '2/3', 1),
        photo('ph_golden_02', 'couple-veil', 'Bride and groom close together under a golden veil at night.', 'Night portrait', '2/3', 2),
        photo('ph_golden_03', 'couple-bokeh', 'Bride and groom posing with glowing bokeh lights behind them.', 'Bokeh portrait', '2/3', 3),
      ],
    },
    {
      id: 'g_sangeet-night',
      slug: 'sangeet-night',
      title: 'Sangeet Night',
      description: 'Pre-wedding celebration, Delhi, 2024.',
      createdAt: now,
      photos: [
        photo('ph_sangeet_01', 'sangeet-01', 'Bride and groom dancing at the sangeet ceremony with family.', 'Sangeet dance floor', '3/2', 1),
        photo('ph_sangeet_02', 'sangeet-a', 'Bride dancing during the sangeet ceremony in a yellow outfit.', 'Bride dancing', '3/2', 2),
        photo('ph_sangeet_03', 'dance-01', 'Couple dancing at the wedding reception celebration.', 'Reception dance', '3/2', 3),
      ],
    },
    {
      id: 'g_still-details',
      slug: 'still-details',
      title: 'Still Details',
      description: 'Wedding details and objects, Jaipur, 2024.',
      createdAt: now,
      photos: [
        photo('ph_detail_01', 'detail-bouquet', 'Wedding rings beside a bridal bouquet of white roses.', 'Rings and bouquet', '4/5', 1),
        photo('ph_detail_02', 'detail-mehndi', 'Close-up of mehndi patterns on a hand during the ceremony.', 'Mehndi detail', '2/3', 2),
        photo('ph_detail_03', 'rings-01', 'Wedding rings on a white surface beside a floral bouquet.', 'Rings detail', '2/3', 3),
      ],
    },
    {
      id: 'g_heritage-portraits',
      slug: 'heritage-portraits',
      title: 'Heritage Portraits',
      description: 'Bride and groom portraits, Jaipur, 2024.',
      createdAt: now,
      photos: [
        photo('ph_portrait_01', 'bride-portrait', 'Bride in a red lehenga and heritage jewellery, eyes closed.', 'Bride portrait', '4/5', 1),
        photo('ph_portrait_02', 'groom-01', 'Groom in a cream sherwani and peach turban outdoors.', 'Groom portrait', '2/3', 2),
        photo('ph_portrait_03', 'groom-02', 'Groom portrait in traditional wedding attire.', 'Groom portrait', '2/3', 3),
        photo('ph_portrait_04', 'bride-veil', 'Bride portrait with traditional jewellery and a red veil.', 'Bride portrait', '4/5', 4),
      ],
    },
  ];

  function photo(id, key, alt, caption, ratio, order) {
    return {
      id,
      mediaId: mediaId(key),
      alt,
      caption,
      ratio,
      focalX: 50,
      focalY: 50,
      order,
    };
  }

  return {
    version: 1,
    updatedAt: now,
    site: {
      name: 'Yugan Photography',
      role: 'Wedding Photographer',
      location: 'Jaipur, Rajasthan',
      email: 'yuganphotography@gmail.com',
      phone: '+91 98765 43210',
      availability: 'Booking weddings for 2026 & 2027',
      footerNote: 'Jaipur, Rajasthan. Available for destination weddings across India.',
      metaDescription:
        'Yugan Photography — Ajit Kumar is a Jaipur-based wedding photographer capturing Indian weddings with natural light, emotion, and quiet observation.',
      socials: [
        { id: 's_instagram', label: 'Instagram', handle: 'yugan.photography', url: 'https://instagram.com/yugan.photography' },
        { id: 's_facebook', label: 'Facebook', handle: 'yuganphotography', url: 'https://facebook.com/yuganphotography' },
      ],
    },
    home: {
      hero: {
        eyebrow: 'Jaipur · Wedding Photography',
        title: 'Yugan Photography',
        statement: 'Indian weddings, captured in natural light and quiet emotion.',
        ctaLabel: 'View selected work',
        image: ref('hero-mandap', '2/3', 50, 40),
      },
      intro: {
        kicker: 'A practice of attention',
        title: 'The quiet moments of your big day.',
        body: 'I photograph Indian weddings with patience and natural light — the rituals, the colour, and the quiet emotion between the celebrations. Working mostly in Jaipur and across Rajasthan, I make images that feel less like a record and more like a memory.',
        image: ref('portrait-ajit', '3/2', 50, 55),
      },
      quote: {
        text: 'A wedding is not just a day — it is a lifetime of moments held still in a single frame.',
        attribution: 'Ajit Kumar',
      },
      testimonials: [
        {
          quote: 'Ajit photographed our wedding like a member of the family — present, patient, and completely unobtrusive. When the photographs arrived, we saw moments we had missed entirely.',
          names: 'Meera & Arjun',
          context: 'Heritage wedding, Jaipur',
        },
        {
          quote: 'The pictures feel like the day actually felt. Nothing staged, nothing rushed — just the light, the people, and the small details we wanted to remember.',
          names: 'Sana & Rohan',
          context: 'Destination wedding, Udaipur',
        },
        {
          quote: 'He understood our families, the rituals, and the rhythm of the day. The album is the first thing we show anyone who visits.',
          names: 'Priya & Karan',
          context: 'Sangeet & ceremony, Jodhpur',
        },
      ],
      cta: {
        title: 'Planning your wedding?',
        body: 'Let\u2019s capture your ceremony, your celebrations, and the quiet moments in between.',
        linkLabel: 'Start a conversation',
        image: ref('reception-01', '3/2'),
      },
    },
    about: {
      kicker: 'About the studio',
      title: 'Ajit Kumar — Wedding Photographer',
      lead: 'I am a wedding photographer based in Jaipur, Rajasthan, working across India. My work is rooted in natural light, patient observation, and the quiet choreography of a wedding day.',
      portrait: ref('portrait-ajit', '4/5', 50, 35),
      bio: [
        'Born and raised in Jaipur, I grew up watching weddings fill the city with colour, music, and light. I studied visual communication before assisting a wedding studio, where I learned to work slowly and to trust the frame. Since 2016 I have photographed Indian weddings independently.',
        'My photographs tend to begin with a moment: the bride adjusting her veil, the groom waiting by the mandap, a parent\u2019s quiet smile during the pheras. I spend time before making pictures, waiting for the light to settle and for the day to reveal itself.',
        'I work with natural light wherever possible, and with a small, quiet crew when a wedding calls for one. The result is work that feels intimate, unhurried, and alive to its own moment.',
      ],
      approach: [
        {
          title: 'Presence',
          body: 'I build in time. A portrait is better when no one is performing, and a ceremony reveals itself only after the first hour.',
        },
        {
          title: 'Natural light',
          body: 'The sun, a window, a white wall. I prefer to shape what is already there rather than recreate it.',
        },
        {
          title: 'Collaboration',
          body: 'The best images come from trust. I keep crews small, conversations open, and the process human.',
        },
      ],
      experience: [
        { years: '2016 — Present', role: 'Wedding Photographer', place: 'Jaipur' },
        { years: '2013 — 2016', role: 'Studio Photographer', place: 'Atelier Nord, Copenhagen' },
        { years: '2011 — 2013', role: 'Studio Assistant', place: 'Marta Silva Studio, Porto' },
        { years: '2007 — 2011', role: 'BA Visual Communication', place: 'University of Rajasthan, Jaipur' },
      ],
      highlights: {
        clients: ['Heritage Weddings Jaipur', 'Royal Rajasthan Events', 'Golden Hour Weddings', 'Desert Bloom Ceremonies', 'Marigold & Jasmine'],
        publications: ['Wed Me Good', 'The Wedding Brigade', 'Shaadi Saga', 'Bride & Groom India'],
        awards: ['Wedding Photographer of the Year — Rajasthan, 2025', 'Best Candid Wedding Series — Finalist, 2024'],
        services: [
          'Indian wedding photography',
          'Pre-wedding & engagement portraits',
          'Destination weddings across India',
          'Sangeet & mehendi coverage',
          'Wedding film & highlight edits',
        ],
      },
    },
    contact: {
      kicker: 'Contact',
      title: 'Let\u2019s plan your wedding.',
      invitation:
        'For wedding bookings, pre-wedding shoots, or a conversation about your big day — write to me. I answer every note personally, usually within two working days.',
      image: ref('contact-image', '4/5', 50, 50),
      formNote: 'Your details stay with me. No lists, no forwarding.',
      projectTypes: [
        'Wedding photography',
        'Pre-wedding shoot',
        'Destination wedding',
        'Sangeet & mehendi',
        'Something else',
      ],
    },
    projects,
    galleries,
    media,
  };
}
