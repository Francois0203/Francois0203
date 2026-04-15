# Searchable Dropdown

React-Select wrapper styled with CSS custom property tokens to match the app theme.

## Features

- Searchable with filtering
- Single and multi-select modes
- Custom styles aligned to `Theme.css` variables via JS style overrides
- State-based styles (hover, focus, selected) in `SearchableDropdown.css`
- Menu portalled to `<body>` for correct stacking
- Keyboard navigation built in

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `array` | — | `[{ value, label }]` option objects |
| `value` | `object \| array` | — | Currently selected value(s) |
| `onChange` | `function` | — | Called on selection change |
| `placeholder` | `string` | — | Input placeholder text |
| `isClearable` | `boolean` | `true` | Show clear button |
| `isDisabled` | `boolean` | `false` | Disables the control |
| `components` | `object` | `{}` | Override react-select sub-components |

## Usage

```jsx
import SearchableDropdown from './components/Searchable Dropdown';

const options = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
];

function MyForm() {
  const [selected, setSelected] = useState(null);

  return (
    <SearchableDropdown
      options={options}
      value={selected}
      onChange={setSelected}
      placeholder="Choose a fruit"
    />
  );
}
```
