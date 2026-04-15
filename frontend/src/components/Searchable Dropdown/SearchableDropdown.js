import React from 'react';
import Select from 'react-select';
import './SearchableDropdown.css';

// ─── STYLES ─────────────────────────────────────────────────────────────────
// Structural layout + CSS token references only.
// State-based styles (hover, focus, selected) live in SearchableDropdown.css
// via classNamePrefix selectors — rgba(var(--x), alpha) doesn’t resolve in JS.
const customStyles = {
  // ── Control (input wrapper) ──────────────────────────────────────────────────────────
  control: (base, { isDisabled }) => ({
    ...base,
    minHeight: '42px',
    height: 'auto',
    padding: '0',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    background: 'var(--frosted-background)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.55 : 1,
    fontSize: 'var(--font-size-base)',
    transition: 'border-color 200ms ease, box-shadow 200ms ease, background-color 200ms ease',
    // Hover + focus states are handled in CSS to allow rgba() composition
  }),

  valueContainer: (base) => ({
    ...base,
    height: 'auto',
    minHeight: '42px',
    padding: '0 var(--spacing-sm) 0 var(--spacing-md)',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--spacing-xs)',
  }),

  input: (base) => ({
    ...base,
    margin: '0',
    padding: '0',
    color: 'var(--primary-text-color)',
  }),

  // ── Indicators ────────────────────────────────────────────────────────────────
  indicatorsContainer: (base) => ({
    ...base,
    minHeight: '42px',
    alignSelf: 'stretch',
    display: 'flex',
    alignItems: 'center',
  }),

  indicatorSeparator: (base, { isDisabled }) => ({
    ...base,
    backgroundColor: 'var(--border-color)',
    marginTop: 'var(--spacing-sm)',
    marginBottom: 'var(--spacing-sm)',
    opacity: isDisabled ? 0.5 : 0.6,
  }),

  dropdownIndicator: (base, { selectProps }) => ({
    ...base,
    color: 'var(--secondary-text-color)',
    padding: '0 var(--spacing-sm)',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 150ms ease, transform 200ms ease',
    transform: selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
  }),

  clearIndicator: (base) => ({
    ...base,
    color: 'var(--secondary-text-color)',
    padding: '0 var(--spacing-xs)',
    transition: 'color 150ms ease',
  }),

  // ── Dropdown menu ─────────────────────────────────────────────────────────────
  menu: (base) => ({
    ...base,
    background: 'var(--frosted-background)',
    backdropFilter: 'blur(10px) saturate(1.1)',
    WebkitBackdropFilter: 'blur(10px) saturate(1.1)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
    marginTop: 'var(--spacing-xs)',
    zIndex: 'var(--z-dropdown)',
    overflow: 'hidden',
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),

  menuList: (base) => ({
    ...base,
    background: 'transparent',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-xs)',
    maxHeight: '300px',
  }),

  option: (base) => ({
    ...base,
    borderRadius: 'var(--radius-sm)',
    padding:      'var(--spacing-sm) var(--spacing-md)',
    cursor:       'pointer',
    fontSize:     'var(--font-size-sm)',
    color:        'var(--primary-text-color)',
    transition:   'background-color 120ms ease',
    background:   'transparent', // hover/selected states handled in CSS
  }),

  // ── Values ─────────────────────────────────────────────────────────────────
  singleValue: (base) => ({
    ...base,
    color: 'var(--primary-text-color)',
  }),

  placeholder: (base) => ({
    ...base,
    color: 'var(--tertiary-text-color)',
    position: 'absolute',
    margin: 0,
    pointerEvents: 'none',
  }),

  // ── Multi-select tags ───────────────────────────────────────────────────────────
  multiValue: (base, { isDisabled }) => ({
    ...base,
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    background: 'var(--background-3)',
    margin: '0.1rem',
    opacity: isDisabled ? 0.5 : 1,
  }),

  multiValueLabel: (base) => ({
    ...base,
    color: 'var(--primary-text-color)',
    padding: 'var(--spacing-xs) var(--spacing-sm)',
    fontSize: 'var(--font-size-xs)',
  }),

  multiValueRemove: (base) => ({
    ...base,
    color:        'var(--secondary-text-color)',
    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
    transition:   'background-color 150ms ease, color 150ms ease',
    // hover handled in CSS
  }),

  // ── Groups ───────────────────────────────────────────────────────────────────
  group: (base) => ({
    ...base,
    padding: 'var(--spacing-xs) 0',
  }),

  groupHeading: (base) => ({
    ...base,
    color: 'var(--tertiary-text-color)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: 'var(--spacing-xs) var(--spacing-md)',
    marginBottom: '0',
  }),

  // ── Empty / loading states ───────────────────────────────────────────────────────
  noOptionsMessage: (base) => ({
    ...base,
    color: 'var(--secondary-text-color)',
    fontSize: 'var(--font-size-sm)',
    padding: 'var(--spacing-md)',
  }),

  loadingMessage: (base) => ({
    ...base,
    color: 'var(--secondary-text-color)',
    fontSize: 'var(--font-size-sm)',
    padding: 'var(--spacing-md)',
  }),

  loadingIndicator: (base) => ({
    ...base,
    color: 'var(--accent-1)',
  }),
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  isClearable = true,
  isDisabled  = false,
  components: userComponents = {},
  ...props
}) => (
  <Select
    options={options}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    isClearable={isClearable}
    isDisabled={isDisabled}
    styles={customStyles}
    components={userComponents}
    classNamePrefix="searchable-select"
    menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
    {...props}
  />
);

export default SearchableDropdown;
