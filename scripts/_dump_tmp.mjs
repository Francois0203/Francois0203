// TEMPORARY. Delete after use. Dumps Firestore content collections to a file.
import fs from 'fs';
const envText = fs.readFileSync(new URL('../frontend/.env.local', import.meta.url), 'utf-8');
const m = envText.match(/^SERVICE_ACCOUNT=([\s\S]*?)\n(?=[A-Z_]+=|$)/m);
if (m) process.env.SERVICE_ACCOUNT = m[1].trim().replace(/^"|"$/g, '');
const { initFirestore, closeFirestore } = await import('./lib/firebase.mjs');
const db = await initFirestore();
const out = [];
for (const c of await db.listCollections()) {
  const snap = await c.limit(60).get();
  out.push(`\n########## ${c.id}  (${snap.size} docs)`);
  for (const d of snap.docs) out.push(`--- ${d.id}\n` + JSON.stringify(d.data(), null, 1));
}
console.log(out.join('\n'));
await closeFirestore();
