export const PROJECTS_FIELDS = [
  { key: 'eyebrow',  label: 'Hero - status chip', type: 'text', default: 'work' },
  { key: 'heading',  label: 'Hero - headline (italic in *asterisks*)', type: 'text', default: 'Things I have *built*.' },
  { key: 'lede',     label: 'Hero - positioning line', type: 'textarea', default: 'Client sites that are live today, and the repositories I work on in my own time.' },

  { key: 'studioTitle', label: 'Client work - headline (italic in *asterisks*)', type: 'text', default: 'Client *sites*.' },
  { key: 'studioLede',  label: 'Client work - lede', type: 'textarea', default: 'Websites I built for small businesses. Click one to visit it.' },
  { key: 'visitLabel', label: 'Client work - button on each site', type: 'text', default: 'Visit website' },
  { key: 'studioEmpty', label: 'Client work - empty state', type: 'textarea', default: 'No client sites are published yet.' },

  { key: 'codeTitle', label: 'Code section - headline (italic in *asterisks*)', type: 'text', default: 'Personal *projects*.' },
  { key: 'codeLede',  label: 'Code section - lede', type: 'textarea', default: 'Repositories, tools and experiments from my GitHub. Filter by language.' },
  { key: 'studioError', label: 'Client work - message when the sites could not load', type: 'text', default: 'The client sites could not be loaded. Refresh to try again.' },
  { key: 'codeError', label: 'Code section - message when the repositories could not load', type: 'text', default: 'The repositories could not be loaded. Refresh to try again.' },
  { key: 'filterAll', label: 'Code section - filter button for every language', type: 'text', default: 'All' },
  { key: 'readmeLabel', label: 'Code section - button that opens a readme', type: 'text', default: 'Read more' },
  { key: 'repoLabel', label: 'Code section - link to the repository', type: 'text', default: 'Open on GitHub' },
  { key: 'privateLabel', label: 'Code section - tag on a private repository', type: 'text', default: 'private' },
  { key: 'statSites', label: 'Hero - label under the number of live sites', type: 'text', default: 'live client sites' },
  { key: 'statRepos', label: 'Hero - label under the number of repositories', type: 'text', default: 'repositories' },
  { key: 'statLanguages', label: 'Hero - label under the number of languages', type: 'text', default: 'languages used' },
  { key: 'codeEmpty', label: 'Code section - empty state', type: 'text', default: 'No projects configured yet.' },
  { key: 'filterStatus', label: 'Language filter - result read aloud ({shown}, {total}, {language})', type: 'text', default: '{shown} of {total}, {language}' },
];
