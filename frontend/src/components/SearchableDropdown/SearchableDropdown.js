import Select from 'react-select';
import styles from './SearchableDropdown.module.css';

// A searchable select. Its menu opens on top of the page so no card can cover it.
const SearchableDropdown = ({ className = '', ...props }) => (
  <Select
    className={[styles.root, className].filter(Boolean).join(' ')}
    classNamePrefix="sd"
    menuPlacement="auto"
    menuPortalTarget={typeof document === 'undefined' ? null : document.body}
    styles={{ menuPortal: base => ({ ...base, zIndex: 120 }) }}
    unstyled
    {...props}
  />
);

export default SearchableDropdown;
