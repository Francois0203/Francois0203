// Your GitHub picture, loaded from GitHub's image host to avoid a blocked redirect.
export const githubAvatar = (social = []) => {
  const github = social.find(s => (s.key || '').toLowerCase() === 'github');
  const user = github?.url ? github.url.replace(/\/$/, '').split('/').pop() : null;
  return user ? `https://avatars.githubusercontent.com/${user}` : null;
};
