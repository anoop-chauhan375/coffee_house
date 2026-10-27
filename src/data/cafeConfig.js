/**
 * BULAND COFFEE HOUSE — single source of truth for editable content.
 *
 * Business details (address, hours, phone, Instagram, map link) are clearly
 * marked PLACEHOLDERS. Replace them with verified information before launch.
 */

const IMG_ENDPOINT = 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image';

/**
 * Builds an art-directed image URL for a given scene description.
 * `size` accepts: square_hd | square | portrait_4_3 | portrait_16_9 | landscape_4_3 | landscape_16_9
 */
export const image = (prompt, size = 'portrait_4_3') =>
  `${IMG_ENDPOINT}?prompt=${encodeURIComponent(prompt)}&image_size=${size}`;

/* ------------------------------------------------------------------ brand */

export const brand = {
  name: 'BULAND COFFEE HOUSE',
  wordmark: 'BULAND',
  city: 'Jalandhar',
  region: 'Punjab, India',
  tagline: 'Rise above.',
  established: 'JALANDHAR',
};

/* -------------------------------------------------------------------- nav */

export const navLinks = [
  { id: 'menu', label: 'Menu', index: '01' },
  { id: 'craft', label: 'Our Craft', index: '02' },
  { id: 'experience', label: 'The Experience', index: '03' },
  { id: 'visit', label: 'Find Us', index: '04' },
];

/* ------------------------------------------------------------------- hero */

export const hero = {
  eyebrow: 'JALANDHAR • CRAFTED WITH PASSION',
  headlineLead: 'Rise above.',
  headlineTail: 'Sip something extraordinary.',
  supporting: "Great coffee isn't rushed. It's crafted, poured, and perfected.",
  primaryCta: { label: 'Explore the Menu', target: 'menu' },
  secondaryCta: { label: 'Our Coffee Story', target: 'craft' },
  scrollHint: 'Scroll to brew',
  pourCta: 'Watch the pour',
  verticalNote: 'ESPRESSO · MILK · ART',
  beansLabel: 'Beans ground today',
};

/* -------------------------------------------------------------- coffee lab */

export const lab = {
  label: 'SECTION 02 — THE COFFEE LAB',
  headlineLead: 'Not just coffee.',
  headlineTail: 'A little bit of alchemy.',
  supporting:
    'From the first crack of a roasted bean to the final swirl of milk, every detail changes the experience.',
  stages: [
    { id: 'grind', label: 'The Grind', note: 'Burrs set fine, dosed to the gram.' },
    { id: 'extraction', label: 'The Extraction', note: 'Nine bars, twenty-eight seconds.' },
    { id: 'pour', label: 'The Pour', note: 'Milk stretched to a glossy microfoam.' },
    { id: 'finish', label: 'The Finish', note: 'A single line drawn through the art.' },
  ],
};

/* ------------------------------------------------------- coffee story */

export const story = {
  label: 'SECTION 04 — COFFEE IN SLOW MOTION',
  words: ['ROASTED.', 'BREWED.', 'REMEMBERED.'],
  caption: 'A bean, a grind, a pour — the whole story in one slow breath.',
};

/* ------------------------------------------- lifestyle (section five) */

export const lifestyle = {
  label: 'SECTION 05 — YOUR COFFEE, YOUR MOMENT',
  headline: ['Your coffee,', 'your moment.'],
  supporting: 'Every cup earns its own little pause.',
  photos: [
    { id: 'cup', phrase: 'Slow mornings.', alt: 'Close-up of a warm coffee cup', prompt: 'Close-up of a warm ceramic coffee cup with steam, on a dark wooden table', size: 'portrait_4_3', span: 'wide' },
    { id: 'pastry', phrase: 'One more sip.', alt: 'Top-down coffee and pastry', prompt: 'Top-down flat lay of coffee and a pastry on a rustic table', size: 'square', span: 'tall' },
    { id: 'beans', phrase: 'Coffee worth pausing for.', alt: 'Coffee beans on a wooden surface', prompt: 'Roasted coffee beans spilling across a wooden surface', size: 'landscape_4_3', span: 'normal' },
    { id: 'art', phrase: 'Made for your moment.', alt: 'Close-up of latte art', prompt: 'Close-up of rosetta latte art in a ceramic cup from above', size: 'square', span: 'normal' },
    { id: 'book', phrase: 'A quiet corner.', alt: 'Coffee cup beside an open book', prompt: 'A coffee cup beside an open book on a calm table, soft daylight', size: 'portrait_4_3', span: 'tall' },
    { id: 'iced', phrase: 'Cold and slow.', alt: 'Iced coffee with condensation', prompt: 'Iced coffee in a tall glass with ice and condensation', size: 'landscape_4_3', span: 'wide' },
  ].map((item) => ({ ...item, src: image(item.prompt, item.size) })),
};

/* -------------------------------------------------- brand experience */

export const experience = {
  label: 'SECTION 06 — THE BULAND EXPERIENCE',
  ring: 'GOOD COFFEE • GOOD COMPANY • GOOD DAYS • ',
  statements: [
    'A place to recharge.',
    'A reason to stay longer.',
    'A cup worth coming back for.',
  ],
};

/* -------------------------------------------------------- visit / find us */

export const visit = {
  label: 'SECTION 07 — FIND YOUR WAY TO BULAND',
  headlineLead: 'Your next coffee',
  headlineTail: 'is closer than you think.',
  location: 'Buland Coffee House, Jalandhar',
  details: [
    { id: 'address', label: 'Address', value: 'PLACEHOLDER — complete address, Jalandhar, Punjab, India' },
    { id: 'hours', label: 'Opening Hours', value: 'PLACEHOLDER — e.g. 8:00 AM – 11:00 PM, daily' },
    { id: 'phone', label: 'Contact', value: 'PLACEHOLDER — +91 00000 00000' },
    { id: 'instagram', label: 'Instagram', value: 'PLACEHOLDER — @bulandcoffeehouse' },
  ],
  mapLink: 'https://www.google.com/maps/search/?api=1&query=Buland+Coffee+House+Jalandhar',
  instagramLink: 'https://www.instagram.com/',
  primaryCta: { label: 'Get Directions' },
  secondaryCta: { label: 'Follow Our Journey' },
};

/* --------------------------------------------------------------- footer */

export const footer = {
  tagline: 'Brewed slowly in Jalandhar.',
  links: navLinks,
  social: { label: 'Instagram', href: 'https://www.instagram.com/', value: 'PLACEHOLDER — @bulandcoffeehouse' },
  contact: { label: 'Contact', value: 'PLACEHOLDER — +91 00000 00000' },
  copyright: `© ${new Date().getFullYear()} Buland Coffee House, Jalandhar. All rights reserved.`,
};
