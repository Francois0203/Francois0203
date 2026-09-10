import { HOME_FIELDS }     from './home';
import { BIO_FIELDS }      from './bio';
import { PROJECTS_FIELDS } from './projects';
import { CONNECT_FIELDS }  from './connect';
import { FOOTER_FIELDS }   from './footer';

// Groups the editable copy per page for the admin "Site Copy" editor. The
// `key` matches the group name pages read from the portfolio/copy document.
export const COPY_SCHEMA = [
  { key: 'home',     label: 'Home',     fields: HOME_FIELDS },
  { key: 'bio',      label: 'Bio',      fields: BIO_FIELDS },
  { key: 'projects', label: 'Projects', fields: PROJECTS_FIELDS },
  { key: 'connect',  label: 'Connect',  fields: CONNECT_FIELDS },
  /* Not a page. The footer appears on all of them, which is exactly why its
     wording is edited in one place. */
  { key: 'footer',   label: 'Footer',   fields: FOOTER_FIELDS },
];

export { resolveGroup } from './resolve';
