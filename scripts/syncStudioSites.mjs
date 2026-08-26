/**
 * syncStudioSites.mjs
 *
 * Discovers every repo in the studio GitHub org, resolves the live site(s) each
 * one hosts, and upserts them into  studioSites/{owner}_{repo}.
 *
 * Nothing is hardcoded: add a repo to the org and it appears. Each repo states
 * where it is deployed, via one of three strategies tried in order -
 * `.showcase.json` (see scripts/showcase.template.json), the repo's GitHub
 * `homepage` field, or `.firebaserc` + `firebase.json`. Each url is also probed
 * for whether it permits framing, since the portfolio embeds these live.
 *
 * Env: GH_PAT (repo + read:org). Credentials come from SERVICE_ACCOUNT, or from
 * application-default credentials for a local run. Optional: STUDIO_ORG,
 * SITE_ORIGIN, PRUNE=1. Full notes in scripts/README.md. Node >= 18.
 */

import { ghPaginate, ghReadJson } from './lib/gh.mjs';
import { initFirestore, closeFirestore, projectId, admin } from './lib/firebase.mjs';

// ─── Config ───────────────────────────────────────────────────────────────────

const ORG         = process.env.STUDIO_ORG  || 'FM-Web-Studio';
// Defaults to this site's own Firebase origin, so a target's CSP
// `frame-ancestors` list can be evaluated without extra configuration.
const SITE_ORIGIN = process.env.SITE_ORIGIN
  || (projectId() ? `${projectId()}.web.app` : '');
const COLLECTION  = 'studioSites';
const PROBE_MS    = 10_000;


// ─── URL discovery ────────────────────────────────────────────────────────────

const isHttpUrl = (v) => typeof v === 'string' && /^https?:\/\//i.test(v.trim());

/**
 * Normalise one `sites` entry from a manifest into { label, url }.
 * Accepts a bare url string as shorthand for { url }.
 */
function normaliseSite(entry, index) {
  if (isHttpUrl(entry)) return { label: index === 0 ? 'Live site' : `Site ${index + 1}`, url: entry.trim() };
  if (!entry || !isHttpUrl(entry.url)) return null;
  return {
    label: (typeof entry.label === 'string' && entry.label.trim()) || (index === 0 ? 'Live site' : `Site ${index + 1}`),
    url:   entry.url.trim().replace(/\/+$/, ''),
  };
}

/**
 * Firebase Hosting site ids for a repo, from its own config. Targets are checked
 * before the default project id - a repo defining targets is the
 * two-apps-in-one-project case, where the default id finds only one.
 */
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

// ─── Embeddability probe ──────────────────────────────────────────────────────

/**
 * Can this url be framed on the portfolio? Conservative: a wrong `true` is a
 * blank panel on the live site, a wrong `false` is only a link-out card.
 */
async function probe(url) {
  try {
    const res = await fetch(url, {
      method:   'GET',
      redirect: 'follow',
      headers:  { 'User-Agent': 'portfolio-showcase-probe' },
      signal:   AbortSignal.timeout(PROBE_MS),
    });

    // We only need the headers; don't hold the body open.
    res.body?.cancel?.().catch(() => {});

    const xfo = (res.headers.get('x-frame-options') || '').toLowerCase();
    const csp = res.headers.get('content-security-policy') || '';
    const fa  = /frame-ancestors([^;]*)/i.exec(csp)?.[1]?.trim().toLowerCase() ?? '';

    const blockedByXfo = /deny|sameorigin/.test(xfo);

    let blockedByCsp = false;
    if (fa) {
      if (fa.includes("'none'"))    blockedByCsp = true;
      else if (fa.includes('*'))    blockedByCsp = false;
      else if (SITE_ORIGIN)         blockedByCsp = !fa.includes(SITE_ORIGIN.toLowerCase().replace(/^https?:\/\//, ''));
      else                          blockedByCsp = true;   // cannot evaluate
    }

    return {
      reachable:  res.ok,
      embeddable: res.ok && !blockedByXfo && !blockedByCsp,
      status:     res.status,
    };
  } catch {
    return { reachable: false, embeddable: false, status: 0 };
  }
}

// ─── Manifest → Firestore document ────────────────────────────────────────────

const str = (v, fallback = '') => (typeof v === 'string' && v.trim() ? v.trim() : fallback);

const strList = (v, max) => (Array.isArray(v)
  ? v.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()).slice(0, max)
  : []);

function docId(owner, repo) {
  return `${owner}_${repo}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

async function buildDoc(r) {
  const owner = r.owner?.login ?? ORG;
  const repo  = r.name;

  let manifest = null;
  let manifestError = null;
  try {
    manifest = await ghReadJson(owner, repo, '.showcase.json');
  } catch (err) {
    manifestError = err.message;
  }

  // ── Which urls, and where they came from ──
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

  // Dedupe by url - a repo can name the same site twice across two strategies.
  const seen = new Set();
  sites = sites.filter(s => !seen.has(s.url) && seen.add(s.url)).slice(0, 4);

  // ── Probe each url for framing support ──
  const probed = await Promise.all(sites.map(async s => ({ ...s, ...(await probe(s.url)) })));

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

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.GH_PAT) {
    console.error('GH_PAT env var is not set.');
    process.exit(1);
  }

  const db = initFirestore();

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

  const batch  = db.batch();
  const keptIds = new Set();
  let withSites = 0;
  let failed    = 0;

  for (const r of repos) {
    process.stdout.write(`  ${r.name} ... `);
    try {
      const { id, data } = await buildDoc(r);
      batch.set(db.collection(COLLECTION).doc(id), data);
      keptIds.add(id);

      const urls   = data.sites.length;
      const frames = data.sites.filter(s => s.embeddable).length;
      const dead   = data.sites.filter(s => !s.reachable).map(s => s.url);

      if (urls === 0) {
        console.log('no live site found (add .showcase.json or set the repo homepage)');
      } else {
        console.log(
          `${urls} site(s) via ${data.source}` +
          `, ${frames}/${urls} embeddable` +
          (data.featured ? ', featured' : ''),
        );
        withSites++;
      }
      if (dead.length)          console.log(`      ! unreachable: ${dead.join(', ')}`);
      if (data.manifestError)   console.log(`      ! ${data.manifestError}`);
      if (urls > frames)        console.log('      ! some sites refuse framing - the card will link out instead');
    } catch (err) {
      console.log(`FAILED  ${err.message}`);
      failed++;
    }
  }

  // Off by default so a transient GitHub error cannot wipe the collection.
  let pruned = 0;
  if (process.env.PRUNE === '1') {
    const existing = await db.collection(COLLECTION).get();
    for (const doc of existing.docs) {
      if (!keptIds.has(doc.id)) { batch.delete(doc.ref); pruned++; }
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
