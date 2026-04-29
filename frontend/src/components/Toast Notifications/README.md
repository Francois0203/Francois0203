# Toast Notifications

Animated toast notification system with auto-dismiss, manual close, and portal rendering.

## Files

| File | Purpose |
|---|---|
| `ToastContext.js` | Context + provider; portal-renders the toast stack |
| `ToastNotification.js` | Individual toast card with close animation |
| `ToastContainer.js` | Standalone container for use outside of the provider |

## Features

- Four types: `success`, `error`, `warning`, `info`
- Auto-dismisses after 3 s; animated height collapse on close
- Manual close button
- Portalled to a dedicated fixed overlay node — z-index never trapped
- `React.memo` with custom comparator prevents unnecessary renders
- Optional `errorCode` field

## ToastNotification Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string \| number` | — | Unique identifier |
| `type` | `string` | `'info'` | `'success'` \| `'error'` \| `'warning'` \| `'info'` |
| `title` | `string` | — | Bold heading text |
| `message` | `string` | — | Body text |
| `errorCode` | `string \| number` | — | Displayed as `Code: <value>` |
| `onClose` | `function` | — | Called with `id` when dismissed |

## Usage

```jsx
import { ToastProvider, useToast } from '../../components/Toast Notifications/ToastContext';

// Wrap your app
function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
}

// Use anywhere inside the provider
function SomeComponent() {
  const { showToast } = useToast();

  return (
    <button onClick={() => showToast('success', 'Saved!', 'Your changes were saved.')}>
      Save
    </button>
  );
}
```
