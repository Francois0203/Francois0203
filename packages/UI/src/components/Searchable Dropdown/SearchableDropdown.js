import React from 'react';
import Select from 'react-select';

/* Styling */
import './SearchableDropdown.css';
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/Wrappers.css';

const customStyles = {
  control: (base, { isDisabled, isFocused }) => ({
    ...base,
    fontSize: 'var(--font-size-base)',
    minHeight: '2.6em',
    height: '2.6em',
    padding: '0',
    borderRadius: '10px',
    border: `2px solid ${isFocused ? 'var(--accent-1)' : 'var(--disabled-color)'}`,
    backgroundColor: 'var(--background-1)',
    transition: 'background-color 0.25s ease, border-color 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: isFocused ? '0 0 0 1px var(--accent-1)' : 'none',
    opacity: isDisabled ? 0.6 : 1,
    '&:hover': {
      borderColor: isFocused ? 'var(--accent-1)' : 'var(--accent-1)',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    height: '2.6em',
    padding: '0 0.8em',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    gap: '0.4rem',
  }),
  input: (base) => ({
    ...base,
    margin: '0',
    padding: '0',
    color: 'var(--primary-text-color)',
    flex: 1,
    minWidth: '2px',
    position: 'relative',
    zIndex: 2,
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: '2.6em',
  }),
  menu: (base) => ({
    ...base,
    background: 'var(--background-1)',
    border: '2px solid var(--disabled-color)',
    borderRadius: '8px',
    marginTop: '0.2rem',
    zIndex: 20,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  menuList: (base) => ({
    ...base,
    background: 'var(--background-1)',
    borderRadius: '8px',
    padding: '0.2rem 0',
    maxHeight: '300px',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'var(--accent-1)'
      : state.isFocused
      ? 'var(--background-3)'
      : 'inherit',
    fontWeight: state.isSelected ? 600 : 400,
    cursor: 'pointer',
    padding: '0.5em 0.8em',
    color: 'var(--primary-text-color)',
    transition: 'background-color 0.25s ease, color 0.25s ease',
    '&:active': {
      backgroundColor: state.isSelected ? 'var(--accent-1)' : 'var(--background-3)',
    },
  }),
  singleValue: (base, { isDisabled }) => ({
    ...base,
    color: 'var(--primary-text-color)',
    opacity: isDisabled ? 0.6 : 1,
  }),
  placeholder: (base, { isDisabled }) => ({
    ...base,
    color: 'var(--disabled-color)',
    position: 'absolute',
    left: '0.8em',
    top: '50%',
    transform: 'translateY(-50%)',
    margin: 0,
    pointerEvents: 'none',
    zIndex: 1,
    opacity: isDisabled ? 0.6 : 1,
  }),
  dropdownIndicator: (base, { isDisabled, isFocused, selectProps }) => ({
    ...base,
    color: isFocused ? 'var(--accent-1)' : 'var(--disabled-color)',
    padding: '0 0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.25s ease, transform 0.25s ease',
    transform: selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    opacity: isDisabled ? 0.6 : 1,
    '&:hover': {
      color: 'var(--accent-1)',
    },
  }),
  indicatorSeparator: (base, { isDisabled }) => ({
    ...base,
    backgroundColor: 'var(--disabled-color)',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
    opacity: isDisabled ? 0.6 : 1,
  }),
  clearIndicator: (base, { isDisabled }) => ({
    ...base,
    color: 'var(--disabled-color)',
    padding: '0 0.8rem',
    transition: 'color 0.25s ease',
    opacity: isDisabled ? 0.6 : 1,
    '&:hover': {
      color: 'var(--accent-1)',
    },
  }),
  // Multi-select styles
  multiValue: (base, { isDisabled }) => ({
    ...base,
    backgroundColor: 'var(--background-3)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    margin: '0.1rem',
    opacity: isDisabled ? 0.6 : 1,
  }),
  multiValueLabel: (base, { isDisabled }) => ({
    ...base,
    color: 'var(--primary-text-color)',
    padding: '0.2rem 0.4rem',
    fontSize: '0.9em',
    opacity: isDisabled ? 0.6 : 1,
  }),
  multiValueRemove: (base, { isDisabled }) => ({
    ...base,
    color: 'var(--disabled-color)',
    borderRadius: '0 6px 6px 0',
    transition: 'background-color 0.25s ease, color 0.25s ease',
    opacity: isDisabled ? 0.6 : 1,
    '&:hover': {
      backgroundColor: 'var(--accent-1)',
      color: 'var(--background-1)',
    },
  }),
  // Group styles (for grouped options)
  group: (base) => ({
    ...base,
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
  }),
  groupHeading: (base) => ({
    ...base,
    color: 'var(--disabled-color)',
    fontSize: '0.85em',
    fontWeight: 600,
    textTransform: 'uppercase',
    padding: '0.5rem 0.8rem',
    marginBottom: '0.2rem',
  }),
  // Loading and no options messages
  loadingMessage: (base) => ({
    ...base,
    color: 'var(--disabled-color)',
    padding: '0.8rem',
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: 'var(--disabled-color)',
    padding: '0.8rem',
  }),
  // Loading indicator
  loadingIndicator: (base) => ({
    ...base,
    color: 'var(--accent-1)',
  }),
};

const SearchableDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  isClearable = true,
  isDisabled = false,
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