import React, { useState } from 'react';
import { SearchableDropdown } from '../../../src';

export default {
  title: 'Components/Searchable Dropdown',
  component: SearchableDropdown,
};

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

export const Default = () => {
  const [value, setValue] = useState(null);
  return (
    <div className="input-container">
      <label>Select an option</label>
      <SearchableDropdown
        options={options}
        value={value}
        onChange={setValue}
        isDisabled={false}
        placeholder="Select an option"
        required={true}
      />
    </div>
  );
};