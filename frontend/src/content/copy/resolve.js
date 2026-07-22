/**
 * Site-copy resolver.
 *
 * Each page defines a list of editable fields:
 *   [{ key, label, type: 'text' | 'textarea', default: '…' }]
 *
 * `resolveGroup` overlays the admin-saved overrides for that page onto the
 * in-code defaults, so a page renders identically until something is edited.
 * An empty / whitespace-only override falls back to the default.
 */
export const resolveGroup = (fields = [], overrides = {}) => {
  const out = {};
  for (const f of fields) {
    const ov = overrides?.[f.key];
    out[f.key] = (typeof ov === 'string' && ov.trim() !== '') ? ov : f.default;
  }
  return out;
};
