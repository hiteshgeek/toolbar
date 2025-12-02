[Prev: Getting Started](./getting-started.md) | [Index](./index.md) | [Next: Display Modes](./display-modes.md)

---

# Configuration Options

Configure the toolbar behavior and appearance using the options object passed to the constructor.

## Constructor Options

### `container`
- **Type:** `HTMLElement`
- **Required:** Yes
- **Description:** The parent element where the toolbar will be appended

```javascript
const toolbar = new Toolbar({
  container: document.body
});
```

### `displayMode`
- **Type:** `"icon" | "label" | "both"`
- **Default:** `"both"`
- **Description:** Global display mode for all tools

```javascript
const toolbar = new Toolbar({
  displayMode: "icon" // Show only icons
});
```

See [Display Modes](./display-modes.md) for more details.

### `size`
- **Type:** `"small" | "medium" | "large"`
- **Default:** `"medium"`
- **Description:** Size variant for the toolbar

```javascript
const toolbar = new Toolbar({
  size: "large" // Large buttons (52px)
});
```

See [Size Variants](./size-variants.md) for more details.

### `draggable`
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Enable drag-and-drop functionality

```javascript
const toolbar = new Toolbar({
  draggable: true
});
```

See [Dragging & Positioning](./dragging.md) for more details.

### `snapping`
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Enable snapping to edges and corners

```javascript
const toolbar = new Toolbar({
  snapping: true
});
```

See [Snapping](./snapping.md) for more details.

### `snapDistance`
- **Type:** `number`
- **Default:** `20`
- **Description:** Distance in pixels for snap zones (when snapping is enabled)

```javascript
const toolbar = new Toolbar({
  snapping: true,
  snapDistance: 30 // Larger snap zones
});
```

### `position`
- **Type:** `{ x: number, y: number }`
- **Default:** `{ x: 0, y: 0 }`
- **Description:** Initial position of the toolbar (relative to container)

```javascript
const toolbar = new Toolbar({
  position: { x: 100, y: 50 }
});
```

### `initialSet`
- **Type:** `number`
- **Default:** `0`
- **Description:** Index of the initial tool set to display

```javascript
const toolbar = new Toolbar({
  initialSet: 1 // Start with second tool set
});
```

## Tool Configuration

When adding tools using `addTool()`, you can configure each tool individually.

### `id`
- **Type:** `string`
- **Required:** Yes
- **Description:** Unique identifier for the tool

### `label`
- **Type:** `string`
- **Required:** Yes
- **Description:** Text label for the tool

### `icon`
- **Type:** `string | HTMLElement`
- **Required:** No
- **Description:** Icon identifier (e.g., "navigation.search") or HTML element

### `tooltip`
- **Type:** `string`
- **Required:** No
- **Description:** Tooltip text displayed on hover

### `action`
- **Type:** `function`
- **Required:** Yes
- **Description:** Callback function executed when tool is clicked

### `customClass`
- **Type:** `string`
- **Required:** No
- **Description:** Additional CSS class for the tool button

### `disabled`
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Whether the tool is disabled

### `forceDisplayMode`
- **Type:** `"icon" | "label" | "both" | null`
- **Default:** `null`
- **Description:** Override global display mode for this specific tool

```javascript
toolbar.addTool({
  id: "help",
  label: "Help",
  icon: "navigation.circle_question",
  tooltip: "Get help",
  forceDisplayMode: "icon", // Always show as icon-only
  action: () => console.log("Help")
});
```

See [Force Display Mode](./force-display-mode.md) for more details.

### `setIndex`
- **Type:** `number`
- **Default:** `0`
- **Description:** Tool set index this tool belongs to

```javascript
toolbar.addTool({
  id: "tool1",
  label: "Tool 1",
  setIndex: 0 // First set
});

toolbar.addTool({
  id: "tool2",
  label: "Tool 2",
  setIndex: 1 // Second set
});
```

## Complete Example

```javascript
const toolbar = new Toolbar({
  // Container
  container: document.body,

  // Display settings
  displayMode: "icon",
  size: "medium",

  // Dragging settings
  draggable: true,
  snapping: true,
  snapDistance: 25,

  // Position
  position: { x: 20, y: 20 },

  // Tool sets
  initialSet: 0
});

// Add tools with various configurations
toolbar.addTool({
  id: "search",
  label: "Search",
  icon: "navigation.search",
  tooltip: "Search files (Ctrl+F)",
  action: () => openSearch(),
  customClass: "toolbar__tool--primary"
});

toolbar.addTool({
  id: "help",
  label: "Help",
  icon: "navigation.circle_question",
  tooltip: "Get help",
  forceDisplayMode: "icon", // Always icon-only
  action: () => openHelp()
});

toolbar.addTool({
  id: "shortcuts",
  label: "Shortcuts",
  icon: "utils.menu",
  tooltip: "Keyboard shortcuts",
  forceDisplayMode: "label", // Always label-only
  action: () => showShortcuts()
});

toolbar.addTool({
  id: "advanced",
  label: "Advanced",
  icon: "navigation.settings",
  tooltip: "Advanced settings",
  setIndex: 1, // Second tool set
  action: () => openAdvanced()
});
```

## Backwards Compatibility

The toolbar maintains backwards compatibility with the legacy `showLabels` option:

```javascript
// Legacy (still supported)
const toolbar = new Toolbar({
  showLabels: false // Converts to displayMode: "icon"
});

// Modern (recommended)
const toolbar = new Toolbar({
  displayMode: "icon"
});
```

**Boolean to displayMode conversion:**
- `showLabels: false` → `displayMode: "icon"`
- `showLabels: true` → `displayMode: "both"`

---

[Prev: Getting Started](./getting-started.md) | [Index](./index.md) | [Next: Display Modes](./display-modes.md)
