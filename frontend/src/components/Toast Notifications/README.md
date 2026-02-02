# Toast Notifications

A temporary notification component that displays messages with auto-dismiss and manual close functionality.

## Features

- Auto-dismiss after 3 seconds
- Multiple notification types (info, success, warning, error)
- Smooth slide-in/slide-out animations
- Close button for manual dismissal
- Support for error codes
- Optimized with React.memo for performance

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string|number` | - | Unique identifier for the toast |
| `type` | `string` | `'info'` | Type of notification ('info', 'success', 'warning', 'error') |
| `title` | `string` | - | Title text for the notification |
| `message` | `string` | - | Main message content |
| `errorCode` | `string|number` | - | Optional error code to display |
| `onClose` | `function` | - | Callback when the toast should be closed |

## Usage

```jsx
import ToastNotification from './components/Toast Notifications/ToastNotification';

function NotificationContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          errorCode={toast.errorCode}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}
```