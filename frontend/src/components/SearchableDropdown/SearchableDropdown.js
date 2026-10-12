import Select from 'react-select';
import './SearchableDropdown.css';

const SearchableDropdown = (props) => (
  <Select
    classNamePrefix="sd"
    menuPlacement="auto"
    unstyled
    {...props}
  />
);

export default SearchableDropdown;
