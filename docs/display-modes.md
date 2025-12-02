[Prev: Configuration](./configuration.md) | [Index](./index.md) | [Next: Force Display Mode](./force-display-mode.md)

---

# Display Modes

The toolbar supports three display modes that control how tools are rendered globally.

## Available Modes

### Icon Only (`"icon"`)

Displays tools as circular buttons with only icons visible.

```javascript
toolbar.setDisplayMode("icon");
```

**Visual characteristics:**
- Circular buttons
- Only icons visible
- Compact layout
- Ideal for minimal UI

**Button dimensions:**
- Small: 32px × 32px
- Medium: 40px × 40px
- Large: 52px × 52px

### Label Only (`"label"`)

Displays tools as rectangular buttons with only text labels visible.

```javascript
toolbar.setDisplayMode("label");
```

**Visual characteristics:**
- Rectangular buttons
- Only text labels visible
- Wider layout
- Better for accessibility

**Button dimensions:**
- Min-width: 40px (auto-expands based on label)
- Horizontal padding: 16px

### Both (`"both"`)

Displays tools with both icons and labels visible.

```javascript
toolbar.setDisplayMode("both");
```

**Visual characteristics:**
- Rectangular buttons
- Icons and labels side-by-side
- Maximum information density
- Best for new users

## Setting Display Mode

### At Initialization

```javascript
const toolbar = new Toolbar({
  displayMode: "icon" // or "label" or "both"
});
```

### Programmatically

```javascript
// Set to icon only
toolbar.setDisplayMode("icon");

// Set to label only
toolbar.setDisplayMode("label");

// Set to both
toolbar.setDisplayMode("both");
```

### Getting Current Mode

```javascript
const currentMode = toolbar.getDisplayMode();
console.log(currentMode); // "icon", "label", or "both"
```

### Cycling Through Modes

```javascript
// Cycle to next mode: icon → both → label → icon
toolbar.nextDisplayMode();
```

## Implementing a Toggle Button

Create a button that cycles through all three modes:

```javascript
const DISPLAY_MODE_CONFIG = {
  order: ["icon", "both", "label"],
  icons: {
    icon: "utils.menu",
    both: "utils.menu",
    label: "utils.menu"
  },
  labels: {
    icon: "Icons Only",
    both: "Icons & Labels",
    label: "Labels Only"
  }
};

// Add toggle button
toolbar.addTool({
  id: "toggle-display",
  label: "Display",
  icon: "utils.menu",
  tooltip: "Display: Icons Only",
  customClass: "toolbar__tool--active",
  action: () => {
    toolbar.nextDisplayMode();
  }
});

// Update button visuals when mode changes
toolbar.on("displayMode:change", (data) => {
  const mode = data.displayMode;
  const label = DISPLAY_MODE_CONFIG.labels[mode];
  const icon = DISPLAY_MODE_CONFIG.icons[mode];

  toolbar.updateTool("toggle-display", {
    label: label,
    icon: icon,
    tooltip: `Display: ${label}`,
    customClass: "toolbar__tool--active"
  });
});
```

## Display Mode Events

Listen for display mode changes:

```javascript
toolbar.on("displayMode:change", (data) => {
  console.log("Display mode changed to:", data.displayMode);

  // Update UI or save preference
  localStorage.setItem("toolbarDisplayMode", data.displayMode);
});
```

## Persisting User Preference

Save and restore the user's preferred display mode:

```javascript
// Load saved preference
const savedMode = localStorage.getItem("toolbarDisplayMode") || "both";

const toolbar = new Toolbar({
  displayMode: savedMode
});

// Save when changed
toolbar.on("displayMode:change", (data) => {
  localStorage.setItem("toolbarDisplayMode", data.displayMode);
});
```

## CSS Classes

The display mode is controlled by CSS classes on the `.toolbar__tools` container:

```scss
// Icon only
.toolbar__tools.icon_only .toolbar__tool {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

// Label only
.toolbar__tools.label_only .toolbar__tool {
  min-width: 40px;
  padding: 0 16px;
  border-radius: 8px;
}

// Both (with labels)
.toolbar__tools.with_label .toolbar__tool {
  min-width: 40px;
  padding: 8px 16px;
  border-radius: 8px;
}
```

## Responsive Considerations

Consider using different display modes based on screen size:

```javascript
function updateDisplayMode() {
  const mode = window.innerWidth < 768 ? "icon" : "both";
  toolbar.setDisplayMode(mode);
}

// Update on resize
window.addEventListener("resize", updateDisplayMode);

// Initial update
updateDisplayMode();
```

## Accessibility

**Icon only mode:**
- Ensure all tools have meaningful `tooltip` values
- Icons should be recognizable and standard
- Consider ARIA labels for screen readers

**Label only mode:**
- Most accessible option
- Clear text descriptions
- No reliance on visual icons

**Both mode:**
- Best of both worlds
- Visual + textual information
- Recommended for accessibility

```javascript
// Good: Always provide tooltips, even with labels
toolbar.addTool({
  id: "search",
  label: "Search",
  icon: "navigation.search",
  tooltip: "Search files (Ctrl+F)", // Important for icon-only mode
  action: () => search()
});
```

## Legacy Support

The toolbar maintains backwards compatibility with the old `showLabels` boolean option:

```javascript
// Old API (still works)
toolbar.setShowLabels(false); // Converts to displayMode: "icon"
toolbar.setShowLabels(true);  // Converts to displayMode: "both"

// New API (recommended)
toolbar.setDisplayMode("icon");
toolbar.setDisplayMode("label");
toolbar.setDisplayMode("both");
```

## Best Practices

1. **Provide tooltips for all tools** - Essential when using icon-only mode
2. **Use recognizable icons** - Standard icons improve usability
3. **Consider your audience** - New users benefit from labels
4. **Test all modes** - Ensure your toolbar works well in all three modes
5. **Allow user choice** - Let users pick their preferred mode
6. **Persist preference** - Remember the user's choice across sessions

---

[Prev: Configuration](./configuration.md) | [Index](./index.md) | [Next: Force Display Mode](./force-display-mode.md)
