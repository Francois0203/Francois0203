import { FaGithub } from 'react-icons/fa';
import {
  MdPerson, MdBadge, MdEditNote, MdBuild, MdWork, MdSchool, MdFavorite,
  MdShare, MdVolunteerActivism, MdMailOutline, MdVerified, MdPublic, MdPhotoLibrary,
} from 'react-icons/md';

const CV_TOGGLE = { key: 'showOnCv', label: 'Show on the printed CV', type: 'toggle', default: true, hint: 'Untick to keep it on the website but leave it off the CV.' };
const HOME_TOGGLE = { key: 'showOnHome', label: 'Show on the home timeline', type: 'toggle', default: true, hint: 'Untick to keep it on the Bio page but leave it off the home page.' };

export const EXPERIENCE_FIELDS = [
  { key: 'company', label: 'Company', type: 'text', required: true },
  { key: 'role', label: 'Role', type: 'text', required: true },
  { key: 'type', label: 'Type', type: 'text' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'start', label: 'Start (e.g. January 2025)', type: 'text' },
  { key: 'end', label: 'End (leave empty if current)', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'tags', label: 'Tech tags', type: 'tags' },
  CV_TOGGLE,
  HOME_TOGGLE,
];

export const EDUCATION_FIELDS = [
  { key: 'institution', label: 'Institution', type: 'text', required: true },
  { key: 'degree', label: 'Degree', type: 'text' },
  { key: 'field', label: 'Field', type: 'text' },
  { key: 'start', label: 'Start (e.g. 2021)', type: 'text' },
  { key: 'end', label: 'End (leave empty if current)', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'tags', label: 'Tags', type: 'tags' },
  CV_TOGGLE,
  HOME_TOGGLE,
];

export const CERTIFICATION_FIELDS = [
  { key: 'credential', label: 'Credential', type: 'text', required: true },
  { key: 'issuer', label: 'Issuer', type: 'text', required: true },
  { key: 'code', label: 'Exam code (optional, e.g. CLF-C02)', type: 'text' },
  { key: 'status', label: 'Status', type: 'select', options: ['planned', 'studying', 'booked', 'earned'] },
  { key: 'start', label: 'Date (issued if earned, exam date if booked)', type: 'text' },
  { key: 'badgeUrl', label: 'Badge image URL (shown once earned)', type: 'text', placeholder: 'https://images.credly.com/size/340x340/images/<id>/image.png' },
  { key: 'verifyUrl', label: 'Verify URL (shown once earned)', type: 'text', placeholder: 'https://www.credly.com/badges/<id>/public_url' },
  { key: 'description', label: 'Description', type: 'textarea' },
  CV_TOGGLE,
];

export const GROUPS = ['Identity', 'Content', 'Projects', 'Inbox'];

// Each section has its own colour, so it is easy to tell where you are.
export const SECTIONS = [
  { id: 'profile', group: 'Identity', tone: 'blue', title: 'Profile & Contact', desc: 'Name, title, summary, photo and how people reach you.', icon: <MdPerson /> },
  { id: 'personal', group: 'Identity', tone: 'pink', title: 'Personal Details', desc: 'Languages and other personal facts.', icon: <MdBadge /> },
  { id: 'copy', group: 'Content', tone: 'yellow', title: 'Site Copy', desc: 'Every heading and label on the site.', icon: <MdEditNote /> },
  { id: 'skills', group: 'Content', tone: 'green', title: 'Skills', desc: 'Skill groups shown on the Bio page and the CV.', icon: <MdBuild /> },
  { id: 'experience', group: 'Content', tone: 'green', title: 'Experience', desc: 'Jobs. The CV always lists them newest first.', icon: <MdWork /> },
  { id: 'education', group: 'Content', tone: 'orange', title: 'Education', desc: 'Degrees and schooling.', icon: <MdSchool /> },
  { id: 'certifications', group: 'Content', tone: 'pink', title: 'Certifications', desc: 'The AWS path and other certificates.', icon: <MdVerified /> },
  { id: 'photos', group: 'Content', tone: 'yellow', title: 'Photos', desc: 'Pictures for the home page, the story and the Bio page.', icon: <MdPhotoLibrary /> },
  { id: 'interests', group: 'Content', tone: 'orange', title: 'Interests', desc: 'Things you do outside work.', icon: <MdFavorite /> },
  { id: 'socials', group: 'Content', tone: 'blue', title: 'Social Links', desc: 'Profiles linked across the site.', icon: <MdShare /> },
  { id: 'donation', group: 'Content', tone: 'yellow', title: 'Donation', desc: 'The support link on the Connect page.', icon: <MdVolunteerActivism /> },
  { id: 'studio', group: 'Projects', tone: 'green', title: 'Client Sites', desc: 'Live client sites, synced from GitHub.', icon: <MdPublic /> },
  { id: 'github', group: 'Projects', tone: 'blue', title: 'GitHub Projects', desc: 'Your repositories, in display order.', icon: <FaGithub /> },
  { id: 'messages', group: 'Inbox', tone: 'orange', title: 'Messages', desc: 'Letters sent from the Connect page.', icon: <MdMailOutline /> },
];
