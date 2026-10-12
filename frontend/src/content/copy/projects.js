export const PROJECTS_FIELDS = [
  { key: 'eyebrow',  label: 'Hero - status chip', type: 'text', default: 'work' },
  { key: 'heading',  label: 'Hero - headline (italic in *asterisks*)', type: 'text', default: 'Things I have *built*.' },
  { key: 'lede',     label: 'Hero - positioning line', type: 'textarea', default: 'Client sites that are live today, and the repositories I work on in my own time.' },

  { key: 'studioTitle', label: 'Client work - headline (italic in *asterisks*)', type: 'text', default: 'Client *sites*.' },
  { key: 'studioLede',  label: 'Client work - lede', type: 'textarea', default: 'Sites I built for clients, running live. Pick one from the list and use it.' },
  { key: 'studioEmpty', label: 'Client work - empty state', type: 'textarea', default: 'No client sites are published yet.' },

  { key: 'codeTitle', label: 'Code section - headline (italic in *asterisks*)', type: 'text', default: 'Personal *projects*.' },
  { key: 'codeLede',  label: 'Code section - lede', type: 'textarea', default: 'Repositories, tools and experiments from my GitHub. Filter by language.' },
  { key: 'codeEmpty', label: 'Code section - empty state', type: 'text', default: 'No projects configured yet.' },
];
