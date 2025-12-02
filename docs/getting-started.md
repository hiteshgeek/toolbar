[Index](./index.md) | [Next: Configuration](./configuration.md)

---

# Getting Started

This guide will help you get up and running with the Toolbar component.

## Installation

### Include Files

Add the required CSS and JavaScript files to your HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Toolbar CSS -->
  <link rel="stylesheet" href="path/to/toolbar.css">
</head>
<body>
  <!-- Your content -->

  <!-- Toolbar JavaScript -->
  <script src="path/to/Toolbar.js"></script>
  <script src="path/to/main.js"></script>
</body>
</html>
```

## Basic Usage

### 1. Create a Toolbar Instance

```javascript
const toolbar = new Toolbar({
  container: document.body,
  displayMode: "icon",
  size: "medium",
  draggable: true,
  position: { x: 20, y: 20 }
});
```

### 2. Add Tools

```javascript
// Add a simple tool
toolbar.addTool({
  id: "search",
  label: "Search",
  icon: "navigation.search",
  tooltip: "Search files",
  action: () => {
    console.log("Search clicked");
  }
});

// Add more tools
toolbar.addTool({
  id: "settings",
  label: "Settings",
  icon: "navigation.settings",
  tooltip: "Open settings",
  action: () => {
    console.log("Settings clicked");
  }
});
```

### 3. Listen to Events

```javascript
// Listen for display mode changes
toolbar.on("displayMode:change", (data) => {
  console.log("Display mode changed to:", data.displayMode);
});

// Listen for position changes
toolbar.on("position:change", (data) => {
  console.log("Toolbar moved to:", data.position);
});

// Listen for snapping
toolbar.on("snap", (data) => {
  console.log("Toolbar snapped to:", data.snapZone);
});
```

## Complete Example

Here's a complete working example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Toolbar Example</title>
  <link rel="stylesheet" href="dist/toolbar.css">
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    }
  </style>
</head>
<body>
  <h1>Toolbar Example</h1>
  <p>Try dragging the toolbar and changing display modes!</p>

  <script src="dist/Toolbar.js"></script>
  <script>
    // Create toolbar
    const toolbar = new Toolbar({
      container: document.body,
      displayMode: "icon",
      size: "medium",
      draggable: true,
      snapping: true,
      snapDistance: 20,
      position: { x: 20, y: 20 }
    });

    // Add tools
    const tools = [
      {
        id: "search",
        label: "Search",
        icon: "navigation.search",
        tooltip: "Search files",
        action: () => alert("Search clicked")
      },
      {
        id: "zoom-in",
        label: "Zoom In",
        icon: "navigation.zoom_in",
        tooltip: "Zoom in",
        action: () => alert("Zoom in clicked")
      },
      {
        id: "zoom-out",
        label: "Zoom Out",
        icon: "navigation.zoom_out",
        tooltip: "Zoom out",
        action: () => alert("Zoom out clicked")
      },
      {
        id: "help",
        label: "Help",
        icon: "navigation.circle_question",
        tooltip: "Get help",
        forceDisplayMode: "icon", // Always show as icon-only
        action: () => alert("Help clicked")
      }
    ];

    tools.forEach(tool => toolbar.addTool(tool));

    // Add display mode toggle
    toolbar.addTool({
      id: "toggle-display",
      label: "Display",
      icon: "utils.menu",
      tooltip: "Toggle display mode",
      customClass: "toolbar__tool--active",
      action: () => {
        toolbar.nextDisplayMode();
      }
    });

    // Listen to events
    toolbar.on("displayMode:change", (data) => {
      console.log("Display mode:", data.displayMode);
    });

    toolbar.on("snap", (data) => {
      console.log("Snapped to:", data.snapZone);
    });
  </script>
</body>
</html>
```

## Next Steps

- Learn about [Configuration Options](./configuration.md)
- Explore [Display Modes](./display-modes.md)
- Understand [Size Variants](./size-variants.md)
- Discover [Dragging & Positioning](./dragging.md)

---

[Index](./index.md) | [Next: Configuration](./configuration.md)
