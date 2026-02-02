# Bio Page

## Overview
The bio page presents a comprehensive professional profile with personal information, work experience, education, skills, and interests. Designed to be clean, professional, and easy to scan.

## Features

### Profile Card
- **Profile Image**: Professional headshot with accent-colored border
- **Contact Information**: Email, phone, location, date of birth
- **Social Links**: LinkedIn, GitHub, Instagram, ORCID with hover effects
- **Personal Details**: Languages, driver's license, faith

### Experience Section (Timeline)
- **Chronological Timeline**: Visual timeline with gradient line and dots
- **Job Details**: Title, company, location, period, and description
- **Hover Effects**: Cards animate on hover for interactivity
- **Clean Layout**: Easy to scan and read

### Education Section (Grid)
- **Degree Cards**: Each degree in its own card
- **Institution**: University/school name prominently displayed
- **Period**: Time frame for each degree
- **Details**: Course highlights or focus areas

### Skills Section (Categorized Grid)
- **Category Cards**: Skills grouped by type (Programming, Frameworks, Professional)
- **Tag System**: Each skill as an interactive tag
- **Hover Effects**: Tags animate to show interactivity

### Hobbies Section
- **Interest Tags**: Personal interests displayed as interactive tags
- **Clean Display**: Simple, scannable layout

## Data Source
All content is sourced from `/src/data/bio.json`:
- Personal information
- Contact details
- Social media links
- Work experience history
- Education background
- Skills by category
- Hobbies and interests

## Responsive Design
- **Desktop**: Side-by-side profile image and info, multi-column grids
- **Tablet**: Centered profile card, adjusted grid columns
- **Mobile**: Single-column layout, stacked elements, smaller image

## Section Structure
1. **Profile Section**: Top-level overview with image and contact
2. **Experience Section**: Timeline-based work history
3. **Education Section**: Academic background in grid cards
4. **Skills Section**: Categorized technical and professional skills
5. **Hobbies Section**: Personal interests

## Interactive Elements
- **Social Links**: Hover effect with background color change
- **Timeline Items**: Slide animation on hover
- **Education Cards**: Lift effect on hover
- **Skill Tags**: Individual hover animations
- **Hobby Tags**: Interactive hover states

## Icons
Uses React Icons for:
- Contact information (email, phone, location, calendar)
- Section headers (work, school, code)
- Social media (LinkedIn, GitHub, Instagram, ORCID)

## Accessibility
- Semantic HTML with proper heading hierarchy
- Links have proper aria labels
- Color contrast meets WCAG standards
- Respects `prefers-reduced-motion`

## Performance
- No heavy animations that could impact performance
- CSS transitions instead of JavaScript animations
- Optimized image loading

## Customization
To update bio information:
1. Edit `/src/data/bio.json`
2. Update profile image at `/src/Images/Profile.jpeg`
3. Colors automatically adapt to theme

## Design Philosophy
- **Professional**: Clean, corporate-friendly design
- **Scannable**: Easy to quickly find information
- **Interactive**: Subtle animations provide feedback
- **Responsive**: Works perfectly on all devices
