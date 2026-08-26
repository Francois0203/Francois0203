/**
 * Shared GitHub REST helpers for the sync scripts, so the two cannot drift on
 * auth headers, pagination or error handling. Node >= 18.
 */

const GITHUB_HEADERS = {
  Authorization:          `Bearer ${process.env.GH_PAT}`,
  Accept:                 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent':           'portfolio-sync-script',
};

/**
 * GET a GitHub API path. Throws on any non-2xx.
 */
export async function ghGet(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers: GITHUB_HEADERS });
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
  return res.json();
}

/**
 * GET a path that may legitimately not exist (an optional file in a repo).
 * Returns null on 404 instead of throwing, so callers can treat "no manifest"
 * as an ordinary case rather than an error.
 */
export async function ghGetOptional(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers: GITHUB_HEADERS });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
  return res.json();
}

/**
 * Walk every page of a paginated list endpoint - the org repo list would
 * silently truncate at 100 repos otherwise.
 */
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

/**
 * Read a file from a repo at the default branch. Returns its decoded text, or
 * null when the file is absent (404) or the path is a directory.
 */
export async function ghReadFile(owner, repo, path) {
  const data = await ghGetOptional(`/repos/${owner}/${repo}/contents/${path}`);
  if (!data || Array.isArray(data) || typeof data.content !== 'string') return null;
  return Buffer.from(data.content, 'base64').toString('utf-8');
}

/**
 * Read and parse a JSON file from a repo. Null when missing; throws when present
 * but malformed, so the caller can log that one repo and carry on.
 */
export async function ghReadJson(owner, repo, path) {
  const text = await ghReadFile(owner, repo, path);
  if (text == null) return null;
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`${path} is not valid JSON: ${err.message}`);
  }
}

/**
 * A repo's README as text, or '' when it has none.
 */
export async function ghReadme(owner, repo) {
  const data = await ghGetOptional(`/repos/${owner}/${repo}/readme`);
  if (!data?.content) return '';
  return Buffer.from(data.content, 'base64').toString('utf-8');
}
