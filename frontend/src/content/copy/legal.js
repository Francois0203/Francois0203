import { LEGAL_UPDATED, privacyPolicy, termsOfUse } from '../legal';

// Turns a policy into the plain text the admin edits.
const toText = (doc) => doc.sections.map(s => [
  `## ${s.heading}`,
  ...s.blocks.map(b => (Array.isArray(b) ? b.map(item => `- ${item}`).join('\n') : b)),
].join('\n\n')).join('\n\n');

const privacy = privacyPolicy({ email: '{email}' });
const terms = termsOfUse({ email: '{email}' });
const FORMAT = 'Use ## for a heading, - for a bullet, [text](link) for a link and {email} for your address';

export const LEGAL_FIELDS = [
  { key: 'updated', label: 'Date last changed (change it whenever the meaning changes)', type: 'text', default: LEGAL_UPDATED },
  { key: 'updatedLabel', label: 'Word before the date', type: 'text', default: 'updated' },
  { key: 'seeAlso', label: 'Words before the link to the other page', type: 'text', default: 'See also the' },

  { key: 'privacyTitle', label: 'Privacy - title', type: 'text', default: privacy.title },
  { key: 'privacyIntro', label: 'Privacy - intro', type: 'textarea', default: privacy.intro },
  { key: 'privacyBody', label: `Privacy - policy text. ${FORMAT}`, type: 'textarea', default: toText(privacy), rows: 24 },
  { key: 'privacyOther', label: 'Privacy - name of the terms link', type: 'text', default: 'terms of use' },

  { key: 'termsTitle', label: 'Terms - title', type: 'text', default: terms.title },
  { key: 'termsIntro', label: 'Terms - intro', type: 'textarea', default: terms.intro },
  { key: 'termsBody', label: `Terms - text. ${FORMAT}`, type: 'textarea', default: toText(terms), rows: 24 },
  { key: 'termsOther', label: 'Terms - name of the privacy link', type: 'text', default: 'privacy policy' },
];

// Reads the plain text back into sections for the page.
export const parseLegal = (text = '', email = '') => {
  const sections = [];
  let current = null;
  String(text).replaceAll('{email}', email).split(/\n\s*\n/).forEach((chunk) => {
    const block = chunk.trim();
    if (!block) return;
    if (block.startsWith('## ')) {
      current = { heading: block.slice(3).trim(), blocks: [] };
      sections.push(current);
      return;
    }
    if (!current) {
      current = { heading: '', blocks: [] };
      sections.push(current);
    }
    const lines = block.split('\n').map(l => l.trim());
    if (lines.every(l => l.startsWith('- '))) current.blocks.push(lines.map(l => l.slice(2)));
    else current.blocks.push(lines.join(' '));
  });
  return sections;
};
