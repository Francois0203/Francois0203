/**
 * Overlays admin-saved overrides onto the in-code defaults, so a page renders
 * identically until something is edited. An empty override falls back.
 */
export const resolveGroup = (fields = [], overrides = {}) => {
  const out = {};
  for (const f of fields) {
    const ov = overrides?.[f.key];
    out[f.key] = (typeof ov === 'string' && ov.trim() !== '') ? ov : f.default;
  }
  return out;
};
