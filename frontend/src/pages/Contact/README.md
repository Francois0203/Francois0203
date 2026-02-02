# Contact Page

## Overview
The contact page provides visitors with multiple ways to get in touch. Features a clean, modern design with contact methods, social media links, and availability status.

## Features

### Contact Methods
- **Primary Contact Cards**: Email and phone highlighted with special styling
- **Location Information**: Physical location displayed
- **Clickable Links**: Direct mailto: and tel: links for easy contact
- **Icon Integration**: Visual icons for each contact method

### Social Media Links
- **Platform Cards**: Individual cards for each social platform
- **Branded Colors**: Each card uses the platform's brand color
- **Hover Effects**: Icons scale and cards lift on hover
- **External Links**: Open in new tabs for convenience

### Availability Banner
- **Status Indicator**: Visual dot with pulsing animation
- **Status Messages**: Customizable message based on availability
- **Color Coding**: 
  - Green for "open" (available)
  - Yellow for "busy" (limited availability)
  - Red for "closed" (not available)

### Background Effects
- **Gradient Orb**: Subtle pulsing gradient for visual interest
- **Floating Particles**: Minimal particle effects (only 3 max)
- **Performance Optimized**: Disabled on mobile/reduced-motion

## Data Source
All content is sourced from `/src/data/contact.json`:
- Heading and subtitle
- Contact methods (email, phone, location)
- Social media links with colors
- Availability status and message

## Responsive Design
- **Desktop**: Multi-column grid layout
- **Tablet**: Adjusted columns, centered content
- **Mobile**: Single-column stacked layout, full-width cards

## Contact Cards
- **Primary Cards**: Enhanced styling for main contact methods
- **Icon Section**: Large, prominent icons in colored backgrounds
- **Info Section**: Label and value with hover effects
- **Hover State**: Border color change and lift animation

## Social Cards
- **Grid Layout**: Automatically adjusts columns based on screen size
- **Icon Display**: Large platform icons with brand colors
- **Platform Name**: Displayed below icon
- **Interactive**: Scale and lift effects on hover

## Availability Banner
- **Flexible Positioning**: Bottom of page, above footer
- **Status Dot**: Animated pulsing indicator
- **Color Themes**: Matches status type
- **Responsive**: Adjusts layout for mobile

## Performance Considerations
- **Minimal Particles**: Only 3 active at once (vs 20-30 on Home)
- **Reduced on Mobile**: Disabled animations for mobile devices
- **Respects Motion Preferences**: No animations if user prefers reduced motion
- **Lightweight**: Simple CSS animations, no heavy libraries

## Accessibility
- Semantic HTML structure
- Proper link labels
- Color contrast meets standards
- Keyboard navigable
- Respects `prefers-reduced-motion`

## Icon System
Uses React Icons for:
- Contact methods (MdEmail, MdPhone, MdLocationOn)
- Social platforms (FaLinkedin, FaGithub, FaInstagram, FaOrcid)

## Customization
To update contact information:
1. Edit `/src/data/contact.json`
2. Add/remove contact methods or social links
3. Update availability status and message
4. Colors adapt automatically to theme

## Design Philosophy
- **Clean**: No clutter, easy to scan
- **Professional**: Corporate-friendly design
- **Accessible**: Multiple contact options
- **Subtle**: Animations enhance, don't distract
