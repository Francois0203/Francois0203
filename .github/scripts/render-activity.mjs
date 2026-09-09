/**
 * Renders the contribution history as two self-contained animated SVGs (light
 * and dark), plus a small stats strip, into ./dist for the `output` branch.
 *
 * Why generate them here instead of using github-readme-stats or
 * github-readme-activity-graph: those public instances are chronically
 * rate-limited (503) or out of quota (402), which shows up on the profile as a
 * broken image. This reads GitHub's own public contributions endpoint, needs no
 * token, and commits the result, so the README can never render a missing image.
 *
 * The animation is pure CSS inside the SVG. GitHub's image proxy passes the
 * bytes through untouched, so it plays when the README loads.
 */
import { mkdir, writeFile } from 'node:fs/promises';

const USER = process.env.GITHUB_USER || 'Francois0203';
const OUT = 'dist';

const THEMES = {
  light: {
    bg0: '#fdf6e3', bg1: '#f7eed8',
    text: '#2a1810', muted: '#8a6a4a', grid: '#e3d3b4',
    line: '#b8651c', point: '#7a3e10',
    fill0: '#e07b1f', fill1: '#f5b56b',
    tile: '#f2e3c4', accent: '#7a3e10',
  },
  dark: {
    bg0: '#1c1208', bg1: '#120a04',
    text: '#f7e8cd', muted: '#b08a63', grid: '#3a2612',
    line: '#e89542', point: '#f5b56b',
    fill0: '#c47020', fill1: '#e89542',
    tile: '#231708', accent: '#f5b56b',
  },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Scrapes date and count pairs out of the public contributions fragment. */
async function fetchDays() {
  const res = await fetch(`https://github.com/users/${USER}/contributions`, {
    headers: { 'User-Agent': 'contribution-chart-renderer', Accept: 'text/html' },
  });
  if (!res.ok) throw new Error(`contributions endpoint returned ${res.status}`);
  const html = await res.text();

  // Each cell carries its date and an id; the matching tool-tip carries the count.
  const counts = new Map();
  for (const m of html.matchAll(/for="(contribution-day-component-\d+-\d+)"[^>]*>([^<]*)</g)) {
    const n = /^No contributions/.test(m[2]) ? 0 : parseInt(m[2].replace(/,/g, ''), 10);
    counts.set(m[1], Number.isFinite(n) ? n : 0);
  }

  const days = [];
  for (const m of html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"\s+id="(contribution-day-component-\d+-\d+)"/g)) {
    days.push({ date: m[1], count: counts.get(m[2]) ?? 0 });
  }
  if (!days.length) throw new Error('parsed zero contribution days');

  days.sort((a, b) => a.date.localeCompare(b.date));
  return days;
}

/** Weekly totals, so a year fits in roughly 53 points instead of 366. */
function toWeeks(days) {
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    const slice = days.slice(i, i + 7);
    weeks.push({ date: slice[0].date, total: slice.reduce((a, d) => a + d.count, 0) });
  }
  return weeks;
}

function streaks(days) {
  let current = 0, longest = 0, run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    if (run > longest) longest = run;
  }
  for (let i = days.length - 1; i >= 0; i -= 1) {
    // Today may legitimately be empty, so it does not break the streak.
    if (days[i].count === 0) { if (i === days.length - 1) continue; break; }
    current += 1;
  }
  return { current, longest };
}

/** Catmull-Rom to cubic bezier, so the line reads as a curve and not a zigzag. */
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function renderChart(weeks, totals, t) {
  const W = 940, H = 260;
  const pad = { top: 56, right: 24, bottom: 34, left: 40 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const max = Math.max(1, ...weeks.map((w) => w.total));
  // Round the axis top to something readable rather than the raw maximum.
  const step = max <= 10 ? 2 : max <= 25 ? 5 : max <= 60 ? 10 : max <= 150 ? 25 : 50;
  const top = Math.ceil(max / step) * step;

  const x = (i) => pad.left + (plotW * i) / Math.max(1, weeks.length - 1);
  const y = (v) => pad.top + plotH - (plotH * v) / top;

  const pts = weeks.map((w, i) => [x(i), y(w.total)]);
  const line = smoothPath(pts);
  const area = `${line} L ${x(weeks.length - 1).toFixed(1)} ${pad.top + plotH} L ${pad.left} ${pad.top + plotH} Z`;

  const gridLines = [];
  for (let v = 0; v <= top; v += step) {
    gridLines.push(
      `<line x1="${pad.left}" y1="${y(v).toFixed(1)}" x2="${W - pad.right}" y2="${y(v).toFixed(1)}" stroke="${t.grid}" stroke-width="1"/>` +
      `<text x="${pad.left - 8}" y="${(y(v) + 3.5).toFixed(1)}" class="ax" text-anchor="end">${v}</text>`,
    );
  }

  // One label per month, at the first week that falls inside it.
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((w, i) => {
    const d = new Date(`${w.date}T00:00:00Z`);
    const m = d.getUTCMonth();
    if (m !== lastMonth) {
      lastMonth = m;
      monthLabels.push(`<text x="${x(i).toFixed(1)}" y="${H - 14}" class="ax" text-anchor="middle">${MONTHS[m]}</text>`);
    }
  });

  const peak = weeks.reduce((best, w, i) => (w.total > weeks[best].total ? i : best), 0);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Contributions per week over the past year for ${esc(USER)}: ${totals} in total">
  <title>Contributions per week, past year</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${t.bg0}"/><stop offset="100%" stop-color="${t.bg1}"/>
    </linearGradient>
    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${t.fill1}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${t.fill0}" stop-opacity="0.04"/>
    </linearGradient>
    <clipPath id="wipe"><rect id="wiperect" x="0" y="0" width="${W}" height="${H}"/></clipPath>
  </defs>
  <style>
    .ttl { font: 600 15px Georgia, 'Times New Roman', serif; fill: ${t.text}; }
    .sub { font: 400 11.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: ${t.muted}; letter-spacing: .04em; }
    .ax  { font: 400 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: ${t.muted}; }
    .pk  { font: 600 10.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: ${t.accent}; }

    /* The wipe reveals the plot left to right; the line draws itself in step. */
    #wiperect { animation: wipe 1900ms cubic-bezier(.22,.61,.36,1) forwards; }
    @keyframes wipe { from { width: 0; } to { width: ${W}px; } }

    #line { stroke-dasharray: 4000; stroke-dashoffset: 4000;
            animation: draw 1900ms cubic-bezier(.22,.61,.36,1) forwards; }
    @keyframes draw { to { stroke-dashoffset: 0; } }

    #area { opacity: 0; animation: fade 1500ms 400ms ease-out forwards; }
    @keyframes fade { to { opacity: 1; } }

    .peak { opacity: 0; animation: fade 600ms 2000ms ease-out forwards; }
    .head { opacity: 0; animation: rise 700ms ease-out forwards; }
    .head.b { animation-delay: 120ms; }
    @keyframes rise { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

    @media (prefers-reduced-motion: reduce) {
      #wiperect, #line, #area, .peak, .head { animation: none; }
      #wiperect { width: ${W}px; }
      #line { stroke-dashoffset: 0; }
      #area, .peak, .head { opacity: 1; }
    }
  </style>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <text x="${pad.left - 16}" y="28" class="ttl head">Contributions per week</text>
  <text x="${pad.left - 16}" y="44" class="sub head b">PAST YEAR &#183; ${totals} CONTRIBUTIONS</text>

  <g>${gridLines.join('')}</g>
  <g>${monthLabels.join('')}</g>

  <g clip-path="url(#wipe)">
    <path id="area" d="${area}" fill="url(#areaFill)"/>
    <path id="line" d="${line}" fill="none" stroke="${t.line}" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <g class="peak">
    <circle cx="${x(peak).toFixed(1)}" cy="${y(weeks[peak].total).toFixed(1)}" r="3.5" fill="${t.point}"/>
    <text x="${x(peak).toFixed(1)}" y="${(y(weeks[peak].total) - 10).toFixed(1)}" class="pk" text-anchor="middle">${weeks[peak].total}</text>
  </g>
</svg>
`;
}

function renderStats(tiles, t) {
  const W = 940, H = 104, gap = 14;
  const tw = (W - gap * (tiles.length - 1)) / tiles.length;

  const cells = tiles.map((tile, i) => {
    const tx = i * (tw + gap);
    return `<g class="tile" style="animation-delay:${120 * i}ms">
    <rect x="${tx.toFixed(1)}" y="0" width="${tw.toFixed(1)}" height="${H}" rx="10" fill="${t.tile}" stroke="${t.grid}"/>
    <text x="${(tx + tw / 2).toFixed(1)}" y="47" class="num" text-anchor="middle">${esc(tile.value)}</text>
    <text x="${(tx + tw / 2).toFixed(1)}" y="70" class="lbl" text-anchor="middle">${esc(tile.label)}</text>
  </g>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(tiles.map((x) => `${x.label}: ${x.value}`).join('. '))}">
  <title>GitHub activity at a glance</title>
  <style>
    .num { font: 600 26px Georgia, 'Times New Roman', serif; fill: ${t.accent}; }
    .lbl { font: 500 9.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; fill: ${t.muted}; letter-spacing: .12em; text-transform: uppercase; }
    .tile { opacity: 0; animation: pop 620ms cubic-bezier(.22,.61,.36,1) forwards; }
    @keyframes pop { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @media (prefers-reduced-motion: reduce) { .tile { animation: none; opacity: 1; } }
  </style>
  ${cells.join('\n  ')}
</svg>
`;
}

const days = await fetchDays();
const weeks = toWeeks(days);
const totals = days.reduce((a, d) => a + d.count, 0);
const { current, longest } = streaks(days);

// Unauthenticated and cheap; the profile numbers do not need a token.
let repos = 0, followers = 0;
try {
  const u = await fetch(`https://api.github.com/users/${USER}`, {
    headers: { 'User-Agent': 'contribution-chart-renderer', Accept: 'application/vnd.github+json' },
  });
  if (u.ok) {
    const j = await u.json();
    repos = j.public_repos ?? 0;
    followers = j.followers ?? 0;
  }
} catch {
  // Leave the tiles at zero rather than failing the whole render.
}

const tiles = [
  { label: 'Contributions, past year', value: totals.toLocaleString('en-GB') },
  { label: 'Current streak', value: `${current} ${current === 1 ? 'day' : 'days'}` },
  { label: 'Longest streak', value: `${longest} ${longest === 1 ? 'day' : 'days'}` },
  { label: 'Public repositories', value: repos },
  { label: 'Followers', value: followers },
];

await mkdir(OUT, { recursive: true });
for (const [name, theme] of Object.entries(THEMES)) {
  await writeFile(`${OUT}/activity-${name}.svg`, renderChart(weeks, totals.toLocaleString('en-GB'), theme));
  await writeFile(`${OUT}/stats-${name}.svg`, renderStats(tiles, theme));
}

console.log(`rendered ${weeks.length} weeks, ${totals} contributions, streak ${current}/${longest}, repos ${repos}, followers ${followers}`);
