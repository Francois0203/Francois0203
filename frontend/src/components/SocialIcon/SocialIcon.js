import {
  SiGithub, SiGitlab, SiBitbucket, SiInstagram, SiOrcid, SiHackerrank, SiCodewars, SiLeetcode,
  SiStackoverflow, SiMedium, SiDevdotto, SiHashnode, SiSubstack, SiKaggle, SiYoutube, SiTiktok,
  SiBehance, SiDribbble, SiWhatsapp, SiFacebook, SiX, SiCredly, SiResearchgate, SiGooglescholar,
  SiLinktree, SiDiscord, SiTelegram, SiCodepen, SiBluesky, SiMastodon, SiThreads, SiBuymeacoffee,
  SiKofi, SiPatreon, SiReddit, SiTwitch, SiFigma, SiCodeforces, SiCodechef, SiTryhackme,
  SiHackthebox, SiNpm, SiDocker,
} from 'react-icons/si';
import { FaLinkedinIn, FaGlobe, FaEnvelope } from 'react-icons/fa6';

export const PLATFORMS = [
  { key: 'github', label: 'GitHub', icon: SiGithub, host: 'github.com' },
  { key: 'linkedin', label: 'LinkedIn', icon: FaLinkedinIn, host: 'linkedin.com' },
  { key: 'gitlab', label: 'GitLab', icon: SiGitlab, host: 'gitlab.com' },
  { key: 'bitbucket', label: 'Bitbucket', icon: SiBitbucket, host: 'bitbucket.org' },
  { key: 'orcid', label: 'ORCID', icon: SiOrcid, host: 'orcid.org' },
  { key: 'hackerrank', label: 'HackerRank', icon: SiHackerrank, host: 'hackerrank.com' },
  { key: 'codewars', label: 'Codewars', icon: SiCodewars, host: 'codewars.com' },
  { key: 'leetcode', label: 'LeetCode', icon: SiLeetcode, host: 'leetcode.com' },
  { key: 'codeforces', label: 'Codeforces', icon: SiCodeforces, host: 'codeforces.com' },
  { key: 'codechef', label: 'CodeChef', icon: SiCodechef, host: 'codechef.com' },
  { key: 'tryhackme', label: 'TryHackMe', icon: SiTryhackme, host: 'tryhackme.com' },
  { key: 'hackthebox', label: 'Hack The Box', icon: SiHackthebox, host: 'hackthebox.com' },
  { key: 'kaggle', label: 'Kaggle', icon: SiKaggle, host: 'kaggle.com' },
  { key: 'stackoverflow', label: 'Stack Overflow', icon: SiStackoverflow, host: 'stackoverflow.com' },
  { key: 'credly', label: 'Credly', icon: SiCredly, host: 'credly.com' },
  { key: 'researchgate', label: 'ResearchGate', icon: SiResearchgate, host: 'researchgate.net' },
  { key: 'scholar', label: 'Google Scholar', icon: SiGooglescholar, host: 'scholar.google' },
  { key: 'medium', label: 'Medium', icon: SiMedium, host: 'medium.com' },
  { key: 'devto', label: 'DEV', icon: SiDevdotto, host: 'dev.to' },
  { key: 'hashnode', label: 'Hashnode', icon: SiHashnode, host: 'hashnode' },
  { key: 'substack', label: 'Substack', icon: SiSubstack, host: 'substack.com' },
  { key: 'codepen', label: 'CodePen', icon: SiCodepen, host: 'codepen.io' },
  { key: 'npm', label: 'npm', icon: SiNpm, host: 'npmjs.com' },
  { key: 'dockerhub', label: 'Docker Hub', icon: SiDocker, host: 'hub.docker.com' },
  { key: 'figma', label: 'Figma', icon: SiFigma, host: 'figma.com' },
  { key: 'instagram', label: 'Instagram', icon: SiInstagram, host: 'instagram.com' },
  { key: 'facebook', label: 'Facebook', icon: SiFacebook, host: 'facebook.com' },
  { key: 'twitter', label: 'X', icon: SiX, host: 'x.com' },
  { key: 'threads', label: 'Threads', icon: SiThreads, host: 'threads.net' },
  { key: 'bluesky', label: 'Bluesky', icon: SiBluesky, host: 'bsky.app' },
  { key: 'mastodon', label: 'Mastodon', icon: SiMastodon, host: 'mastodon' },
  { key: 'youtube', label: 'YouTube', icon: SiYoutube, host: 'youtube.com' },
  { key: 'tiktok', label: 'TikTok', icon: SiTiktok, host: 'tiktok.com' },
  { key: 'twitch', label: 'Twitch', icon: SiTwitch, host: 'twitch.tv' },
  { key: 'reddit', label: 'Reddit', icon: SiReddit, host: 'reddit.com' },
  { key: 'discord', label: 'Discord', icon: SiDiscord, host: 'discord' },
  { key: 'telegram', label: 'Telegram', icon: SiTelegram, host: 't.me' },
  { key: 'whatsapp', label: 'WhatsApp', icon: SiWhatsapp, host: 'wa.me' },
  { key: 'behance', label: 'Behance', icon: SiBehance, host: 'behance.net' },
  { key: 'dribbble', label: 'Dribbble', icon: SiDribbble, host: 'dribbble.com' },
  { key: 'linktree', label: 'Linktree', icon: SiLinktree, host: 'linktr.ee' },
  { key: 'buymeacoffee', label: 'Buy Me a Coffee', icon: SiBuymeacoffee, host: 'buymeacoffee.com' },
  { key: 'kofi', label: 'Ko-fi', icon: SiKofi, host: 'ko-fi.com' },
  { key: 'patreon', label: 'Patreon', icon: SiPatreon, host: 'patreon.com' },
  { key: 'email', label: 'Email', icon: FaEnvelope, host: 'mailto:' },
  { key: 'website', label: 'Website', icon: FaGlobe, host: '' },
];

const BY_KEY = Object.fromEntries(PLATFORMS.map(p => [p.key, p]));
BY_KEY.x = BY_KEY.twitter;

// The platform for a social entry: by its key, else by its URL, else a plain website.
export const platformFor = (key = '', url = '') => {
  const k = String(key).toLowerCase().replace(/[^a-z]/g, '');
  if (BY_KEY[k]) return BY_KEY[k];
  const u = String(url).toLowerCase();
  return PLATFORMS.find(p => p.host && u.includes(p.host)) ?? BY_KEY.website;
};

const SocialIcon = ({ platform, url, className, ...rest }) => {
  const Icon = platformFor(platform, url).icon;
  return <Icon className={className} aria-hidden="true" focusable="false" {...rest} />;
};

export default SocialIcon;
