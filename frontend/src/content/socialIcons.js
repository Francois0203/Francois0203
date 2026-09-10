import {
  FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaYoutube,
  FaEnvelope, FaGlobe, FaFacebook,
} from 'react-icons/fa';
import { SiOrcid, SiHackerrank, SiCodewars } from 'react-icons/si';

/**
 * A mark for each social platform, keyed on the platform key stored in
 * Firestore.
 *
 * Extracted from the Connect page so the footer reads the same table. Two
 * copies would drift the first time a platform was added: one surface would
 * show its logo and the other a generic globe.
 *
 * The fallback is a globe rather than nothing, so an unrecognised platform is
 * still a complete row instead of a label with a hole where the icon goes.
 */
const SOCIAL_ICONS = {
  github:     FaGithub,
  linkedin:   FaLinkedin,
  twitter:    FaTwitter,
  x:          FaTwitter,
  instagram:  FaInstagram,
  youtube:    FaYoutube,
  email:      FaEnvelope,
  facebook:   FaFacebook,
  orcid:      SiOrcid,
  hackerrank: SiHackerrank,
  codewars:   SiCodewars,
};

export const getSocialIcon = (key = '') =>
  SOCIAL_ICONS[String(key || '').toLowerCase()] ?? FaGlobe;
