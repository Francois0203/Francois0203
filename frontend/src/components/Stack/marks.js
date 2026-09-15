import {
  SiPython, SiR, SiPandas, SiNumpy, SiScikitlearn, SiDjango, SiReact,
  SiJavascript, SiTypescript, SiPostgresql, SiDocker, SiKubernetes, SiRedis,
  SiAmazonwebservices, SiFirebase, SiGit, SiGithubactions, SiLinux, SiNginx,
  SiHtml5, SiCss3, SiNodedotjs, SiGo,
} from 'react-icons/si';
import {
  MdShowChart, MdInsights, MdPsychology, MdStorage, MdArchitecture,
  MdScience, MdGroups, MdTerminal, MdFunctions, MdEditNote,
} from 'react-icons/md';

/*
 * Skill name to mark. Skills are free text in Firestore, so this is a
 * lookup rather than an import, and only about two thirds of them are
 * products with a logo. Matching falls back to a substring pass, so "AWS"
 * and "Amazon Web Services" land on the same mark.
 */

const EXACT = {
  python: SiPython,
  r: SiR,
  pandas: SiPandas,
  numpy: SiNumpy,
  'scikit-learn': SiScikitlearn,
  sklearn: SiScikitlearn,
  django: SiDjango,
  react: SiReact,
  javascript: SiJavascript,
  typescript: SiTypescript,
  postgresql: SiPostgresql,
  postgres: SiPostgresql,
  docker: SiDocker,
  kubernetes: SiKubernetes,
  redis: SiRedis,
  aws: SiAmazonwebservices,
  firebase: SiFirebase,
  git: SiGit,
  linux: SiLinux,
  nginx: SiNginx,
  html: SiHtml5,
  css: SiCss3,
  node: SiNodedotjs,
  'node.js': SiNodedotjs,
  go: SiGo,
  golang: SiGo,
};

/* Checked in order, so the more specific phrase wins. */
const CONTAINS = [
  ['amazon', SiAmazonwebservices],
  ['github action', SiGithubactions],
  ['scikit', SiScikitlearn],
  ['postgre', SiPostgresql],
  ['statistic', MdShowChart],
  ['model', MdInsights],
  ['machine learning', MdPsychology],
  ['visualis', MdShowChart],
  ['visualiz', MdShowChart],
  ['analy', MdInsights],
  ['data', MdStorage],
  ['architect', MdArchitecture],
  ['research', MdScience],
  ['team', MdGroups],
  ['collab', MdGroups],
  ['communicat', MdGroups],
  ['writ', MdEditNote],
  ['script', MdTerminal],
  ['shell', MdTerminal],
  ['bash', MdTerminal],
];

export const markFor = (name) => {
  const key = String(name).trim().toLowerCase();
  if (EXACT[key]) return EXACT[key];
  for (const [needle, Icon] of CONTAINS) {
    if (key.includes(needle)) return Icon;
  }
  return MdFunctions;
};
