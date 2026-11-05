// GitHub topics sorted into where a project runs, how it ships, how it is built and where it keeps data.
const GROUPS = [
  {
    key: 'runs',
    terms: {
      aws: 'AWS', 'aws-lambda': 'AWS Lambda', lambda: 'AWS Lambda', ec2: 'AWS EC2', heroku: 'Heroku',
      firebase: 'Firebase', 'google-cloud': 'Google Cloud', gcp: 'Google Cloud', 'cloud-run': 'Cloud Run',
      azure: 'Azure', vercel: 'Vercel', netlify: 'Netlify', 'github-pages': 'GitHub Pages',
      digitalocean: 'DigitalOcean', 'raspberry-pi': 'Raspberry Pi', linux: 'Linux', serverless: 'Serverless',
    },
  },
  {
    key: 'ships',
    terms: {
      docker: 'Docker', 'docker-compose': 'Docker Compose', kubernetes: 'Kubernetes', k8s: 'Kubernetes',
      helm: 'Helm', 'github-actions': 'GitHub Actions', 'ci-cd': 'CI/CD', cicd: 'CI/CD', terraform: 'Terraform',
      ansible: 'Ansible', nginx: 'Nginx', pytest: 'pytest', jest: 'Jest', vitest: 'Vitest', testing: 'Automated tests',
    },
  },
  {
    key: 'built',
    terms: {
      microservices: 'Microservices', monorepo: 'Monorepo', 'rest-api': 'REST API', api: 'API',
      'event-driven': 'Event-driven', 'real-time': 'Real-time', streaming: 'Streaming', 'data-pipeline': 'Data pipeline',
      etl: 'Data pipeline', cli: 'Command-line tool', pwa: 'Installable web app', spa: 'Single-page app',
      'machine-learning': 'Machine learning', 'full-stack': 'Full stack',
    },
  },
  {
    key: 'stores',
    terms: {
      postgresql: 'PostgreSQL', postgres: 'PostgreSQL', redis: 'Redis', mongodb: 'MongoDB', firestore: 'Firestore',
      sqlite: 'SQLite', mysql: 'MySQL', minio: 'MinIO', s3: 'AWS S3', dynamodb: 'DynamoDB',
    },
  },
];

const pretty = (t) => t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

// Returns the known groups that have entries, plus any other topics as plain extras.
export const platformOf = (topics = []) => {
  const seen = new Set();
  const groups = GROUPS.map(g => ({ key: g.key, items: [] }));
  const extras = [];
  topics.map(t => String(t).toLowerCase()).forEach((t) => {
    const at = GROUPS.findIndex(g => g.terms[t]);
    const label = at >= 0 ? GROUPS[at].terms[t] : pretty(t);
    if (seen.has(label)) return;
    seen.add(label);
    if (at >= 0) groups[at].items.push(label);
    else extras.push(label);
  });
  return { groups: groups.filter(g => g.items.length), extras };
};

// Every platform label a project has, used by the filter.
export const platformLabels = (topics = []) => platformOf(topics).groups.flatMap(g => g.items);
