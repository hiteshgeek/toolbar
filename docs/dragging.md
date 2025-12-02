[Prev: Size Variants](./size-variants.md) | [Index](./index.md) | [Next: Snapping](./snapping.md)

---

# Dragging & Positioning

The toolbar supports smooth drag-and-drop positioning with a compact circular drag mode and visual feedback.

## Enabling Dragging

### At Initialization

```javascript
const toolbar = new Toolbar({
  draggable: true
});
```

### Programmatically

```javascript
// Enable dragging
toolbar.setDraggable(true);

// Disable dragging
toolbar.setDraggable(false);
```

### Check if Draggable

```javascript
const isDraggable = toolbar.getDraggable();
console.log(isDraggable); // true or false
```

## Drag Handle

When dragging is enabled, a drag handle appears in the toolbar header:

```javascript
const toolbar = new Toolbar({
  draggable: true
});
// Drag handle automatically shown
```

The drag handle:
- Appears as a grip icon (⋮⋮)
- Only visible when `draggable: true`
- Click and drag to move toolbar
- Cursor changes to `grab` on hover, `grabbing` when dragging

## Compact Drag Mode

When dragging starts, the toolbar transforms into a compact circular mode:

### Visual Changes
- Toolbar becomes circular (60px × 60px)
- All tools are hidden
- Only drag handle is visible
- Background matches hover state
- Semi-transparent overlay covers screen
- Cursor changes to `grabbing` across entire screen

### Benefits
- Clearer visual feedback during drag
- Easier to see target position
- Reduced visual clutter
- Mouse stays centered on toolbar

### Example

```javascript
const toolbar = new Toolbar({
  draggable: true,
  displayMode: "both",
  size: "medium"
});

// Normal state: rectangular toolbar with tools
// [🔍 Search] [🔎 Zoom] [❓ Help]

// During drag: compact circular indicator
//     [⋮⋮]
//      ●
```

## Setting Position

### Initial Position

```javascript
const toolbar = new Toolbar({
  position: { x: 100, y: 50 } // 100px from left, 50px from top
});
```

### Programmatically

```javascript
// Set absolute position
toolbar.setPosition({ x: 200, y: 100 });

// Get current position
const pos = toolbar.getPosition();
console.log(pos); // { x: 200, y: 100 }
```

## Boundary Restrictions

The toolbar is restricted to stay within its container:

```javascript
const toolbar = new Toolbar({
  container: document.body,
  draggable: true
});

// Toolbar cannot be dragged outside of document.body
```

### How Boundaries Work

1. **Normal State:** Boundaries based on toolbar's actual dimensions
2. **Compact Drag:** Boundaries recalculated for 60px × 60px compact size
3. **Auto-Clamping:** Position is clamped to ensure toolbar stays visible

```javascript
// Toolbar dimensions: 300px × 60px
// Container: 1000px × 800px

// Normal boundaries:
// minX: 0, maxX: 700 (1000 - 300)
// minY: 0, maxY: 740 (800 - 60)

// During drag (compact 60px × 60px):
// minX: 0, maxX: 940 (1000 - 60)
// minY: 0, maxY: 740 (800 - 60)
```

## Position Events

Listen for position changes:

```javascript
toolbar.on("position:change", (data) => {
  console.log("Toolbar moved to:", data.position);
  // { position: { x: 150, y: 200 } }
});
```

### During Drag

```javascript
toolbar.on("drag:start", (data) => {
  console.log("Drag started at:", data.position);
});

toolbar.on("drag:move", (data) => {
  console.log("Dragging to:", data.position);
});

toolbar.on("drag:end", (data) => {
  console.log("Drag ended at:", data.position);
});
```

## Performance Optimization

The dragging implementation uses several optimizations:

### RequestAnimationFrame Throttling

```javascript
// Drag move events are throttled using RAF for 60fps
_onDragMove(e) {
  if (!this.state.isDragging) return;

  if (this._dragRaf) {
    cancelAnimationFrame(this._dragRaf);
  }

  this._dragRaf = requestAnimationFrame(() => {
    // Update position
  });
}
```

### CSS Performance

```css
.toolbar--dragging-compact {
  /* Remove transitions during drag */
  transition: none !important;

  /* Use GPU acceleration */
  will-change: transform;
}
```

### No Layout Thrashing

```javascript
// Read all DOM properties first
const rect = this.element.getBoundingClientRect();
const parentRect = parent.getBoundingClientRect();

// Then write
this.element.style.left = `${newLeft}px`;
this.element.style.top = `${newTop}px`;
```

## Full-Screen Overlay

During drag, a full-screen overlay is shown:

### Features
- Semi-transparent background (rgba(0, 0, 0, 0.5))
- Backdrop blur effect
- Grabbing cursor across entire screen
- Z-index: 998 (toolbar is 999)

### CSS

```css
.toolbar--overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  z-index: 998;
  cursor: grabbing !important;
}
```

## Programmatic Dragging Example

```javascript
const toolbar = new Toolbar({
  container: document.body,
  draggable: true,
  position: { x: 20, y: 20 }
});

// Listen to drag events
toolbar.on("drag:start", () => {
  console.log("Started dragging");
});

toolbar.on("drag:move", (data) => {
  console.log("Dragging:", data.position);
});

toolbar.on("drag:end", (data) => {
  console.log("Dropped at:", data.position);
  // Save position
  localStorage.setItem("toolbarPos", JSON.stringify(data.position));
});

// Restore saved position on load
const savedPos = localStorage.getItem("toolbarPos");
if (savedPos) {
  toolbar.setPosition(JSON.parse(savedPos));
}
```

## Combining with Snapping

Dragging works seamlessly with snapping:

```javascript
const toolbar = new Toolbar({
  draggable: true,
  snapping: true,
  snapDistance: 20
});

// User drags toolbar near edge
// → Toolbar snaps to edge automatically
// → drag:end event fires with snapped position
```

See [Snapping](./snapping.md) for more details.

## Touch Support

Dragging supports both mouse and touch events:

```javascript
// Works with mouse
element.addEventListener("mousedown", this._onDragStart);
element.addEventListener("mousemove", this._onDragMove);
element.addEventListener("mouseup", this._onDragEnd);

// Also works with touch
element.addEventListener("touchstart", this._onDragStart);
element.addEventListener("touchmove", this._onDragMove);
element.addEventListener("touchend", this._onDragEnd);
```

## Persistence Example

Save and restore toolbar position across sessions:

```javascript
class ToolbarManager {
  constructor() {
    this.toolbar = new Toolbar({
      draggable: true,
      position: this.loadPosition()
    });

    this.toolbar.on("position:change", (data) => {
      this.savePosition(data.position);
    });
  }

  loadPosition() {
    const saved = localStorage.getItem("toolbarPosition");
    return saved ? JSON.parse(saved) : { x: 20, y: 20 };
  }

  savePosition(position) {
    localStorage.setItem("toolbarPosition", JSON.stringify(position));
  }
}

const manager = new ToolbarManager();
```

## Disabling Drag for Specific Tools

You can prevent drag from starting when clicking on specific tools:

```javascript
toolbar.addTool({
  id: "important",
  label: "Important",
  icon: "navigation.warning",
  action: () => {
    // This action should execute, not start drag
  }
});

// Drag only starts from drag handle, not from tools
```

## Accessibility Considerations

### Keyboard Navigation

Consider adding keyboard support for positioning:

```javascript
document.addEventListener("keydown", (e) => {
  if (!toolbar.isFocused()) return;

  const step = 10;
  const pos = toolbar.getPosition();

  switch (e.key) {
    case "ArrowLeft":
      toolbar.setPosition({ x: pos.x - step, y: pos.y });
      break;
    case "ArrowRight":
      toolbar.setPosition({ x: pos.x + step, y: pos.y });
      break;
    case "ArrowUp":
      toolbar.setPosition({ x: pos.x, y: pos.y - step });
      break;
    case "ArrowDown":
      toolbar.setPosition({ x: pos.x, y: pos.y + step });
      break;
  }
});
```

### ARIA Attributes

```html
<div class="toolbar__drag-handle"
     role="button"
     aria-label="Drag to reposition toolbar"
     tabindex="0">
  <!-- Drag handle icon -->
</div>
```

## Best Practices

1. **Always enable snapping with dragging**
   ```javascript
   const toolbar = new Toolbar({
     draggable: true,
     snapping: true // Better UX
   });
   ```

2. **Save position across sessions**
   ```javascript
   toolbar.on("position:change", (data) => {
     localStorage.setItem("toolbarPos", JSON.stringify(data.position));
   });
   ```

3. **Provide visual feedback**
   - Compact drag mode (built-in)
   - Overlay (built-in)
   - Snap highlights (see [Snapping](./snapping.md))

4. **Consider mobile users**
   - Test touch dragging
   - Ensure drag handle is large enough (44px minimum)
   - Consider disabling drag on small screens

5. **Respect user preferences**
   - Allow users to reset position
   - Provide "Lock position" option
   - Remember dragging enabled/disabled state

---

[Prev: Size Variants](./size-variants.md) | [Index](./index.md) | [Next: Snapping](./snapping.md)
