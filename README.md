# Toolbar Component

A flexible, customizable toolbar component with advanced features including display modes, size variants, dragging, and snapping functionality.

![Toolbar Demo](docs/assets/toolbar-demo.gif)

## Features

- **🎨 Three Display Modes** - Icon-only, label-only, or both
- **📏 Size Variants** - Small (32px), Medium (40px), Large (52px)
- **🔒 Force Display Mode** - Lock individual tools to specific display modes
- **🖱️ Drag & Drop** - Smooth dragging with compact circular indicator
- **🧲 Smart Snapping** - Snap to edges and corners with visual feedback
- **📦 Multiple Tool Sets** - Organize tools into sets with visual indicators
- **🎭 Customizable Themes** - CSS variables and custom classes
- **♿ Accessible** - Keyboard navigation and ARIA support
- **📱 Responsive** - Works on desktop, tablet, and mobile
- **⚡ Performant** - Optimized with RAF and GPU acceleration

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/toolbar.git

# Install dependencies (if any)
npm install
```

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="dist/toolbar.css">
</head>
<body>
  <script src="dist/Toolbar.js"></script>
  <script>
    // Create toolbar
    const toolbar = new Toolbar({
      container: document.body,
      displayMode: "icon",
      size: "medium",
      draggable: true,
      snapping: true
    });

    // Add tools
    toolbar.addTool({
      id: "search",
      label: "Search",
      icon: "navigation.search",
      tooltip: "Search files",
      action: () => console.log("Search clicked")
    });

    toolbar.addTool({
      id: "help",
      label: "Help",
      icon: "navigation.circle_question",
      forceDisplayMode: "icon", // Always show as icon-only
      action: () => console.log("Help clicked")
    });
  </script>
</body>
</html>
```

## Documentation

📚 **[View Full Documentation](./docs/index.md)**

### Table of Contents

1. [Getting Started](./docs/getting-started.md) - Installation and basic usage
2. [Configuration](./docs/configuration.md) - All configuration options
3. [Display Modes](./docs/display-modes.md) - Icon, label, and both modes
4. [Force Display Mode](./docs/force-display-mode.md) - Override global display for specific tools
5. [Size Variants](./docs/size-variants.md) - Small, medium, and large sizes
6. [Dragging & Positioning](./docs/dragging.md) - Drag and drop functionality
7. [Snapping](./docs/snapping.md) - Smart edge and corner snapping
8. [API Reference](./docs/api-reference.md) - Complete API documentation
9. [Styling & Customization](./docs/styling.md) - Themes and custom styles

## Examples

### Icon-Only Toolbar

```javascript
const toolbar = new Toolbar({
  displayMode: "icon",
  size: "medium"
});

toolbar.addTool({
  id: "zoom-in",
  label: "Zoom In",
  icon: "navigation.zoom_in",
  tooltip: "Zoom in",
  action: () => zoomIn()
});
```

### Draggable Toolbar with Snapping

```javascript
const toolbar = new Toolbar({
  draggable: true,
  snapping: true,
  snapDistance: 25,
  position: { x: 20, y: 20 }
});

toolbar.on("snap", (data) => {
  console.log("Snapped to:", data.snapZone);
});
```

### Mixed Display Modes

```javascript
const toolbar = new Toolbar({
  displayMode: "icon" // Global: icon-only
});

// Regular tool - respects global mode (icon-only)
toolbar.addTool({
  id: "search",
  label: "Search",
  icon: "navigation.search",
  action: () => search()
});

// Forced label-only - overrides global mode
toolbar.addTool({
  id: "shortcuts",
  label: "Keyboard Shortcuts",
  icon: "utils.menu",
  forceDisplayMode: "label", // Always show label
  action: () => showShortcuts()
});
```

### Custom Theme

```css
.toolbar--custom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
}

.toolbar--custom .toolbar__tool {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.toolbar--custom .toolbar__tool:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

```javascript
const toolbar = new Toolbar({
  container: document.body
});

toolbar.element.classList.add("toolbar--custom");
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Development

### Project Structure

```
toolbar/
├── src/
│   ├── library/
│   │   ├── js/
│   │   │   └── components/
│   │   │       └── toolbar/
│   │   │           ├── Toolbar.js
│   │   │           └── EventEmitter.js
│   │   └── scss/
│   │       └── components/
│   │           └── toolbar/
│   │               ├── toolbar.scss
│   │               ├── _base.scss
│   │               ├── _tool.scss
│   │               ├── _drag-handle.scss
│   │               ├── _set-indicator.scss
│   │               └── _overlay.scss
│   └── assets/
│       └── js/
│           └── main.js
├── docs/
│   ├── index.md
│   ├── getting-started.md
│   ├── configuration.md
│   ├── display-modes.md
│   ├── force-display-mode.md
│   ├── size-variants.md
│   ├── dragging.md
│   ├── snapping.md
│   ├── api-reference.md
│   └── styling.md
└── README.md
```

### Building

```bash
# Compile SCSS
npm run build:css

# Watch for changes
npm run watch:css
```

## API Overview

### Constructor

```javascript
const toolbar = new Toolbar({
  container: HTMLElement,
  displayMode: "icon" | "label" | "both",
  size: "small" | "medium" | "large",
  draggable: boolean,
  snapping: boolean,
  snapDistance: number,
  position: { x: number, y: number }
});
```

### Methods

```javascript
// Tool management
toolbar.addTool(config)
toolbar.removeTool(id)
toolbar.updateTool(id, updates)
toolbar.getTool(id)
toolbar.clearTools()

// Display mode
toolbar.setDisplayMode(mode)
toolbar.getDisplayMode()
toolbar.nextDisplayMode()

// Size
toolbar.setSize(size)
toolbar.getSize()
toolbar.nextSize()

// Position
toolbar.setPosition({ x, y })
toolbar.getPosition()
toolbar.setDraggable(boolean)
toolbar.setSnapping(boolean)

// Tool sets
toolbar.setActiveSet(index)
toolbar.nextSet()
toolbar.previousSet()

// Events
toolbar.on(event, callback)
toolbar.off(event, callback)
toolbar.once(event, callback)

// Lifecycle
toolbar.destroy()
```

### Events

```javascript
toolbar.on("displayMode:change", (data) => {})
toolbar.on("size:change", (data) => {})
toolbar.on("position:change", (data) => {})
toolbar.on("drag:start", (data) => {})
toolbar.on("drag:move", (data) => {})
toolbar.on("drag:end", (data) => {})
toolbar.on("snap", (data) => {})
toolbar.on("set:change", (data) => {})
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)

## Changelog

### Version 2.0.0 (Current)

#### New Features
- ✨ Three display modes: icon-only, label-only, both
- ✨ Force display mode for individual tools
- ✨ Size variants: small, medium, large
- ✨ Compact circular drag mode
- ✨ Smart snapping to edges and corners
- ✨ Full-screen overlay during drag
- ✨ Multiple tool sets with indicators

#### Improvements
- ⚡ Optimized drag performance with RAF
- 🎨 Enhanced visual feedback during drag
- ♿ Improved accessibility
- 📱 Better mobile support
- 🎭 CSS variable-based theming

#### Breaking Changes
- `showLabels` (boolean) deprecated in favor of `displayMode` (string)
- Event `labels:change` renamed to `displayMode:change`

#### Backwards Compatibility
- Legacy `showLabels` still supported with automatic conversion
- Legacy event listeners still work with console warnings

### Version 1.0.0

- Initial release with basic toolbar functionality

## Acknowledgments

- Icons from [Icon Library Name]
- Inspired by [Inspiration Source]

## Support

- 📖 [Documentation](./docs/index.md)
- 🐛 [Issue Tracker](https://github.com/yourusername/toolbar/issues)
- 💬 [Discussions](https://github.com/yourusername/toolbar/discussions)

## Author

[Your Name](https://github.com/yourusername)

---

Made with ❤️ by [Your Name/Organization]
