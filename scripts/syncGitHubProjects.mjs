/**
 * syncGitHubProjects.mjs
 *
 * Reads  portfolio/githubConfig  from Firestore, fetches each repo's
 * metadata and README from the GitHub REST API, then upserts the results
 * into  githubProjects/{owner}_{repo}.
 *
 * Required env vars
 *   GH_PAT                    — GitHub Personal Access Token (repo read)
 *   FIREBASE_SERVICE_ACCOUNT  — Firebase Admin SDK service-account JSON (string)
 *
 * Node ≥18 required (uses native fetch).
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// firebase-admin ships CommonJS; require() works inside an .mjs module.
const admin = require('firebase-admin');

// ─── Init ─────────────────────────────────────────────────────────────────────

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT ?? '{}');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = admin.firestore();

// ─── GitHub helpers (native fetch, no extra dep) ──────────────────────────────

const GITHUB_HEADERS = {
  Authorization:        `Bearer ${process.env.GH_PAT}`,
  Accept:               'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent':         'portfolio-sync-script',
};

async function ghGet(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers: GITHUB_HEADERS });
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
  return res.json();
}

async function fetchRepoData(owner, repo) {
  const [repoResult, readmeResult] = await Promise.allSettled([
    ghGet(`/repos/${owner}/${repo}`),
    ghGet(`/repos/${owner}/${repo}/readme`),
  ]);

  if (repoResult.status === 'rejected') {
    throw new Error(repoResult.reason?.message ?? 'repo fetch failed');
  }

  const r      = repoResult.value;
  const readme = readmeResult.status === 'fulfilled'
    ? Buffer.from(readmeResult.value.content, 'base64').toString('utf-8')
    : '';

  return {
    owner,
    repo,
    name:        r.name,
    description: r.description ?? '',
    url:         r.html_url,
    homepage:    r.homepage ?? '',
    language:    r.language ?? '',
    stars:       r.stargazers_count,
    forks:       r.forks_count,
    topics:      r.topics ?? [],
    isPrivate:   r.private,
    readme,
    lastSynced:  admin.firestore.Timestamp.now(),
  };
}

// ─── Firestore doc ID ─────────────────────────────────────────────────────────

function docId(owner, repo) {
  return `${owner}_${repo}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.GH_PAT) {
    console.error('GH_PAT env var is not set.');
    process.exit(1);
  }
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error('FIREBASE_SERVICE_ACCOUNT env var is not set.');
    process.exit(1);
  }

  const configSnap = await db.collection('portfolio').doc('githubConfig').get();

  if (!configSnap.exists) {
    console.error(
      'portfolio/githubConfig not found in Firestore.\n' +
      'Create it with a "repos" array: [{owner, repo, order}]'
    );
    process.exit(1);
  }

  const { repos } = configSnap.data();

  if (!Array.isArray(repos) || repos.length === 0) {
    console.error('portfolio/githubConfig.repos is empty or not an array.');
    process.exit(1);
  }

  console.log(`Syncing ${repos.length} repo(s)...\n`);

  const batch = db.batch();
  let success = 0;
  let failed  = 0;

  for (const entry of repos) {
    const { owner, repo, order = 0 } = entry ?? {};

    if (!owner || !repo) {
      console.warn('  ⚠ Skipping entry with missing owner/repo:', entry);
      failed++;
      continue;
    }

    process.stdout.write(`  ${owner}/${repo} ... `);

    try {
      const data = await fetchRepoData(owner, repo);
      batch.set(
        db.collection('githubProjects').doc(docId(owner, repo)),
        { ...data, order },
      );
      console.log('✓');
      success++;
    } catch (err) {
      console.log(`✗  ${err.message}`);
      failed++;
    }
  }

  if (success > 0) await batch.commit();

  console.log(
    `\n${success} synced, ${failed} failed.` +
    (success > 0 ? ' Committed to Firestore.' : ''),
  );
}

main().catch(err => { console.error(err); process.exit(1); });
