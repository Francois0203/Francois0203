import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { initFirestore } from './lib/firebase.mjs';

const require = createRequire(import.meta.url);
const { FieldValue } = require('firebase-admin/firestore');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APPLY = process.argv.includes('--apply');
const DROP_PERIODS = process.argv.includes('--drop-periods');

/* Fields nothing reads or edits any more. */
const DEAD = {
  certifications: ['period', 'tags'],
};
const DEAD_COPY = { home: ['coverProseInvite'] };

const loadServiceAccount = () => {
  if (process.env.SERVICE_ACCOUNT) return;
  const file = path.join(HERE, '..', 'frontend', '.env.local');
  if (!fs.existsSync(file)) return;
  const env = fs.readFileSync(file, 'utf-8');
  const at = env.indexOf('SERVICE_ACCOUNT=');
  if (at < 0) return;
  const open = env.indexOf('{', at);
  let depth = 0;
  let end = open;
  for (; end < env.length; end += 1) {
    if (env[end] === '{') depth += 1;
    else if (env[end] === '}') { depth -= 1; if (depth === 0) break; }
  }
  process.env.SERVICE_ACCOUNT = env.slice(open, end + 1);
};

const blank = (v) => !String(v ?? '').trim();

/* "January 2025 - April 2026", "2026 - Present", "2024", "May 2026 to June 2026". */
const parsePeriod = (period) => {
  const text = String(period ?? '').trim();
  if (!/\b(19|20)\d{2}\b/.test(text)) return null;
  const parts = text.split(/\s+(?:-|\u2013|\u2014|to)\s+/i).map(s => s.trim()).filter(Boolean);
  if (parts.length === 1) return { start: parts[0], end: parts[0] };
  if (parts.length === 2) {
    return { start: parts[0], end: /^(present|current|now)$/i.test(parts[1]) ? '' : parts[1] };
  }
  return null;
};

loadServiceAccount();
const db = await initFirestore();

const backup = {};
const plans = [];
const problems = [];

for (const col of ['experience', 'education']) {
  const snap = await db.collection(col).get();
  for (const doc of snap.docs) {
    const x = doc.data();
    const id = `${col}/${doc.id}`;
    const change = {};
    let start = x.start;
    let end = x.end;

    if (blank(start) && blank(end)) {
      const found = parsePeriod(x.period);
      if (found) {
        change.start = found.start;
        change.end = found.end;
        start = found.start;
        end = found.end;
      }
    }

    if ('period' in x && DROP_PERIODS) {
      if (blank(start) && blank(end)) problems.push(`${id}: period "${x.period}" has no dates to move into, kept`);
      else change.period = FieldValue.delete();
    }

    if (Object.keys(change).length) {
      backup[id] = x;
      plans.push({ id, ref: doc.ref, change, note: `period "${x.period ?? ''}" -> start "${start ?? ''}", end "${end ?? ''}"` });
    } else if ('period' in x && !DROP_PERIODS) {
      plans.push({ id, ref: null, change: {}, note: `period "${x.period}" kept until --drop-periods (start "${start ?? ''}", end "${end ?? ''}")` });
    }
  }
}

for (const [col, fields] of Object.entries(DEAD)) {
  const snap = await db.collection(col).get();
  for (const doc of snap.docs) {
    const x = doc.data();
    const gone = fields.filter(f => f in x);
    if (!gone.length) continue;
    backup[`${col}/${doc.id}`] = x;
    plans.push({
      id: `${col}/${doc.id}`,
      ref: doc.ref,
      change: Object.fromEntries(gone.map(f => [f, FieldValue.delete()])),
      note: `remove unused ${gone.join(', ')}`,
    });
  }
}

const copyRef = db.collection('portfolio').doc('copy');
const copy = (await copyRef.get()).data() ?? {};
const copyChange = {};
for (const [group, keys] of Object.entries(DEAD_COPY)) {
  for (const k of keys) if (copy[group] && k in copy[group]) copyChange[`${group}.${k}`] = FieldValue.delete();
}
if (Object.keys(copyChange).length) {
  backup['portfolio/copy'] = copy;
  plans.push({ id: 'portfolio/copy', ref: copyRef, change: copyChange, note: `remove stale copy ${Object.keys(copyChange).join(', ')}` });
}

console.log(APPLY ? '\nApplying:' : '\nDry run, nothing written:');
for (const p of plans) console.log(`  ${p.id}  ${p.note}`);
for (const msg of problems) console.log(`  ! ${msg}`);

if (!APPLY) {
  console.log('\nRe-run with --apply to write. Add --drop-periods once the new site is deployed.');
  process.exit(0);
}

const dir = path.join(HERE, 'backups');
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `records-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(file, JSON.stringify(backup, null, 2));
console.log(`\nBackup of ${Object.keys(backup).length} documents: ${path.relative(process.cwd(), file)}`);

const batch = db.batch();
let writes = 0;
for (const p of plans) {
  if (!p.ref || !Object.keys(p.change).length) continue;
  batch.update(p.ref, p.change);
  writes += 1;
}
if (writes) await batch.commit();
console.log(`Updated ${writes} documents.`);
process.exit(0);
