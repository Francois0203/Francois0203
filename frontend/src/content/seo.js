// The title, description and share card for each page.
export const SITE_URL = 'https://francois-portfolio.web.app';
export const SITE_NAME = 'Francois Meiring';
export const SITE_IMAGE = '/logo.png';

export const SHARE_IMAGE = '/og/home.jpg';
export const SHARE_ALT = 'Francois Meiring, DevOps and Software Engineer';

export const PAGE_META = [
  {
    path: '/',
    file: 'index.html',
    title: 'Francois Meiring | DevOps and Software Engineer',
    description: 'I keep websites and apps running smoothly behind the scenes, and I build websites for small businesses. DevOps and software engineering in Centurion.',
  },
  {
    path: '/bio',
    file: 'bio.html',
    title: 'Bio | Francois Meiring',
    description: 'The longer story: roles, qualifications, certifications and skills, with a downloadable CV.',
    image: '/og/bio.jpg',
  },
  {
    path: '/projects',
    file: 'projects.html',
    title: 'Projects | Francois Meiring',
    description: 'Live client sites and open source repositories built and shipped by Francois Meiring.',
    image: '/og/projects.jpg',
  },
  {
    path: '/connect',
    file: 'connect.html',
    title: 'Connect | Francois Meiring',
    description: 'Get in touch with Francois Meiring by letter, or find him on LinkedIn and GitHub.',
    image: '/og/connect.jpg',
  },
  {
    path: '/privacy',
    file: 'privacy.html',
    title: 'Privacy policy | Francois Meiring',
    description: 'What this site collects, why, how long it is kept, and your rights under POPIA and the GDPR.',
  },
  {
    path: '/terms',
    file: 'terms.html',
    title: 'Terms of use | Francois Meiring',
    description: 'The terms for using this site: ownership, trademarks, acceptable use, liability and governing law.',
  },
];

// Pages that must never be indexed. They still get their own file so the noindex is in the HTML.
export const PRIVATE_META = [
  { path: '/admin', file: 'admin.html', title: 'Admin | Francois Meiring', noindex: true },
];

export const NOT_FOUND_META = { file: '404.html', title: 'Not found | Francois Meiring', noindex: true };

export const metaFor = (pathname) =>
  [...PAGE_META, ...PRIVATE_META].find(p => p.path === pathname) ?? NOT_FOUND_META;

export const absoluteUrl = (path) => new URL(path, SITE_URL).href;

export const PERSON_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE_NAME,
  url: SITE_URL,
  image: absoluteUrl(SITE_IMAGE),
  jobTitle: 'Software Developer',
  address: { '@type': 'PostalAddress', addressLocality: 'Centurion', addressCountry: 'ZA' },
  sameAs: [
    'https://github.com/Francois0203',
    'https://www.linkedin.com/in/francois-meiring',
    'https://orcid.org/0009-0004-7605-0618',
  ],
};
