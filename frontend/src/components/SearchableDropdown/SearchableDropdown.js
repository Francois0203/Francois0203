import Select from 'react-select';
import './SearchableDropdown.css';

/*
 * react-select in the site's tokens. Styled through its class prefix rather
 * than its `styles` prop: that prop takes a JS object, so every token would
 * have to be read out of the computed style and kept in sync by hand.
 */
const SearchableDropdown = (props) => (
  <Select
    classNamePrefix="sd"
    menuPlacement="auto"
    unstyled
    {...props}
  />
);

export default SearchableDropdown;
