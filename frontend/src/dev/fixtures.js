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
      summary: 'I work on the infrastructure side of software: containers, pipelines, and the platforms teams actually run on. At Aquatico I was one of two developers who built three enterprise systems from nothing, and I took them to production on Docker and Kubernetes with GitHub CI/CD, Nginx, PostgreSQL, Redis and MinIO behind them. Before that I led several university projects end to end.',
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
    donation: { enabled: false },
    skills: {
      categories: [
        { name: 'Platform and DevOps', items: ['Docker', 'Kubernetes', 'Linux', 'Nginx', 'GitHub CI/CD', 'Git', 'PostgreSQL', 'Redis', 'MinIO'] },
        { name: 'Building', items: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'HTML5', 'CSS3'] },
        { name: 'Leading the work', items: ['Project Management', 'System Architecture', 'Team Collaboration', 'Technical Writing'] },
        { name: 'Data and analysis', items: ['R', 'SAS', 'Statistical Modelling', 'Data Visualisation', 'Machine Learning', 'NumPy', 'Research'] },
      ],
    },
    interests: ['Guitar', 'Gym', 'Hiking', 'Squash'],
    experience: [
      {
        id: 'shareforce', company: 'Shareforce', role: 'Data Scientist',
        period: 'May 2026 - Present', order: 0,
        description: 'Maintaining and extending the main enterprise system alongside senior and intermediate developers.',
        tech: ['Python', 'PostgreSQL', 'Git'],
      },
      {
        id: 'aquatico', company: 'Aquatico', role: 'Software Developer',
        period: 'January 2025 - April 2026', order: 1,
        description: 'Three enterprise systems built from nothing, then taken to production on Docker and Kubernetes.',
        tech: ['React', 'Node.js', 'Docker', 'Kubernetes', 'Nginx'],
      },
      {
        id: 'studio', company: 'FM Web Studio', role: 'Founder',
        period: 'During Matric Year', order: 2,
        description: 'Client sites, start to finish.',
      },
    ],
    education: [
      { id: 'msc', institution: 'North-West University', degree: 'MSc', field: 'Astronomical data processing', period: '2026 - Present', order: 0 },
      { id: 'bsc', institution: 'North-West University', degree: 'BSc', field: 'Information Technology', period: '2022 - 2025', order: 1 },
    ],
    certifications: [
      { id: 'c1', name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', period: '2025', order: 0 },
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
