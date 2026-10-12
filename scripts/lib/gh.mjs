const GITHUB_HEADERS = {
  Authorization:          `Bearer ${process.env.GH_PAT}`,
  Accept:                 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent':           'portfolio-sync-script',
};

export async function ghGet(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers: GITHUB_HEADERS });
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
  return res.json();
}

export async function ghGetOptional(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers: GITHUB_HEADERS });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
  return res.json();
}

export async function ghPaginate(path, { perPage = 100, max = 1000 } = {}) {
  const out = [];
  const joiner = path.includes('?') ? '&' : '?';

  for (let page = 1; out.length < max; page++) {
    const batch = await ghGet(`${path}${joiner}per_page=${perPage}&page=${page}`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    out.push(...batch);
    if (batch.length < perPage) break;
  }

  return out;
}

export async function ghReadFile(owner, repo, path) {
  const data = await ghGetOptional(`/repos/${owner}/${repo}/contents/${path}`);
  if (!data || Array.isArray(data) || typeof data.content !== 'string') return null;
  return Buffer.from(data.content, 'base64').toString('utf-8');
}

export async function ghReadJson(owner, repo, path) {
  const text = await ghReadFile(owner, repo, path);
  if (text == null) return null;
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`${path} is not valid JSON: ${err.message}`);
  }
}

export async function ghReadme(owner, repo) {
  const data = await ghGetOptional(`/repos/${owner}/${repo}/readme`);
  if (!data?.content) return '';
  return Buffer.from(data.content, 'base64').toString('utf-8');
}
