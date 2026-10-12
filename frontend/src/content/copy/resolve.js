export const resolveGroup = (fields = [], overrides = {}) => {
  const out = {};
  for (const f of fields) {
    const ov = overrides?.[f.key];
    out[f.key] = (typeof ov === 'string' && ov.trim() !== '') ? ov : f.default;
  }
  return out;
};
