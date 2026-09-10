import {
  SiPython, SiR, SiPostgresql, SiRedis, SiDocker, SiKubernetes, SiReact,
  SiNodedotjs, SiDjango, SiJavascript, SiHtml5, SiCss3, SiGit, SiGithubactions,
  SiLinux, SiNginx, SiMinio, SiNumpy, SiPandas, SiScikitlearn, SiHeroku,
  SiAmazonwebservices, SiFirebase,
} from 'react-icons/si';
import {
  MdShowChart, MdInsights, MdPsychology, MdStorage, MdArchitecture,
  MdScience, MdGroups, MdLayers, MdTerminal, MdFunctions,
} from 'react-icons/md';

/**
 * Skill name to icon and family.
 *
 * Two problems this solves. The skills live in Firestore as free text, so the
 * component cannot import an icon per skill - it has to look one up. And only
 * about two thirds of them are products with a logo: "Statistical Modelling"
 * and "Team Collaboration" have no brand mark, so they need a concept icon
 * rather than being dropped or rendered as a blank tile.
 *
 * `family` decides the colour, and it is the whole reason the palette gained a
 * cool scale:
 *
 *   data   analysis, statistics, modelling. Rendered cool.
 *   dev    languages, frameworks, infrastructure. Rendered warm.
 *   craft  the professional skills, which are neither. Rendered neutral.
 *
 * So the grid is not just decorative - the colour tells you which half of
 * "Data Scientist and Software Developer" a given skill belongs to.
 *
 * Keys are normalised (lowercase, non-alphanumerics stripped) so "Node.js",
 * "NodeJS" and "node js" all resolve, and Firestore can be edited freely
 * without breaking the lookup.
 */

export const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

const ENTRIES = [
  // ── data ──────────────────────────────────────────────────────────────────
  ['python', SiPython, 'data'],
  ['r', SiR, 'data'],
  ['sql', SiPostgresql, 'data'],
  ['numpy', SiNumpy, 'data'],
  ['pandas', SiPandas, 'data'],
  ['scikitlearn', SiScikitlearn, 'data'],
  ['sas', MdFunctions, 'data'],
  ['statisticalmodelling', MdShowChart, 'data'],
  ['statisticalmodeling', MdShowChart, 'data'],
  ['predictivemodelling', MdInsights, 'data'],
  ['predictivemodeling', MdInsights, 'data'],
  ['machinelearning', MdPsychology, 'data'],
  ['datavisualisation', MdInsights, 'data'],
  ['datavisualization', MdInsights, 'data'],
  ['dataanalysis', MdShowChart, 'data'],

  // ── dev ───────────────────────────────────────────────────────────────────
  ['javascript', SiJavascript, 'dev'],
  ['react', SiReact, 'dev'],
  ['nodejs', SiNodedotjs, 'dev'],
  ['django', SiDjango, 'dev'],
  ['postgresql', SiPostgresql, 'dev'],
  ['redis', SiRedis, 'dev'],
  ['docker', SiDocker, 'dev'],
  ['kubernetes', SiKubernetes, 'dev'],
  ['nginx', SiNginx, 'dev'],
  ['minio', SiMinio, 'dev'],
  ['git', SiGit, 'dev'],
  ['githubcicd', SiGithubactions, 'dev'],
  ['githubactions', SiGithubactions, 'dev'],
  ['linux', SiLinux, 'dev'],
  ['html5', SiHtml5, 'dev'],
  ['css3', SiCss3, 'dev'],
  ['aws', SiAmazonwebservices, 'dev'],
  ['heroku', SiHeroku, 'dev'],
  ['firebase', SiFirebase, 'dev'],
  ['microservices', MdLayers, 'dev'],
  ['systemarchitecture', MdArchitecture, 'dev'],
  ['fullstackdevelopment', MdTerminal, 'dev'],

  // ── craft ─────────────────────────────────────────────────────────────────
  ['research', MdScience, 'craft'],
  ['statisticalthinking', MdFunctions, 'craft'],
  ['teamcollaboration', MdGroups, 'craft'],
];

const LOOKUP = new Map(ENTRIES.map(([k, Icon, family]) => [k, { Icon, family }]));

/** Anything unrecognised still gets a tile, so a new Firestore skill is never
 *  silently dropped from the grid. */
const FALLBACK = { Icon: MdStorage, family: 'craft' };

export const iconFor = (label) => LOOKUP.get(norm(label)) ?? FALLBACK;

export default iconFor;
