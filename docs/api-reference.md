[Prev: Snapping](./snapping.md) | [Index](./index.md) | [Next: Styling & Customization](./styling.md)

---

# API Reference

Complete API documentation for the Toolbar component.

## Constructor

### `new Toolbar(options)`

Creates a new toolbar instance.

**Parameters:**
- `options` (Object) - Configuration options

**Returns:** Toolbar instance

**Example:**
```javascript
const toolbar = new Toolbar({
  container: document.body,
  displayMode: "icon",
  size: "medium"
});
```

## Configuration Options

See [Configuration](./configuration.md) for detailed documentation.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | HTMLElement | - | Required. Parent element |
| `displayMode` | "icon" \| "label" \| "both" | "both" | Display mode for tools |
| `size` | "small" \| "medium" \| "large" | "medium" | Size variant |
| `draggable` | boolean | false | Enable dragging |
| `snapping` | boolean | false | Enable snapping |
| `snapDistance` | number | 20 | Snap zone distance in pixels |
| `position` | {x: number, y: number} | {x: 0, y: 0} | Initial position |
| `initialSet` | number | 0 | Initial tool set index |

## Methods

### Tool Management

#### `addTool(tool)`

Adds a new tool to the toolbar.

**Parameters:**
- `tool` (Object) - Tool configuration

**Returns:** `string` - Tool ID

**Example:**
```javascript
const toolId = toolbar.addTool({
  id: "search",
  label: "Search",
  icon: "navigation.search",
  tooltip: "Search files",
  action: () => console.log("Search"),
  forceDisplayMode: null,
  customClass: "",
  disabled: false,
  setIndex: 0
});
```

**Tool Configuration:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `label` | string | Yes | Text label |
| `icon` | string \| HTMLElement | No | Icon identifier or element |
| `tooltip` | string | No | Tooltip text |
| `action` | function | Yes | Click handler |
| `forceDisplayMode` | "icon" \| "label" \| "both" \| null | No | Override display mode |
| `customClass` | string | No | Additional CSS class |
| `disabled` | boolean | No | Disabled state |
| `setIndex` | number | No | Tool set index (default: 0) |

#### `removeTool(id)`

Removes a tool from the toolbar.

**Parameters:**
- `id` (string) - Tool ID

**Returns:** `boolean` - Success status

**Example:**
```javascript
toolbar.removeTool("search"); // Returns true if removed
```

#### `updateTool(id, updates)`

Updates an existing tool's properties.

**Parameters:**
- `id` (string) - Tool ID
- `updates` (Object) - Properties to update

**Returns:** `boolean` - Success status

**Example:**
```javascript
toolbar.updateTool("search", {
  label: "Advanced Search",
  icon: "navigation.search_advanced",
  tooltip: "Advanced search (Ctrl+Shift+F)",
  disabled: false
});
```

#### `getTool(id)`

Gets a tool's configuration.

**Parameters:**
- `id` (string) - Tool ID

**Returns:** `Object | undefined` - Tool configuration

**Example:**
```javascript
const searchTool = toolbar.getTool("search");
console.log(searchTool.label); // "Search"
```

#### `clearTools()`

Removes all tools from the toolbar.

**Returns:** `void`

**Example:**
```javascript
toolbar.clearTools();
```

### Display Mode

#### `setDisplayMode(mode)`

Sets the global display mode.

**Parameters:**
- `mode` ("icon" | "label" | "both") - Display mode

**Returns:** `void`

**Example:**
```javascript
toolbar.setDisplayMode("icon");
```

#### `getDisplayMode()`

Gets the current display mode.

**Returns:** `"icon" | "label" | "both"`

**Example:**
```javascript
const mode = toolbar.getDisplayMode(); // "icon"
```

#### `nextDisplayMode()`

Cycles to the next display mode.

**Order:** icon → both → label → icon

**Returns:** `void`

**Example:**
```javascript
toolbar.nextDisplayMode(); // icon -> both
```

#### Legacy Methods (Deprecated)

##### `setShowLabels(show)` ⚠️

**Deprecated:** Use `setDisplayMode()` instead.

Converts boolean to display mode:
- `false` → `"icon"`
- `true` → `"both"`

##### `getShowLabels()` ⚠️

**Deprecated:** Use `getDisplayMode()` instead.

Returns boolean based on display mode:
- `"icon"` → `false`
- `"label"` or `"both"` → `true`

##### `toggleShowLabels()` ⚠️

**Deprecated:** Use `nextDisplayMode()` instead.

### Size

#### `setSize(size)`

Sets the toolbar size.

**Parameters:**
- `size` ("small" | "medium" | "large") - Size variant

**Returns:** `void`

**Example:**
```javascript
toolbar.setSize("large");
```

#### `getSize()`

Gets the current size.

**Returns:** `"small" | "medium" | "large"`

**Example:**
```javascript
const size = toolbar.getSize(); // "medium"
```

#### `nextSize()`

Cycles to the next size.

**Order:** small → medium → large → small

**Returns:** `void`

**Example:**
```javascript
toolbar.nextSize(); // medium -> large
```

### Position & Dragging

#### `setPosition(position)`

Sets the toolbar position.

**Parameters:**
- `position` ({x: number, y: number}) - New position

**Returns:** `void`

**Example:**
```javascript
toolbar.setPosition({ x: 100, y: 50 });
```

#### `getPosition()`

Gets the current position.

**Returns:** `{x: number, y: number}`

**Example:**
```javascript
const pos = toolbar.getPosition(); // { x: 100, y: 50 }
```

#### `setDraggable(draggable)`

Enables or disables dragging.

**Parameters:**
- `draggable` (boolean) - Enable/disable dragging

**Returns:** `void`

**Example:**
```javascript
toolbar.setDraggable(true);
```

#### `getDraggable()`

Gets the draggable state.

**Returns:** `boolean`

**Example:**
```javascript
const isDraggable = toolbar.getDraggable(); // true
```

### Snapping

#### `setSnapping(snapping)`

Enables or disables snapping.

**Parameters:**
- `snapping` (boolean) - Enable/disable snapping

**Returns:** `void`

**Example:**
```javascript
toolbar.setSnapping(true);
```

#### `getSnapping()`

Gets the snapping state.

**Returns:** `boolean`

**Example:**
```javascript
const isSnapping = toolbar.getSnapping(); // true
```

### Tool Sets

#### `setActiveSet(index)`

Switches to a different tool set.

**Parameters:**
- `index` (number) - Tool set index

**Returns:** `void`

**Example:**
```javascript
toolbar.setActiveSet(1); // Switch to second set
```

#### `nextSet()`

Cycles to the next tool set.

**Returns:** `void`

**Example:**
```javascript
toolbar.nextSet();
```

#### `previousSet()`

Cycles to the previous tool set.

**Returns:** `void`

**Example:**
```javascript
toolbar.previousSet();
```

### Lifecycle

#### `destroy()`

Destroys the toolbar and cleans up resources.

**Returns:** `void`

**Example:**
```javascript
toolbar.destroy();
```

## Events

The toolbar uses an EventEmitter pattern for events.

### Listening to Events

#### `on(event, callback)`

Registers an event listener.

**Parameters:**
- `event` (string) - Event name
- `callback` (function) - Event handler

**Returns:** `void`

**Example:**
```javascript
toolbar.on("displayMode:change", (data) => {
  console.log("Display mode changed to:", data.displayMode);
});
```

#### `off(event, callback)`

Removes an event listener.

**Parameters:**
- `event` (string) - Event name
- `callback` (function) - Event handler to remove

**Returns:** `void`

**Example:**
```javascript
const handler = (data) => console.log(data);
toolbar.on("displayMode:change", handler);
toolbar.off("displayMode:change", handler);
```

#### `once(event, callback)`

Registers a one-time event listener.

**Parameters:**
- `event` (string) - Event name
- `callback` (function) - Event handler

**Returns:** `void`

**Example:**
```javascript
toolbar.once("snap", (data) => {
  console.log("First snap:", data.snapZone);
});
```

### Available Events

#### `displayMode:change`

Fired when display mode changes.

**Data:**
```javascript
{
  displayMode: "icon" | "label" | "both"
}
```

**Example:**
```javascript
toolbar.on("displayMode:change", (data) => {
  console.log("New mode:", data.displayMode);
});
```

#### `size:change`

Fired when size changes.

**Data:**
```javascript
{
  size: "small" | "medium" | "large"
}
```

**Example:**
```javascript
toolbar.on("size:change", (data) => {
  console.log("New size:", data.size);
});
```

#### `position:change`

Fired when position changes.

**Data:**
```javascript
{
  position: { x: number, y: number }
}
```

**Example:**
```javascript
toolbar.on("position:change", (data) => {
  console.log("New position:", data.position);
});
```

#### `drag:start`

Fired when dragging starts.

**Data:**
```javascript
{
  position: { x: number, y: number }
}
```

**Example:**
```javascript
toolbar.on("drag:start", (data) => {
  console.log("Drag started at:", data.position);
});
```

#### `drag:move`

Fired during dragging.

**Data:**
```javascript
{
  position: { x: number, y: number }
}
```

**Example:**
```javascript
toolbar.on("drag:move", (data) => {
  console.log("Dragging to:", data.position);
});
```

#### `drag:end`

Fired when dragging ends.

**Data:**
```javascript
{
  position: { x: number, y: number }
}
```

**Example:**
```javascript
toolbar.on("drag:end", (data) => {
  console.log("Dropped at:", data.position);
});
```

#### `snap`

Fired when toolbar snaps to a zone.

**Data:**
```javascript
{
  snapZone: "top-left" | "top" | "top-right" | "left" | "right" | "bottom-left" | "bottom" | "bottom-right",
  position: { x: number, y: number }
}
```

**Example:**
```javascript
toolbar.on("snap", (data) => {
  console.log("Snapped to:", data.snapZone);
  console.log("At position:", data.position);
});
```

#### `set:change`

Fired when active tool set changes.

**Data:**
```javascript
{
  setIndex: number
}
```

**Example:**
```javascript
toolbar.on("set:change", (data) => {
  console.log("Switched to set:", data.setIndex);
});
```

#### Legacy Event (Deprecated)

##### `labels:change` ⚠️

**Deprecated:** Use `displayMode:change` instead.

## Static Methods

### `_resolveIcon(icon)`

Resolves an icon identifier to HTML.

**Parameters:**
- `icon` (string | HTMLElement) - Icon identifier or element

**Returns:** `string` - HTML string

**Example:**
```javascript
const iconHtml = Toolbar._resolveIcon("navigation.search");
// Returns: '<svg>...</svg>'
```

## Properties

### Public Properties

#### `element`

The toolbar's DOM element.

**Type:** `HTMLElement`

**Example:**
```javascript
toolbar.element.style.zIndex = "1000";
```

#### `tools`

Map of all tools.

**Type:** `Map<string, Object>`

**Example:**
```javascript
toolbar.tools.forEach((tool, id) => {
  console.log(id, tool.label);
});
```

#### `options`

Current configuration options.

**Type:** `Object`

**Example:**
```javascript
console.log(toolbar.options.displayMode); // "icon"
console.log(toolbar.options.size); // "medium"
```

### Internal Properties (Private)

These should not be accessed directly:

- `state` - Internal state object
- `eventEmitter` - Event emitter instance
- `toolsContainer` - Tools container element
- `overlay` - Drag overlay element

## Type Definitions

### ToolConfig

```typescript
interface ToolConfig {
  id: string;
  label: string;
  icon?: string | HTMLElement;
  tooltip?: string;
  action: () => void;
  forceDisplayMode?: "icon" | "label" | "both" | null;
  customClass?: string;
  disabled?: boolean;
  setIndex?: number;
}
```

### ToolbarOptions

```typescript
interface ToolbarOptions {
  container: HTMLElement;
  displayMode?: "icon" | "label" | "both";
  size?: "small" | "medium" | "large";
  draggable?: boolean;
  snapping?: boolean;
  snapDistance?: number;
  position?: { x: number; y: number };
  initialSet?: number;
}
```

### Position

```typescript
interface Position {
  x: number;
  y: number;
}
```

### EventData

```typescript
// Display mode change
interface DisplayModeChangeEvent {
  displayMode: "icon" | "label" | "both";
}

// Size change
interface SizeChangeEvent {
  size: "small" | "medium" | "large";
}

// Position change
interface PositionChangeEvent {
  position: Position;
}

// Snap
interface SnapEvent {
  snapZone: "top-left" | "top" | "top-right" | "left" | "right" | "bottom-left" | "bottom" | "bottom-right";
  position: Position;
}

// Set change
interface SetChangeEvent {
  setIndex: number;
}
```

## Complete Example

```javascript
// Create toolbar
const toolbar = new Toolbar({
  container: document.body,
  displayMode: "icon",
  size: "medium",
  draggable: true,
  snapping: true,
  snapDistance: 25,
  position: { x: 20, y: 20 }
});

// Add tools
toolbar.addTool({
  id: "search",
  label: "Search",
  icon: "navigation.search",
  tooltip: "Search (Ctrl+F)",
  action: () => openSearch()
});

toolbar.addTool({
  id: "help",
  label: "Help",
  icon: "navigation.circle_question",
  forceDisplayMode: "icon",
  action: () => openHelp()
});

// Update tools
toolbar.updateTool("search", {
  disabled: true
});

// Listen to events
toolbar.on("displayMode:change", (data) => {
  console.log("Mode:", data.displayMode);
});

toolbar.on("snap", (data) => {
  console.log("Snapped:", data.snapZone);
});

// Change settings
toolbar.setDisplayMode("both");
toolbar.setSize("large");
toolbar.setPosition({ x: 100, y: 50 });

// Cleanup
toolbar.destroy();
```

---

[Prev: Snapping](./snapping.md) | [Index](./index.md) | [Next: Styling & Customization](./styling.md)
