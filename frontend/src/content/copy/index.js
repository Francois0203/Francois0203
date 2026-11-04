import { HOME_FIELDS }     from './home';
import { BIO_FIELDS }      from './bio';
import { PROJECTS_FIELDS } from './projects';
import { CONNECT_FIELDS }  from './connect';
import { FOOTER_FIELDS }   from './footer';
import { CREDENTIALS_FIELDS } from './credentials';
import { PHOTOS_FIELDS }   from './photos';
import { SITE_FIELDS }     from './site';
import { NOT_FOUND_FIELDS } from './notFound';
import { LEGAL_FIELDS }    from './legal';
import { A11Y_FIELDS }     from './a11y';

// area groups the list in the admin, tone colours it, hint says where the words appear.
export const COPY_SCHEMA = [
  { key: 'home',     label: 'Home',     area: 'Pages', tone: 'yellow', hint: 'The first page people see', fields: HOME_FIELDS },
  { key: 'bio',      label: 'Bio',      area: 'Pages', tone: 'blue',   hint: 'The CV page and the PDF', fields: BIO_FIELDS },
  { key: 'projects', label: 'Projects', area: 'Pages', tone: 'green',  hint: 'Client sites and repositories', fields: PROJECTS_FIELDS },
  { key: 'connect',  label: 'Connect',  area: 'Pages', tone: 'orange', hint: 'The letter and other ways in', fields: CONNECT_FIELDS },
  { key: 'notFound', label: 'Page not found', area: 'Pages', tone: 'pink', hint: 'Shown for a wrong address', fields: NOT_FOUND_FIELDS },
  { key: 'legal',    label: 'Privacy and terms', area: 'Pages', tone: 'blue', hint: 'The two policy pages', fields: LEGAL_FIELDS },
  { key: 'site',     label: 'Site-wide', area: 'Shared', tone: 'pink', hint: 'Menu, intro, error and loading', fields: SITE_FIELDS },
  { key: 'footer',   label: 'Footer',   area: 'Shared', tone: 'orange', hint: 'The bottom of every page', fields: FOOTER_FIELDS },
  { key: 'credentials', label: 'Certifications', area: 'Shared', tone: 'pink', hint: 'The AWS path on Home and Bio', fields: CREDENTIALS_FIELDS },
  { key: 'photos',   label: 'Photos',   area: 'Shared', tone: 'yellow', hint: 'Photo table, gallery and viewer', fields: PHOTOS_FIELDS },
  { key: 'a11y',     label: 'Screen readers', area: 'Accessibility', tone: 'green', hint: 'Words only screen readers hear', fields: A11Y_FIELDS },
];

export const COPY_AREAS = ['Pages', 'Shared', 'Accessibility'];

export { resolveGroup } from './resolve';
