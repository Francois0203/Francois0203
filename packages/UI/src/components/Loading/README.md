# Loading

A spectacular Christian-themed loading component featuring divine animations, rotating Bible verses, and heavenly visual effects. Perfect for spiritual applications and faith-based experiences.

## ✨ Features

- **Central Cross Animation**: Rotating cross with golden halo and divine light rays
- **Floating Christian Symbols**: Praying hands, dove, angel wings, Bible, holy oak, and prayer icons orbiting around
- **Rotating Bible Verses**: Inspirational verses that cycle every 3 seconds
- **Heavenly Particles**: Floating particles creating an ethereal atmosphere
- **Ambient Light Effects**: Subtle glowing orbs for spiritual ambiance
- **Progress Indicator**: Animated progress bar with flowing effects
- **Multiple Sizes**: Small, medium, and large variants
- **Responsive Design**: Optimized for all screen sizes
- **Glassmorphism**: Modern backdrop blur effects
- **Theme Integration**: Uses Theme.css variables for consistent styling

## 🎨 Christian Symbolism

The loading component incorporates meaningful Christian symbols:
- ✝ **Cross**: Central symbol of faith with rotating halo
- 🙏 **Praying Hands**: Represents prayer and devotion
- 🕊️ **Dove**: Symbol of the Holy Spirit and peace
- 👼 **Angel Wings**: Heavenly messengers and divine presence
- 📖 **Bible**: The Word of God
- 🌳 **Holy Oak**: Spiritual strength and endurance
- 🤲 **Prayer**: Direct communication with God

## 📖 Bible Verses

Automatically cycles through inspirational verses:
- "Wait for the LORD; be strong and take heart and wait for the LORD." (Psalm 27:14)
- "Be still before the LORD and wait patiently for him." (Psalm 37:7)
- "The LORD is good to those whose hope is in him, to the one who seeks him." (Lamentations 3:25)
- "But those who hope in the LORD will renew their strength." (Isaiah 40:31)
- "Trust in the LORD with all your heart and lean not on your own understanding." (Proverbs 3:5)

## 🎯 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | `'Loading...'` | The main loading message text |
| `showVerse` | `boolean` | `true` | Whether to display rotating Bible verses |
| `size` | `string` | `'medium'` | Size variant: `'small'`, `'medium'`, `'large'` |
| `variant` | `string` | `'default'` | Visual variant (for future expansion) |

## 💡 Usage Examples

### Basic Usage
```jsx
import Loading from './components/Loading';

function MyComponent({ isLoading }) {
  if (isLoading) {
    return <Loading message="Connecting to heaven..." />;
  }

  return <div>Divine content loaded!</div>;
}
```

### With Custom Message and Size
```jsx
<Loading
  message="Seeking God's wisdom..."
  size="large"
  showVerse={true}
/>
```

### Minimal Loading (No Verses)
```jsx
<Loading
  message="Loading..."
  showVerse={false}
  size="small"
/>
```

## 🎨 Styling

The component uses CSS modules and integrates seamlessly with your Theme.css system:
- `--accent-1`, `--accent-2`: For cross and symbol colors
- `--warning-color`: For halo and divine light effects
- `--primary-text-color`: For text and verses
- `--background-1`, `--background-2`: For glassmorphism backgrounds

## 📱 Responsive Design

- **Desktop**: Full heavenly experience with all animations
- **Tablet**: Optimized symbol spacing and text sizes
- **Mobile**: Compact design maintaining spiritual essence

## 🙏 Spiritual Experience

This loading component transforms waiting time into a moment of spiritual reflection, featuring:
- Meditative animations that encourage patience
- Biblical encouragement during loading states
- Visual reminders of faith and divine presence
- Peaceful, non-intrusive design that soothes rather than agitates

Perfect for Christian applications, devotionals, Bible study apps, and faith-based experiences!