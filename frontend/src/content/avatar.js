// The avatar for the GitHub link in the socials list. It comes straight from GitHub's image
// host: the github.com/<user>.png shortcut redirects without a CORS header, which browsers
// log as a blocked request whenever anything fetches it.
export const githubAvatar = (social = []) => {
  const github = social.find(s => (s.key || '').toLowerCase() === 'github');
  const user = github?.url ? github.url.replace(/\/$/, '').split('/').pop() : null;
  return user ? `https://avatars.githubusercontent.com/${user}` : null;
};
