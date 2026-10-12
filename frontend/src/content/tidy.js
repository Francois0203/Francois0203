const EM = /\s*\u2014\s*/g;
const EN_SPACED = /\s+\u2013\s+/g;
const EN = /\u2013/g;

const tidyText = (s) =>
  s.replace(EM, ', ').replace(EN_SPACED, ' - ').replace(EN, '-').replace(/,\s*,/g, ',');

const isUrlKey = (k) => /url|href|link|src/i.test(k);

export const tidy = (value, key = '') => {
  if (typeof value === 'string') return isUrlKey(key) ? value : tidyText(value);
  if (Array.isArray(value)) return value.map(v => tidy(v, key));
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = tidy(v, k);
    return out;
  }
  return value;
};
