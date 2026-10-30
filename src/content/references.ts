export const refs = [
  {
    id: 'openstax-intro',
    title: 'Astronomy 2e — The Nature of Astronomy',
    publisher: 'OpenStax, Rice University',
    url: 'https://openstax.org/books/astronomy-2e/pages/1-1-the-nature-of-astronomy',
  },
  {
    id: 'openstax-science',
    title: 'Astronomy 2e — The Nature of Science',
    publisher: 'OpenStax, Rice University',
    url: 'https://openstax.org/books/astronomy-2e/pages/1-2-the-nature-of-science',
  },
  {
    id: 'openstax-numbers',
    title: 'Astronomy 2e — Numbers in Astronomy',
    publisher: 'OpenStax, Rice University',
    url: 'https://openstax.org/books/astronomy-2e/pages/1-4-numbers-in-astronomy',
  },
  {
    id: 'openstax-history',
    title: 'Astronomy 2e — Ancient Astronomy',
    publisher: 'OpenStax, Rice University',
    url: 'https://openstax.org/books/astronomy-2e/pages/2-2-ancient-astronomy',
  },
  {
    id: 'openstax-modern',
    title: 'Astronomy 2e — The Birth of Modern Astronomy',
    publisher: 'OpenStax, Rice University',
    url: 'https://openstax.org/books/astronomy-2e/pages/2-4-the-birth-of-modern-astronomy',
  },
  {
    id: 'openstax-light',
    title: 'Astronomy 2e — Formation of Spectral Lines',
    publisher: 'OpenStax, Rice University',
    url: 'https://openstax.org/books/astronomy-2e/pages/5-5-formation-of-spectral-lines',
  },
  {
    id: 'openstax-distance',
    title: 'Astronomy 2e — Surveying the Stars',
    publisher: 'OpenStax, Rice University',
    url: 'https://openstax.org/books/astronomy-2e/pages/19-2-surveying-the-stars',
  },
  {
    id: 'nasa-universe',
    title: 'The Universe',
    publisher: 'NASA Science',
    url: 'https://science.nasa.gov/universe/',
  },
  {
    id: 'nasa-solar',
    title: 'Solar System Exploration',
    publisher: 'NASA Science',
    url: 'https://science.nasa.gov/solar-system/',
  },
  {
    id: 'nasa-stars',
    title: 'Stars',
    publisher: 'NASA Science',
    url: 'https://science.nasa.gov/universe/stars/',
  },
  {
    id: 'nasa-blackholes',
    title: 'Black Holes',
    publisher: 'NASA Science',
    url: 'https://science.nasa.gov/universe/black-holes/',
  },
  {
    id: 'nasa-carina',
    title: 'Cosmic Cliffs in the Carina Nebula — NIRCam Image',
    publisher: 'NASA, ESA, CSA, STScI',
    url: 'https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/',
  },
];
export const moduleRefs: Record<number, string[]> = {
  1: ['openstax-intro', 'nasa-universe'],
  2: ['openstax-light', 'nasa-carina'],
  3: ['openstax-history', 'openstax-modern'],
  4: ['nasa-universe', 'openstax-intro'],
  5: ['nasa-solar', 'nasa-stars', 'nasa-blackholes'],
  6: ['openstax-science'],
  7: ['openstax-numbers', 'openstax-distance'],
  8: ['openstax-numbers', 'openstax-distance'],
};
