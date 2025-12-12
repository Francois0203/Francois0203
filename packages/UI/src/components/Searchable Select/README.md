# Searchable Select

A customizable searchable dropdown component built on react-select with theme integration.

## Features

- Searchable dropdown with filtering
- Custom styling matching the app theme
- Support for single and multi-select
- Keyboard navigation
- Responsive design
- Integration with CSS custom properties

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `array` | - | Array of option objects with `value` and `label` |
| `value` | `object|array` | - | Currently selected value(s) |
| `onChange` | `function` | - | Callback when selection changes |
| `placeholder` | `string` | `'Select...'` | Placeholder text |
| `isMulti` | `boolean` | `false` | Whether multiple selections are allowed |
| `isDisabled` | `boolean` | `false` | Whether the select is disabled |

## Usage

```jsx
import SearchableSelect from './components/Searchable Select';

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' }
];

function MyForm() {
  const [selected, setSelected] = useState(null);

  return (
    <SearchableSelect
      options={options}
      value={selected}
      onChange={setSelected}
      placeholder="Choose a fruit"
    />
  );
}
```