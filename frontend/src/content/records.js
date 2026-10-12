const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const clean = (v) => String(v ?? '').trim();

export const isCurrent = (r) => Boolean(clean(r?.start)) && !clean(r?.end);

export const periodOf = (r) => {
  const start = clean(r?.start);
  const end = clean(r?.end);
  if (!start && !end) return null;
  if (!start) return end;
  if (!end) return `${start} - Present`;
  return start === end ? start : `${start} - ${end}`;
};

/* Sortable month index from `start` (or `end`), null when undated. */
export const startKey = (r) => {
  const text = clean(r?.start) || clean(r?.end);
  const year = /\b(19|20)\d{2}\b/.exec(text);
  if (!year) return null;
  const head = text.slice(0, year.index).toLowerCase();
  const month = MONTHS.findIndex(m => head.includes(m));
  return Number(year[0]) * 12 + (month >= 0 ? month : 0);
};
