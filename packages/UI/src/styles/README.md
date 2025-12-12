# Styles

This directory contains the core CSS files that define the visual styling and theming system for the Core-UI library.

## Components.css

Contains styling for reusable UI components and base element styles.

**Includes:**
- Typography (headings, paragraphs, body text)
- Link styling
- Button styles and variants
- Form elements (inputs, selects, textareas)
- Table styling
- Card layouts
- Navigation elements
- Modal and overlay styles
- Loading indicators
- Notification components
- Responsive breakpoints and utilities

## GeneralWrappers.css

Provides wrapper classes and utility styles for common layout patterns.

**Includes:**
- Input container wrappers with required field indicators
- Password input containers with show/hide toggle
- Form layout utilities
- Flexbox and grid helpers
- Spacing and alignment classes
- Responsive container classes
- Accessibility helpers

## Theme.css

Defines the CSS custom properties (variables) for the theming system.

**Includes:**
- Font size variables
- Color palette definitions (light/dark themes)
- Status colors (success, warning, error, info)
- App brand colors
- Background color variants
- Text color variables
- Border and shadow definitions
- Animation and transition settings
- Color blindness simulation support
- Responsive breakpoint variables

## Usage

These styles are imported globally and provide the foundation for all UI components. The theme system uses CSS custom properties that can be dynamically updated for theme switching and accessibility features.

```css
/* Import in your main CSS file */
@import './styles/Theme.css';
@import './styles/GeneralWrappers.css';
@import './styles/Components.css';
```

The theme variables are automatically applied throughout the component library, ensuring consistent styling and easy customisation.