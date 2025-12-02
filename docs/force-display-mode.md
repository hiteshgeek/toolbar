[Prev: Display Modes](./display-modes.md) | [Index](./index.md) | [Next: Size Variants](./size-variants.md)

---

# Force Display Mode

Force display mode allows individual tools to override the global display mode, ensuring specific buttons always appear in a designated mode regardless of global settings.

## Overview

While the global `displayMode` affects all tools, you can specify `forceDisplayMode` on individual tools to lock them into a specific appearance:

- **Force Icon** - Tool always appears as circular icon-only button
- **Force Label** - Tool always appears as rectangular label-only button
- **Force Both** - Tool always shows both icon and label
- **No Force** - Tool respects global display mode (default)

## Use Cases

### Always Icon-Only

Perfect for tools that should remain compact and recognizable by their icon:

```javascript
toolbar.addTool({
  id: "help",
  label: "Help",
  icon: "navigation.circle_question",
  tooltip: "Get help",
  forceDisplayMode: "icon", // Always circular, icon-only
  action: () => openHelp()
});
```

**Good for:**
- Help buttons
- Settings/gear icons
- Close/minimize buttons
- Well-known universal icons

### Always Label-Only

Perfect for tools where text is more important than the icon:

```javascript
toolbar.addTool({
  id: "shortcuts",
  label: "Keyboard Shortcuts",
  icon: "utils.menu",
  tooltip: "View shortcuts",
  forceDisplayMode: "label", // Always rectangular, label-only
  action: () => showShortcuts()
});
```

**Good for:**
- Text-heavy actions
- Less common operations
- Context-specific commands
- When clarity is paramount

### Always Both

Perfect for critical tools that should always show maximum information:

```javascript
toolbar.addTool({
  id: "save",
  label: "Save",
  icon: "navigation.save",
  tooltip: "Save changes",
  forceDisplayMode: "both", // Always show icon + label
  action: () => save()
});
```

**Good for:**
- Primary actions
- Important buttons
- Actions requiring extra visibility
- Onboarding/tutorial contexts

## Configuration

Set the `forceDisplayMode` property when adding a tool:

```javascript
toolbar.addTool({
  id: "tool-id",
  label: "Tool Label",
  icon: "icon.name",
  forceDisplayMode: "icon" | "label" | "both" | null,
  action: () => {}
});
```

**Values:**
- `"icon"` - Always icon-only (circular)
- `"label"` - Always label-only (rectangular)
- `"both"` - Always icon + label
- `null` or omitted - Respects global displayMode

## Complete Example

```javascript
const toolbar = new Toolbar({
  displayMode: "icon" // Global mode: icon-only
});

// Regular tools - respect global mode (icon-only)
toolbar.addTool({
  id: "search",
  label: "Search",
  icon: "navigation.search",
  action: () => search()
  // No forceDisplayMode - will be icon-only
});

toolbar.addTool({
  id: "zoom-in",
  label: "Zoom In",
  icon: "navigation.zoom_in",
  action: () => zoomIn()
  // No forceDisplayMode - will be icon-only
});

// Forced icon-only - even if global mode changes
toolbar.addTool({
  id: "help",
  label: "Help",
  icon: "navigation.circle_question",
  forceDisplayMode: "icon", // Always icon-only
  action: () => openHelp()
});

// Forced label-only - even though global is icon-only
toolbar.addTool({
  id: "shortcuts",
  label: "Keyboard Shortcuts",
  icon: "utils.menu",
  forceDisplayMode: "label", // Always label-only
  action: () => showShortcuts()
});

// Forced both - even though global is icon-only
toolbar.addTool({
  id: "save",
  label: "Save",
  icon: "navigation.save",
  forceDisplayMode: "both", // Always show both
  action: () => save()
});

// Now change global mode to "both"
toolbar.setDisplayMode("both");

// Result:
// - search: icon + label (respects global "both")
// - zoom-in: icon + label (respects global "both")
// - help: icon only (forced)
// - shortcuts: label only (forced)
// - save: both (forced, but matches global anyway)
```

## Visual Behavior

### Global Mode: Icon Only

```
[🔍] [🔎] [❓] [Keyboard Shortcuts] [💾 Save]
 ^    ^    ^          ^                  ^
 |    |    |          |                  |
 |    |    |          |                  +-- Forced: both
 |    |    |          +-- Forced: label
 |    |    +-- Forced: icon
 |    +-- Global: icon
 +-- Global: icon
```

### Global Mode: Both

```
[🔍 Search] [🔎 Zoom In] [❓] [Keyboard Shortcuts] [💾 Save]
      ^           ^       ^          ^                 ^
      |           |       |          |                 |
      |           |       |          |                 +-- Forced: both
      |           |       |          +-- Forced: label
      |           |       +-- Forced: icon
      |           +-- Global: both
      +-- Global: both
```

### Global Mode: Label Only

```
[Search] [Zoom In] [❓] [Keyboard Shortcuts] [💾 Save]
   ^        ^       ^          ^                 ^
   |        |       |          |                 |
   |        |       |          |                 +-- Forced: both
   |        |       |          +-- Forced: label
   |        |       +-- Forced: icon
   |        +-- Global: label
   +-- Global: label
```

## CSS Implementation

Forced display modes use CSS classes with `!important` to override global styles:

```scss
// Force icon-only (circular)
.toolbar__tool--force-icon {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  padding: 0 !important;
  border-radius: 50% !important;
}

// Force label-only (rectangular)
.toolbar__tool--force-label {
  min-width: 40px !important;
  width: auto !important;
  padding: 0 16px !important;
  border-radius: 8px !important;
}

// Force both (icon + label)
.toolbar__tool--force-both {
  min-width: 40px !important;
  width: auto !important;
  padding: 8px 16px !important;
  border-radius: 8px !important;
}
```

## Dynamic Updates

You can change a tool's forced display mode after creation:

```javascript
// Add tool without forced mode
toolbar.addTool({
  id: "dynamic-tool",
  label: "Dynamic",
  icon: "utils.menu",
  action: () => {}
});

// Later, force it to icon-only
toolbar.updateTool("dynamic-tool", {
  forceDisplayMode: "icon"
});

// Remove forced mode (respect global)
toolbar.updateTool("dynamic-tool", {
  forceDisplayMode: null
});
```

## Best Practices

### 1. Use Sparingly

Don't force too many tools - it can create visual inconsistency:

```javascript
// ❌ Bad - too many forced modes
toolbar.addTool({ id: "t1", forceDisplayMode: "icon" });
toolbar.addTool({ id: "t2", forceDisplayMode: "label" });
toolbar.addTool({ id: "t3", forceDisplayMode: "both" });
toolbar.addTool({ id: "t4", forceDisplayMode: "icon" });

// ✅ Good - mostly respecting global mode
toolbar.addTool({ id: "t1" }); // Global mode
toolbar.addTool({ id: "t2" }); // Global mode
toolbar.addTool({ id: "t3" }); // Global mode
toolbar.addTool({ id: "help", forceDisplayMode: "icon" }); // One exception
```

### 2. Choose Wisely

Force modes for strong reasons:

```javascript
// ✅ Good - help is universally recognized by icon
toolbar.addTool({
  id: "help",
  icon: "navigation.circle_question",
  forceDisplayMode: "icon"
});

// ✅ Good - complex action benefits from label
toolbar.addTool({
  id: "export-csv",
  label: "Export as CSV",
  forceDisplayMode: "label"
});

// ❌ Bad - no strong reason to force
toolbar.addTool({
  id: "search",
  icon: "navigation.search",
  forceDisplayMode: "icon" // Why? Let user choose global mode
});
```

### 3. Consider All Modes

Test how forced tools look when global mode changes:

```javascript
// Add forced tool
toolbar.addTool({
  id: "help",
  label: "Help",
  icon: "navigation.circle_question",
  forceDisplayMode: "icon"
});

// Test all global modes
toolbar.setDisplayMode("icon");  // Help still icon-only ✓
toolbar.setDisplayMode("label"); // Help still icon-only ✓
toolbar.setDisplayMode("both");  // Help still icon-only ✓
```

### 4. Provide Good Tooltips

Forced icon-only tools should always have clear tooltips:

```javascript
// ✅ Good - clear tooltip for icon-only
toolbar.addTool({
  id: "help",
  label: "Help",
  icon: "navigation.circle_question",
  tooltip: "Open help documentation (F1)",
  forceDisplayMode: "icon"
});

// ❌ Bad - no tooltip for icon-only
toolbar.addTool({
  id: "help",
  label: "Help",
  icon: "navigation.circle_question",
  forceDisplayMode: "icon"
  // Missing tooltip!
});
```

## Common Patterns

### Persistent UI Controls

Force icon-only for standard UI controls:

```javascript
const uiControls = [
  { id: "close", icon: "navigation.close", forceDisplayMode: "icon" },
  { id: "minimize", icon: "navigation.minimize", forceDisplayMode: "icon" },
  { id: "settings", icon: "navigation.settings", forceDisplayMode: "icon" }
];

uiControls.forEach(tool => {
  toolbar.addTool({
    ...tool,
    action: () => handleControl(tool.id)
  });
});
```

### Action Buttons

Force "both" for primary actions:

```javascript
toolbar.addTool({
  id: "save",
  label: "Save",
  icon: "navigation.save",
  forceDisplayMode: "both", // Always prominent
  customClass: "toolbar__tool--primary",
  action: () => save()
});
```

### Context-Specific Labels

Force label-only for domain-specific actions:

```javascript
toolbar.addTool({
  id: "generate-report",
  label: "Generate Monthly Report",
  icon: "utils.menu",
  forceDisplayMode: "label", // Text is more descriptive
  action: () => generateReport()
});
```

---

[Prev: Display Modes](./display-modes.md) | [Index](./index.md) | [Next: Size Variants](./size-variants.md)
