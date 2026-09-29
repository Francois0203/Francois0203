/* Dev-only fixtures.
   Firestore does not resolve under Chrome's virtual time budget, so the live
   pages screenshot as skeletons. These stand in for the real documents so a
   page can be looked at in its loaded state. Shapes match what
   firebase/firestore.js hands back, not what is stored. */

export const contentValue = {
  data: {
    personal: {
      name: 'Francois Meiring',
      photoUrl: '',
      summary: 'I work on the side of software that gets it into production and keeps it running: containers, CI/CD pipelines and the cloud underneath them. In my previous role I was one of two developers who built three enterprise systems from nothing and took them to production on Docker and Kubernetes, with GitHub CI/CD, Nginx, PostgreSQL, Redis and MinIO behind them. At Shareforce I work on a Django platform deployed across Heroku and AWS, including the pipelines it ships through. I am working through the AWS certifications, from Cloud Practitioner toward DevOps Engineer Professional, and alongside the job I am reading for an MSc in Computer Science on distributed computing for astronomical data processing.',
      languages: ['Afrikaans', 'English'],
    },
    contact: {
      email: 'francoismeiring0203@gmail.com',
      phone: '+27 82 431 7705',
      location: 'Centurion, South Africa',
      availability: { status: 'open' },
    },
    social: [
      { key: 'github', platform: 'GitHub', url: 'https://github.com/Francois0203' },
      { key: 'linkedin', platform: 'LinkedIn', url: 'https://linkedin.com/in/' },
    ],
    donation: { enabled: true, link: 'https://example.com/support', message: 'If something here helped you, this keeps it going.', buttonText: '' },
    skills: {
      categories: [
        { name: 'Cloud and platform', items: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'Nginx', 'Heroku', 'Firebase'] },
        { name: 'Delivery', items: ['GitHub Actions', 'CI/CD', 'Git', 'npm'] },
        { name: 'Data stores', items: ['PostgreSQL', 'Redis', 'MinIO'] },
        { name: 'Building', items: ['Python', 'Django', 'Node.js', 'JavaScript', 'React'] },
        { name: 'Working', items: ['Microservices', 'System Architecture', 'Team Collaboration'] },
      ],
    },
    interests: ['Guitar', 'Gym', 'Hiking', 'Squash'],
    experience: [
      {
        id: 'shareforce', company: 'Shareforce', role: 'Junior Software Developer',
        period: 'May 2026 - Present', order: 0,
        description: 'Core equity management platform. Deployment pipelines, a system refactor, feature design and production defects.',
        tags: ['Django', 'Python', 'PostgreSQL', 'Redis', 'Heroku', 'AWS', 'CI/CD'],
      },
      {
        id: 'aquatico', company: 'Aquatico', role: 'Full Stack Software Developer',
        period: 'January 2025 - April 2026', order: 1,
        description: 'Replaced the company\'s operational software with microservices on Docker and Kubernetes.',
        tags: ['Docker', 'Kubernetes', 'GitHub CI/CD', 'Nginx', 'Node.js', 'React'],
      },
    ],
    education: [
      { id: 'msc', institution: 'North-West University', degree: 'MSc', field: 'Computer Science', period: '2026 - Present', order: 0 },
      { id: 'hons', institution: 'North-West University', degree: 'BSc Hons', field: 'Computer Science', period: '2024', order: 1 },
    ],
    certifications: [
      { id: 'naui', credential: 'NAUI Open Water Scuba Diver', issuer: 'National Association of Underwater Instructors', start: 'Jun 2026', end: 'does not expire', order: 100 },
      { id: 'fire-marshal', credential: 'Fire Marshal', issuer: 'AETA Training Solutions', status: 'earned', start: '4 Aug 2026', end: '3 Aug 2028', description: 'Trained to conduct basic firefighting.', order: 101 },
      { id: 'aws-clf-c02', credential: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', code: 'CLF-C02', level: 'Foundational', status: 'booked', order: 0 },
      { id: 'aws-saa-c03', credential: 'AWS Certified Solutions Architect - Associate', issuer: 'Amazon Web Services', code: 'SAA-C03', level: 'Associate', status: 'planned', order: 1 },
      { id: 'aws-soa-c03', credential: 'AWS Certified CloudOps Engineer - Associate', issuer: 'Amazon Web Services', code: 'SOA-C03', level: 'Associate', status: 'planned', order: 2 },
      { id: 'aws-dva-c02', credential: 'AWS Certified Developer - Associate', issuer: 'Amazon Web Services', code: 'DVA-C02', level: 'Associate', status: 'planned', order: 3 },
      { id: 'aws-dop-c02', credential: 'AWS Certified DevOps Engineer - Professional', issuer: 'Amazon Web Services', code: 'DOP-C02', level: 'Professional', status: 'planned', order: 4 },
    ],
  },
  loading: false,
  error: null,
  overrides: {},
  copyLoading: false,
  copy: () => ({}),
  projects: [
    { id: 'r1', name: 'starfield', description: 'Photometry pipeline for wide-field survey frames.', language: 'Python', stars: 12, url: 'https://github.com/' },
    { id: 'r2', name: 'captable-sim', description: 'Monte Carlo simulation of dilution across funding rounds.', language: 'Python', stars: 5, url: 'https://github.com/' },
    { id: 'r3', name: 'Francois0203', description: 'This site. React, Vite and Firestore.', language: 'JavaScript', stars: 3, url: 'https://github.com/' },
    { id: 'r4', name: 'nightly-sync', description: 'A small scheduler that keeps two databases in step.', language: 'Go', stars: 1, url: 'https://github.com/' },
  ],
  projectsLoading: false,
  projectsError: null,
  studioSites: [
    { id: 's1', name: 'Riverbend Dental', description: 'A booking-first site for a two-chair practice.', featured: true, order: 0, sites: [{ label: 'Live', url: 'https://example.com', embeddable: false, reachable: true }] },
    { id: 's2', name: 'Kloof Coffee', description: 'Menu, hours and a wholesale enquiry form.', featured: true, order: 1, sites: [{ label: 'Live', url: 'https://example.org', embeddable: false, reachable: true }] },
    { id: 's3', name: 'Meridian Survey', description: 'A portfolio of survey work with downloadable plans.', featured: true, order: 2, sites: [{ label: 'Live', url: 'https://example.net', embeddable: false, reachable: true }] },
  ],
  studioLoading: false,
  studioError: null,
  reload: () => {},
};
