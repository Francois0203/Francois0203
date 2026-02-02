# Projects Page

## Overview
The projects page showcases portfolio work in an industry-standard, professional layout. Projects are displayed as compact cards with expandable details.

## Features

### Compact Card Design
- **Summary View**: Each project shows title, subtitle, brief summary, and tech stack preview
- **Expandable Details**: Click "Read More" to reveal complete project information
- **Professional Layout**: Clean, modern design that works across all devices

### Project Information
- **Overview Section**: Full project description
- **Technology Stack**: Visual grid of all technologies with icons and colors
- **Key Features**: Highlighted feature cards with icons and descriptions
- **Highlights List**: Bullet points of notable achievements

### Interactive Elements
- **Read More/Less Button**: Smooth toggle between summary and full view
- **Hover Effects**: Subtle animations on cards and tech badges
- **External Links**: GitHub/live demo links with icon buttons

### Tech Stack Preview
- **Icon Badges**: First 5 technologies shown as colored icons
- **Overflow Indicator**: "+N" badge if more than 5 technologies
- **Hover Tooltips**: Technology names appear on hover

## Data Source
All project content is sourced from `/src/data/projects.json`:
- Easy to add/remove projects
- Structured format for consistency
- Supports rich content (features, highlights, tech stack)

## Responsive Design
- **Desktop**: Multi-column features grid, full-width cards
- **Tablet**: Adjusted spacing, single-column features
- **Mobile**: Stacked layout, full-width buttons, compact spacing

## Card States
1. **Collapsed** (default): Shows summary, limited tech stack, "Read More" button
2. **Expanded**: Reveals all sections with smooth animation
3. **Hover**: Border color change, subtle lift effect

## Sections in Expanded View
1. **Overview**: Complete project description
2. **Technology Stack**: All technologies in grid layout
3. **Key Features**: Feature cards with icons (if available)
4. **Highlights**: Achievement bullets (if available)

## Icon System
Uses React Icons library with mapping for:
- Technology icons (React, Python, Docker, etc.)
- Feature icons (Rocket, Cog, Palette, etc.)
- Link icons (GitHub, NPM, etc.)

## Performance
- **React.memo**: Project cards memoized to prevent unnecessary re-renders
- **Conditional Rendering**: Expanded content only rendered when needed
- **Optimized Animations**: CSS transitions instead of JavaScript

## Accessibility
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigable
- Respects `prefers-reduced-motion`

## Customization
To add a new project:
1. Add entry to `/src/data/projects.json`
2. Include all required fields: title, subtitle, description, techStack
3. Optional: features, highlights, links, summary
4. Icons must be defined in IconMap

## Future Enhancements
- Filter by technology
- Search functionality
- Sort options
- Project categories/tags
