# Home Page

## Overview
The home page serves as the landing page and first impression for visitors. It features a clean, modern design with animated elements that adapt to device capabilities.

## Features

### Hero Section
- **Dynamic Typing Animation**: Cycles through professional titles with smooth typing/deleting effects
- **Gradient Text Effects**: Eye-catching gradient applied to name for visual impact
- **Responsive Typography**: Scales appropriately across all device sizes

### Quick Stats
- **Statistics Cards**: Displays key metrics (years of experience, projects, technologies)
- **Icon Integration**: Uses React Icons for visual representation
- **Hover Effects**: Interactive card animations on hover

### Call to Action
- **Primary Button**: Directs users to view projects
- **Secondary Button**: Encourages visitors to make contact
- **Ripple Effects**: Subtle animation feedback on interaction

### Background Animations
- **Floating Code Symbols**: Animated coding symbols float across the background
- **Gradient Orbs**: Subtle glowing orbs create depth
- **Performance Optimized**: Reduces particle count on mobile devices
- **Respects Motion Preferences**: Disables animations for users with reduced motion settings

## Data Source
All content is sourced from `/src/data/home.json`, making it easy to update text without touching code.

## Responsive Design
- **Desktop**: Full-width hero with horizontal stat cards
- **Tablet**: Adjusted spacing and font sizes
- **Mobile**: Single-column layout, stacked buttons, reduced animations

## Accessibility
- Semantic HTML structure
- Respects `prefers-reduced-motion` media query
- Keyboard navigable
- Proper ARIA labels on interactive elements

## Performance Considerations
- Animations throttled to prevent performance issues
- Particle effects reduced on mobile devices
- CSS animations used instead of JavaScript where possible
- Lazy loading of heavy components

## Customization
To modify content:
1. Edit `/src/data/home.json` for text content
2. Adjust colors in `Theme.css` using CSS custom properties
3. Modify animation timings in `Home.module.css`
