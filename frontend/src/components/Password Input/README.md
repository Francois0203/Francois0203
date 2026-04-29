# PasswordInput

Password field with an inline show/hide eye-toggle button. Forwards all native `<input>` props and supports an optional label with automatic required-field asterisk.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label text rendered in a `<label>` above the input. Omit to suppress the label. |
| `id` | `string` | — | Connects the `<label>` `for` to the input `id`. Required when `label` is used. |
| `wrapperClassName` | `string` | — | Extra class names on the outer wrapper `<div>` |
| `className` | `string` | — | Class names forwarded to the `<input>` element |
| `...inputProps` | `*` | — | All other props (e.g. `value`, `onChange`, `required`, `placeholder`) are forwarded to `<input>` |

## Usage

```jsx
import { PasswordInput } from '../../components';

<PasswordInput
  id="user-password"
  label="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
  placeholder="Enter password"
/>
```

## Notes

- The eye-toggle button uses `aria-label="Show password"` / `"Hide password"` and is keyboard accessible (tab + Enter/Space).
- A red `*` asterisk appears automatically when the input has a `required` attribute and disappears once the field has a valid value — handled via CSS `:has()`.
- The component does not manage visibility state externally; it owns the show/hide toggle internally.
- Pairs well with the global `.input-container` wrapper class in `Wrappers.css` for consistent form layout.
