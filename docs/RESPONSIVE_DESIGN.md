# Responsive Design Documentation

## Overview

The application is now fully responsive across desktop, tablet, and mobile devices. The design uses a **mobile-first approach** with progressive enhancement for larger screens.

## Breakpoints

The responsive design uses a **card-first approach for tablets and mobile**:

| Device Type | Screen Width | Layout Strategy |
|-------------|--------------|-----------------|
| **Desktop** | > 1200px | Full table layout with all columns visible |
| **Tablet & Mobile** | ≤ 1200px | **Card-based layout** (no horizontal scrolling) |
| **Mobile** | < 767px | Card layout with full-screen forms |
| **Small Mobile** | < 480px | Compact card layout |

## Design Strategies by Device

### Desktop (> 1200px)
- **Tables**: Full width with all columns visible
- **Forms**: Centered modal overlay (500px width)
- **Buttons**: Standard size with hover effects
- **Typography**: Large, readable fonts (18px base)

### Tablet (768px - 1200px)
- **Tables**: **Card-based layout** (same as mobile)
  - Prevents horizontal scrolling on rooms table (9 columns)
  - Table headers hidden
  - Each row becomes a card
  - Data labels shown inline using `data-label` attributes
  - Cards have rounded corners and shadows
- **Forms**: Responsive width (90% max 600px)
- **Content**: Moderate margins and padding (1.5rem)
- **Typography**: Medium fonts (16px)
- **Buttons**: Auto width (not full width)

### Mobile (< 767px)
- **Tables**: **Card-based layout** (same as tablet)
- **Forms**: Full-screen overlay
  - 100% width and height
  - Scrollable content
  - Full-width buttons
- **Buttons**: Full width for better touch targets
- **Content**: Reduced margins (1rem)
- **Typography**: Optimized for mobile (16px to prevent zoom)

### Small Mobile (< 480px)
- **Further optimizations**: Smaller fonts (14px), tighter spacing
- **Cards**: Reduced padding for more content visibility
- **Content**: Minimal margins (0.75rem)

## Card Layout Implementation

### How It Works

On mobile devices (< 767px), tables are transformed into cards using CSS:

1. **Hide table headers**: `thead { display: none; }`
2. **Convert to block layout**: All table elements become `display: block`
3. **Style as cards**: Each `<tr>` becomes a card with:
   - Border and border-radius
   - Box shadow
   - Padding
   - Margin between cards

4. **Add data labels**: Each `<td>` displays its label using CSS `::before` pseudo-element:
   ```css
   table td::before {
     content: attr(data-label);
     font-weight: bold;
   }
   ```

### JavaScript Implementation

Both `people.js` and `rooms.js` add `data-label` attributes to each cell:

**People Table:**
```javascript
cells[0].setAttribute("data-label", "Name")
cells[1].setAttribute("data-label", "Email")
cells[2].setAttribute("data-label", "Notes")
cells[3].setAttribute("data-label", "Schedule")
```

**Rooms Table:**
```javascript
cells[0].setAttribute("data-label", "Property")
cells[1].setAttribute("data-label", "Address")
cells[2].setAttribute("data-label", "Type")
cells[3].setAttribute("data-label", "Price")
cells[4].setAttribute("data-label", "Available From")
cells[5].setAttribute("data-label", "Status")
cells[6].setAttribute("data-label", "Landlord")
cells[7].setAttribute("data-label", "Notes")
```

### Card Layout Example

**Desktop View:**
```
┌─────────────────────────────────────────────────────────┐
│ Name    │ Email           │ Notes      │ Schedule │ Actions │
├─────────────────────────────────────────────────────────┤
│ John    │ john@email.com  │ Developer  │ 12/1/25  │ Edit Delete │
└─────────────────────────────────────────────────────────┘
```

**Mobile Card View:**
```
┌──────────────────────────────┐
│  Name:      John             │
│  Email:     john@email.com   │
│  Notes:     Developer        │
│  Schedule:  12/1/25          │
│  ─────────────────────────   │
│  [Edit]  [Delete]            │
└──────────────────────────────┘
```

## Form Responsiveness

### Desktop/Tablet
- Forms appear as centered modal overlays
- Fixed width (500px on desktop, 90% on tablet)
- Semi-transparent background overlay

### Mobile
- Forms take full screen
- 100% width and height
- Scrollable if content exceeds viewport
- Full-width input fields and buttons
- 16px font size to prevent iOS zoom

## Touch Optimization

### Mobile Enhancements
1. **Larger touch targets**: Buttons are full-width on mobile
2. **Adequate spacing**: Increased padding between interactive elements
3. **Smooth scrolling**: `-webkit-overflow-scrolling: touch` for tables
4. **No zoom on input**: 16px minimum font size prevents iOS auto-zoom

## Testing Responsive Design

### Browser DevTools
1. Open Chrome/Firefox DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M / Cmd+Shift+M)
3. Test these device presets:
   - **iPhone SE** (375px) - Small mobile
   - **iPhone 12 Pro** (390px) - Standard mobile
   - **iPad** (768px) - Tablet
   - **iPad Pro** (1024px) - Large tablet
   - **Desktop** (1920px) - Desktop

### Manual Testing
1. **Resize browser window** to see breakpoint transitions
2. **Test on actual devices** for real-world performance
3. **Check orientation changes** (portrait/landscape)

## Key CSS Features

### Media Queries
```css
/* Tablet & Mobile - Card Layout */
@media screen and (max-width: 1200px) {
  /* Card-based layout for all tables */
  /* Prevents horizontal scrolling */
}

/* Mobile - Full Screen Forms */
@media screen and (max-width: 767px) {
  /* Full-screen forms */
  /* Full-width buttons */
}

/* Small Mobile - Compact Layout */
@media screen and (max-width: 480px) {
  /* Tighter spacing */
  /* Smaller fonts */
}
```

### Flexbox for Layout
- Body uses flexbox for vertical layout
- Content area grows to fill available space
- Footer stays at bottom

### CSS Grid (Future Enhancement)
Consider using CSS Grid for more complex layouts in future iterations.

## Accessibility Considerations

1. **Font Sizes**: Minimum 16px on mobile for readability
2. **Touch Targets**: Minimum 44x44px for buttons (iOS guidelines)
3. **Contrast**: Maintained across all screen sizes
4. **Semantic HTML**: Proper use of headings, labels, and ARIA attributes
5. **Keyboard Navigation**: All interactive elements are keyboard accessible

## Performance Optimizations

1. **CSS-only transformations**: No JavaScript required for layout changes
2. **Hardware acceleration**: Using `transform` for positioning
3. **Minimal reflows**: Efficient CSS selectors
4. **Touch scrolling**: Native smooth scrolling on mobile

## Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (iOS 12+)
- ✅ Chrome Mobile (Android)

## Future Enhancements

1. **Progressive Web App (PWA)**: Add service worker for offline support
2. **Dark Mode**: Add `prefers-color-scheme` media query support
3. **Print Styles**: Optimize for printing
4. **Landscape Optimization**: Better use of horizontal space on mobile landscape
5. **Swipe Gestures**: Add swipe-to-delete on mobile cards
6. **Infinite Scroll**: Load more data as user scrolls (for large datasets)

## Files Modified

- **`public/css/styles.css`**: Added responsive media queries (240+ lines)
- **`public/js/people.js`**: Added `data-label` attributes to table cells
- **`public/js/rooms.js`**: Added `data-label` attributes to table cells

## Maintenance Notes

When adding new table columns:
1. Add the column to the HTML table header
2. Add the cell in the JavaScript DOM function
3. **Add the `data-label` attribute** with the column name
4. Test on mobile to ensure card layout displays correctly

When adding new forms:
1. Use the existing `.container` and `form` classes
2. Forms will automatically be responsive
3. Ensure all inputs have proper labels for accessibility

