import { ghPaginate, ghReadJson } from './lib/gh.mjs';
import { initFirestore, closeFirestore, projectId, admin } from './lib/firebase.mjs';
import { screenshot } from './lib/screenshot.mjs';

// Config

const ORG         = process.env.STUDIO_ORG  || 'FM-Web-Studio';
const COLLECTION  = 'studioSites';
const PROBE_MS    = 10_000;
// The portfolio's own address, so a site that only allows named frames can still be shown.
const PORTFOLIO   = projectId() ? `${projectId()}.web.app` : '';

// URL discovery

const isHttpUrl = (v) => typeof v === 'string' && /^https?:\/\//i.test(v.trim());

function normaliseSite(entry, index) {
  if (isHttpUrl(entry)) return { label: index === 0 ? 'Live site' : `Site ${index + 1}`, url: entry.trim() };
  if (!entry || !isHttpUrl(entry.url)) return null;
  return {
    label: (typeof entry.label === 'string' && entry.label.trim()) || (index === 0 ? 'Live site' : `Site ${index + 1}`),
    url:   entry.url.trim().replace(/\/+$/, ''),
  };
}

async function firebaseSites(owner, repo) {
  const [rc, cfg] = await Promise.all([
    ghReadJson(owner, repo, '.firebaserc').catch(() => null),
    ghReadJson(owner, repo, 'firebase.json').catch(() => null),
  ]);

  const ids = new Set();

  // .firebaserc → targets.<project>.hosting.<target> = [siteId, ...]
  const targets = rc?.targets ?? {};
  for (const project of Object.values(targets)) {
    for (const list of Object.values(project?.hosting ?? {})) {
      for (const id of (Array.isArray(list) ? list : [list])) {
        if (typeof id === 'string' && id.trim()) ids.add(id.trim());
      }
    }
  }

  // firebase.json → hosting may be one object or an array of them
  const hosting = cfg?.hosting;
  for (const h of (Array.isArray(hosting) ? hosting : hosting ? [hosting] : [])) {
    if (typeof h?.site === 'string' && h.site.trim()) ids.add(h.site.trim());
  }

  // Nothing explicit: the default project id is also the default site id.
  if (ids.size === 0 && typeof rc?.projects?.default === 'string') {
    ids.add(rc.projects.default.trim());
  }

  return [...ids].filter(Boolean).map((id, i) => ({
    label: i === 0 && ids.size === 1 ? 'Live site' : id,
    url:   `https://${id}.web.app`,
  }));
}

// Is the site up, and may the portfolio show it in a frame?

async function probe(url) {
  try {
    const res = await fetch(url, {
      method:   'GET',
      redirect: 'follow',
      headers:  { 'User-Agent': 'portfolio-showcase-probe' },
      signal:   AbortSignal.timeout(PROBE_MS),
    });
    res.body?.cancel?.().catch(() => {});

    const xfo = (res.headers.get('x-frame-options') || '').toLowerCase();
    const ancestors = (/frame-ancestors([^;]*)/i.exec(res.headers.get('content-security-policy') || '')?.[1] || '').trim().toLowerCase();
    const allowedByCsp = !ancestors || ancestors.includes('*') || (PORTFOLIO && ancestors.includes(PORTFOLIO));
    const embeddable = res.ok && !/deny|sameorigin/.test(xfo) && allowedByCsp;

    return { reachable: res.ok, embeddable, status: res.status };
  } catch {
    return { reachable: false, embeddable: false, status: 0 };
  }
}

// Manifest → Firestore document

const str = (v, fallback = '') => (typeof v === 'string' && v.trim() ? v.trim() : fallback);

const strList = (v, max) => (Array.isArray(v)
  ? v.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()).slice(0, max)
  : []);

function docId(owner, repo) {
  return `${owner}_${repo}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

async function buildDoc(r, previous) {
  const owner = r.owner?.login ?? ORG;
  const repo  = r.name;

  let manifest = null;
  let manifestError = null;
  try {
    manifest = await ghReadJson(owner, repo, '.showcase.json');
  } catch (err) {
    manifestError = err.message;
  }

  // Which urls, and where they came from
  let sites  = [];
  let source = 'none';

  const fromManifest = Array.isArray(manifest?.sites)
    ? manifest.sites.map(normaliseSite).filter(Boolean)
    : [];

  if (fromManifest.length > 0) {
    sites  = fromManifest;
    source = 'showcase.json';
  } else if (isHttpUrl(r.homepage)) {
    sites  = [{ label: 'Live site', url: r.homepage.trim().replace(/\/+$/, '') }];
    source = 'homepage';
  } else {
    const derived = await firebaseSites(owner, repo);
    if (derived.length > 0) {
      sites  = derived;
      source = 'firebaserc';
    }
  }

  // A repo can list the same site twice, keep one.
  const seen = new Set();
  sites = sites.filter(s => !seen.has(s.url) && seen.add(s.url)).slice(0, 4);

  const probed = await Promise.all(sites.map(async s => ({ ...s, ...(await probe(s.url)) })));

  // A picture of the main site for its card. Keeps the last one if this capture fails.
  const main = probed.find(s => s.reachable);
  const preview = (main && await screenshot(main.url)) || previous?.preview || null;

  return {
    id:   docId(owner, repo),
    data: {
      owner,
      repo,
      name:        str(manifest?.name, repo),
      client:      str(manifest?.client),
      tagline:     str(manifest?.tagline, str(r.description)),
      description: str(manifest?.description, str(r.description)),
      featured:    manifest?.featured === true,
      order:       Number.isFinite(manifest?.order) ? manifest.order : 100,
      sites:       probed,
      preview,
      stack:       strList(manifest?.stack, 12),
      tags:        strList(manifest?.tags, 8),
      topics:      strList(r.topics, 8),
      language:    str(r.language),
      githubUrl:   str(r.html_url),
      isPrivate:   r.private === true,
      isArchived:  r.archived === true,
      source,
      manifestError,
      pushedAt:    str(r.pushed_at),
      lastSynced:  admin.firestore.Timestamp.now(),
    },
  };
}

// Main

async function main() {
  if (!process.env.GH_PAT) {
    console.error('GH_PAT env var is not set.');
    process.exit(1);
  }

  const db = await initFirestore();

  console.log(`Discovering repos in ${ORG} ...`);

  const repos = (await ghPaginate(`/orgs/${ORG}/repos?type=all&sort=pushed`))
    .filter(r => !r.archived && !r.disabled);

  if (repos.length === 0) {
    throw new Error(
      `No repositories visible in "${ORG}".\n` +
      'Check STUDIO_ORG and that GH_PAT has `read:org` (plus `repo` for private repos).',
    );
  }

  console.log(`${repos.length} repo(s) found. Resolving live sites...\n`);

  const existing = new Map((await db.collection(COLLECTION).get()).docs.map(d => [d.id, d.data()]));
  const batch  = db.batch();
  const keptIds = new Set();
  let withSites = 0;
  let failed    = 0;

  for (const r of repos) {
    process.stdout.write(`  ${r.name} ... `);
    try {
      const { id, data } = await buildDoc(r, existing.get(docId(r.owner?.login ?? ORG, r.name)));
      batch.set(db.collection(COLLECTION).doc(id), data);
      keptIds.add(id);

      const urls   = data.sites.length;
      const dead   = data.sites.filter(s => !s.reachable).map(s => s.url);

      if (urls === 0) {
        console.log('no live site found (add .showcase.json or set the repo homepage)');
      } else {
        console.log(
          `${urls} site(s) via ${data.source}` +
          (data.preview ? ', screenshot' : ', no screenshot') +
          (data.featured ? ', featured' : ''),
        );
        withSites++;
      }
      if (dead.length)          console.log(`      ! unreachable: ${dead.join(', ')}`);
      if (data.manifestError)   console.log(`      ! ${data.manifestError}`);
    } catch (err) {
      console.log(`FAILED  ${err.message}`);
      failed++;
    }
  }

  // Off by default so a transient GitHub error cannot wipe the collection.
  let pruned = 0;
  if (process.env.PRUNE === '1') {
    for (const docIdKey of existing.keys()) {
      if (!keptIds.has(docIdKey)) { batch.delete(db.collection(COLLECTION).doc(docIdKey)); pruned++; }
    }
  }

  await batch.commit();

  console.log(
    `\n${keptIds.size} synced (${withSites} with a live site), ${failed} failed` +
    (pruned ? `, ${pruned} pruned` : '') + '.',
  );
  if (process.env.PRUNE !== '1') {
    console.log('Set PRUNE=1 to also remove docs for repos no longer in the org.');
  }
}

main()
  .catch(err => { console.error(err.message ?? err); process.exitCode = 1; })
  .finally(closeFirestore);
