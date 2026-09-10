/**
 * GitHub's own language colours.
 *
 * Extracted from Projects.js so the language bar and the per-card language dot
 * read from one table. They were about to drift: a colour added for a card
 * would otherwise be missing from the chart of the same data.
 *
 * The fallback is the brand accent rather than grey, so an unmapped language
 * still reads as part of the palette instead of as a broken value.
 */
export const LANG_COLORS = {
  JavaScript: '#f7df1e', TypeScript: '#3178c6', Python:  '#3572a5',
  Go:         '#00add8', Rust:       '#dea584', Java:    '#b07219',
  'C#':       '#178600', 'C++':      '#f34b7d', C:       '#555555',
  HTML:       '#e34c26', CSS:        '#563d7c', SCSS:    '#c6538c',
  Swift:      '#fa7343', Kotlin:     '#a97bff', Ruby:    '#701516',
  PHP:        '#4f5d95', Shell:      '#89e051', Dart:    '#00b4ab',
  R:          '#198ce7', Vue:        '#41b883', Svelte:  '#ff3e00',
  Jupyter:    '#da5b0b', 'Jupyter Notebook': '#da5b0b',
};

export const langColor = (lang) => LANG_COLORS[lang] ?? 'var(--accent-1)';
