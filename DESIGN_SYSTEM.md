# LiquidFlow Design System

## Overview
Professional, modern design system inspired by leading DeFi platforms and enterprise applications.

## Color Palette

### Primary Colors
- **Background Gradient**: `linear-gradient(135deg, #0f172a, #1e1b4b, #581c87)`
- **Brand Blue**: `#00d4ff` to `#7c3aed` (gradient)
- **Action Blue**: `#3b82f6` to `#8b5cf6` (gradient)

### Text Colors
- **Primary Text**: `#ffffff` (white)
- **Secondary Text**: `#cbd5e1` (light gray)
- **Muted Text**: `#9ca3af` (gray)

### Status Colors
- **Success/Green**: `#10b981`
- **Warning/Orange**: `#f59e0b` 
- **Error/Red**: `#ef4444`
- **Info/Purple**: `#8b5cf6`

### Background Colors
- **Card Background**: `rgba(255, 255, 255, 0.05)`
- **Card Border**: `rgba(255, 255, 255, 0.1)`
- **Accent Cards**: Color-specific gradients with left border

## Typography

### Font Family
```css
font-family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
```

### Hierarchy
- **H1 (Page Titles)**: `2.5rem, bold, #ffffff`
- **H2 (Section Headers)**: `1.5rem, bold, #ffffff`
- **H3 (Card Titles)**: `1.25rem, bold, #ffffff`
- **Body Text**: `1rem, normal, #cbd5e1`
- **Small Text**: `0.875rem, normal, #9ca3af`

## Layout System

### Container
- **Max Width**: `1200px`
- **Padding**: `2rem 1rem`
- **Margin**: `0 auto`

### Grid System
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
gap: 1.5rem;
```

## Components

### Navigation
- **Fixed top navigation** with blur backdrop
- **Brand logo** with gradient text
- **Navigation links** in light gray
- **CTA button** with blue gradient

### Cards
- **Glassmorphism effect**: `backdrop-filter: blur(10px)`
- **Subtle borders**: `1px solid rgba(255, 255, 255, 0.1)`
- **Rounded corners**: `1rem border-radius`
- **Hover effects**: Subtle shadow and transform

### Buttons
- **Primary**: Blue gradient background
- **Hover**: Slight elevation (`translateY(-2px)`)
- **Padding**: `0.75rem 1.5rem`
- **Border radius**: `0.5rem`

### Status Cards
- **Green (Portfolio)**: Success gradient with green left border
- **Blue (ETH)**: Info gradient with blue left border  
- **Purple (Tokens)**: Purple gradient with purple left border

## Interactive Elements

### Hover States
- **Buttons**: `translateY(-2px)` with enhanced shadow
- **Cards**: Increased shadow depth
- **Links**: Color transition `0.2s ease`

### Transitions
- **Standard**: `all 0.2s ease`
- **Transform**: `transform 0.2s ease`

## Spacing System

### Margin/Padding Scale
- **xs**: `0.5rem` (8px)
- **sm**: `0.75rem` (12px)
- **md**: `1rem` (16px)
- **lg**: `1.5rem` (24px)
- **xl**: `2rem` (32px)
- **2xl**: `3rem` (48px)

## Responsive Design

### Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`

### Grid Behavior
- **Auto-fit**: Columns adjust based on content
- **Min width**: `280px` for cards
- **Flex wrap**: For action buttons

## Implementation Notes

### CSS Approach
- **Inline styles** for Railway deployment reliability
- **No external CSS dependencies** to avoid caching issues
- **Consistent style objects** for reusability

### Browser Support
- **Modern browsers** with CSS Grid and Flexbox
- **Backdrop filter** support for glassmorphism
- **CSS gradients** for brand elements

## Usage Examples

### Page Structure
```jsx
<div style={styles.body}>
  <nav style={styles.nav}>
    {/* Navigation content */}
  </nav>
  <div style={styles.container}>
    {/* Page content */}
  </div>
</div>
```

### Card Component
```jsx
<div style={styles.card}>
  <h3 style={styles.cardTitle}>Title</h3>
  {/* Card content */}
</div>
```

### Status Card
```jsx
<div style={styles.statCardGreen}>
  <div style={styles.statIcon}>💰</div>
  <div style={styles.statValue}>$1,234</div>
  <div style={styles.statLabel}>Portfolio Value</div>
</div>
``` 