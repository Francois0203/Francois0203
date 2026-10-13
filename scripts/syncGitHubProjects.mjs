import { ghGet, ghReadme } from './lib/gh.mjs';
import { initFirestore, closeFirestore, admin } from './lib/firebase.mjs';

async function fetchRepoData(owner, repo) {
  const [repoResult, readmeResult] = await Promise.allSettled([
    ghGet(`/repos/${owner}/${repo}`),
    ghReadme(owner, repo),
  ]);

  if (repoResult.status === 'rejected') {
    throw new Error(repoResult.reason?.message ?? 'repo fetch failed');
  }

  const r      = repoResult.value;
  const readme = readmeResult.status === 'fulfilled' ? readmeResult.value : '';

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

// Firestore doc ID

function docId(owner, repo) {
  return `${owner}_${repo}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

// Main

async function main() {
  if (!process.env.GH_PAT) {
    console.error('GH_PAT env var is not set.');
    process.exit(1);
  }

  const db = await initFirestore();

  const configSnap = await db.collection('portfolio').doc('githubConfig').get();

  if (!configSnap.exists) {
    throw new Error(
      'portfolio/githubConfig not found in Firestore.\n' +
      'Create it with a "repos" array: [{owner, repo, order}]'
    );
  }

  const { repos } = configSnap.data();

  if (!Array.isArray(repos) || repos.length === 0) {
    throw new Error('portfolio/githubConfig.repos is empty or not an array.');
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
      const ref = db.collection('githubProjects').doc(docId(owner, repo));
      const existing = await ref.get();
      const kept = existing.exists ? existing.get('order') : undefined;
      batch.set(ref, { ...data, order: typeof kept === 'number' ? kept : order });
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

main()
  .catch(err => { console.error(err.message ?? err); process.exitCode = 1; })
  .finally(closeFirestore);
