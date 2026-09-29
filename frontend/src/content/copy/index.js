import { HOME_FIELDS }     from './home';
import { BIO_FIELDS }      from './bio';
import { PROJECTS_FIELDS } from './projects';
import { CONNECT_FIELDS }  from './connect';
import { FOOTER_FIELDS }   from './footer';
import { CREDENTIALS_FIELDS } from './credentials';

// Groups the editable copy per page for the admin "Site Copy" editor. The
// `key` matches the group name pages read from the portfolio/copy document.
export const COPY_SCHEMA = [
  { key: 'home',     label: 'Home',     fields: HOME_FIELDS },
  { key: 'bio',      label: 'Bio',      fields: BIO_FIELDS },
  { key: 'projects', label: 'Projects', fields: PROJECTS_FIELDS },
  { key: 'connect',  label: 'Connect',  fields: CONNECT_FIELDS },
  // Not pages: the footer and the badges appear on several.
  { key: 'footer',   label: 'Footer',   fields: FOOTER_FIELDS },
  { key: 'credentials', label: 'Certifications', fields: CREDENTIALS_FIELDS },
];

export { resolveGroup } from './resolve';
