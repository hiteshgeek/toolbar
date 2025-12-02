# Toolbar Component Documentation

A flexible, customizable toolbar component with advanced features including display modes, size variants, dragging, and snapping functionality.

## Table of Contents

1. [Getting Started](./getting-started.md)
2. [Configuration Options](./configuration.md)
3. [Display Modes](./display-modes.md)
4. [Force Display Mode](./force-display-mode.md)
5. [Size Variants](./size-variants.md)
6. [Dragging & Positioning](./dragging.md)
7. [Snapping](./snapping.md)
8. [API Reference](./api-reference.md)
9. [Styling & Customization](./styling.md)

## Features Overview

### Display Modes
The toolbar supports three display modes for tools:
- **Icon Only** - Circular buttons with icons
- **Label Only** - Rectangular buttons with text labels
- **Both** - Buttons with both icons and labels

### Force Display Mode
Individual tools can override the global display mode, ensuring specific buttons always show in their designated mode regardless of global settings.

### Size Variants
Three pre-configured sizes:
- **Small** - Compact 32px buttons
- **Medium** - Default 40px buttons (default)
- **Large** - Expanded 52px buttons

### Advanced Dragging
- Smooth drag-and-drop positioning
- Compact circular drag mode (60px circular indicator)
- Full-screen overlay with grabbing cursor
- Boundary restrictions to keep toolbar within container

### Snapping
- Smart snapping to screen edges and corners
- Visual snap zone highlights
- Configurable snap distance threshold
- Smooth animations

### Multiple Tool Sets
Support for multiple tool sets with visual indicators and easy toggling between sets.

## Quick Example

```javascript
const toolbar = new Toolbar({
  container: document.body,
  displayMode: "icon", // "icon" | "label" | "both"
  size: "medium", // "small" | "medium" | "large"
  draggable: true,
  snapping: true,
  snapDistance: 20,
  position: { x: 20, y: 20 }
});

// Add a tool
toolbar.addTool({
  id: "search",
  label: "Search",
  icon: "navigation.search",
  tooltip: "Search files",
  action: () => console.log("Search clicked")
});

// Add a tool with forced display mode
toolbar.addTool({
  id: "help",
  label: "Help",
  icon: "navigation.circle_question",
  forceDisplayMode: "icon", // Always show as icon-only
  action: () => console.log("Help clicked")
});
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

[Add your license information here]

---

[Next: Getting Started](./getting-started.md)
