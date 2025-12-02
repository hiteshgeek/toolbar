[Prev: Dragging & Positioning](./dragging.md) | [Index](./index.md) | [Next: API Reference](./api-reference.md)

---

# Snapping

The toolbar features smart snapping to screen edges and corners with visual feedback and smooth animations.

## Overview

When snapping is enabled, the toolbar automatically snaps to nearby edges and corners when dragged close to them. This provides:
- Precise positioning
- Consistent alignment
- Visual feedback during drag
- Smooth snap animations

## Enabling Snapping

### At Initialization

```javascript
const toolbar = new Toolbar({
  draggable: true, // Required for snapping
  snapping: true,
  snapDistance: 20 // Optional, default: 20px
});
```

### Programmatically

```javascript
// Enable snapping
toolbar.setSnapping(true);

// Disable snapping
toolbar.setSnapping(false);

// Check if snapping is enabled
const isSnapping = toolbar.getSnapping();
```

## Snap Zones

The toolbar can snap to 8 zones:

### Edges (4 zones)
- **Top** - Top edge of container
- **Right** - Right edge of container
- **Bottom** - Bottom edge of container
- **Left** - Left edge of container

### Corners (4 zones)
- **Top-Left** - Top-left corner
- **Top-Right** - Top-right corner
- **Bottom-Left** - Bottom-left corner
- **Bottom-Right** - Bottom-right corner

```
┌─────────────────┐
│ TL    Top    TR │
│                 │
│Left       Right │
│                 │
│ BL  Bottom   BR │
└─────────────────┘
```

## Snap Distance

The `snapDistance` option controls how close you need to drag the toolbar to trigger snapping:

```javascript
const toolbar = new Toolbar({
  snapping: true,
  snapDistance: 30 // Snap when within 30px of edge/corner
});
```

**Default:** 20px

**Recommendations:**
- Small screens: 15-20px
- Large screens: 20-30px
- Touch devices: 30-40px (larger target)

## Visual Feedback

### During Drag

When dragging near a snap zone:
- Snap zone is highlighted with semi-transparent overlay
- Highlight shows where toolbar will snap
- Color: rgba(255, 255, 255, 0.2)

### On Snap

When toolbar snaps:
- Smooth animation to final position
- Overlay disappears
- Snap event fires

## Snap Events

### `snap` Event

Fired when toolbar snaps to a zone:

```javascript
toolbar.on("snap", (data) => {
  console.log("Snapped to:", data.snapZone);
  console.log("Position:", data.position);
});
```

**Event data:**
```javascript
{
  snapZone: "top-left" | "top" | "top-right" | "left" | "right" | "bottom-left" | "bottom" | "bottom-right",
  position: { x: number, y: number }
}
```

### Example: Save Snap Preference

```javascript
toolbar.on("snap", (data) => {
  // Save snapped position
  localStorage.setItem("toolbarSnappedTo", data.snapZone);
  localStorage.setItem("toolbarPosition", JSON.stringify(data.position));
});

// Restore on load
const snappedZone = localStorage.getItem("toolbarSnappedTo");
const savedPos = localStorage.getItem("toolbarPosition");

if (savedPos) {
  toolbar.setPosition(JSON.parse(savedPos));
}
```

## Snap Positions

### Edge Snapping

Edges snap with a small margin from the container edge:

```javascript
// Top edge
{ x: currentX, y: 0 }

// Right edge
{ x: containerWidth - toolbarWidth, y: currentY }

// Bottom edge
{ x: currentX, y: containerHeight - toolbarHeight }

// Left edge
{ x: 0, y: currentY }
```

### Corner Snapping

Corners snap to exact positions:

```javascript
// Top-left
{ x: 0, y: 0 }

// Top-right
{ x: containerWidth - toolbarWidth, y: 0 }

// Bottom-left
{ x: 0, y: containerHeight - toolbarHeight }

// Bottom-right
{ x: containerWidth - toolbarWidth, y: containerHeight - toolbarHeight }
```

## Priority System

When toolbar is near multiple snap zones, priority is:

1. **Corners** (highest priority)
2. **Edges** (lower priority)

```javascript
// Example: Near top-left corner
// → Snaps to top-left corner (not top or left edge)

// Example: Near top edge (but not corner)
// → Snaps to top edge
```

## Complete Example

```javascript
const toolbar = new Toolbar({
  container: document.body,
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
  action: () => search()
});

// Track snapping
let currentSnapZone = null;

toolbar.on("snap", (data) => {
  currentSnapZone = data.snapZone;
  console.log("Snapped to:", data.snapZone);

  // Visual feedback
  showNotification(`Toolbar snapped to ${data.snapZone}`);

  // Save preference
  localStorage.setItem("toolbarSnapZone", data.snapZone);
  localStorage.setItem("toolbarPosition", JSON.stringify(data.position));
});

// Show current snap zone
toolbar.addTool({
  id: "snap-info",
  label: currentSnapZone || "Free",
  icon: "navigation.info",
  tooltip: "Current snap zone",
  action: () => {
    alert(`Snapped to: ${currentSnapZone || "None (free position)"}`);
  }
});
```

## Snap Zone Detection

The toolbar uses distance calculations to determine snap zones:

```javascript
_calculateSnapZone(x, y) {
  const snapDist = this.options.snapDistance;
  const bounds = this.state.bounds;

  // Check corners first (higher priority)
  if (x <= snapDist && y <= snapDist) return "top-left";
  if (x >= bounds.maxX - snapDist && y <= snapDist) return "top-right";
  if (x <= snapDist && y >= bounds.maxY - snapDist) return "bottom-left";
  if (x >= bounds.maxX - snapDist && y >= bounds.maxY - snapDist) return "bottom-right";

  // Check edges
  if (y <= snapDist) return "top";
  if (x >= bounds.maxX - snapDist) return "right";
  if (y >= bounds.maxY - snapDist) return "bottom";
  if (x <= snapDist) return "left";

  return null; // No snap zone
}
```

## Customizing Snap Distance Per Zone

Currently, snap distance is global. For per-zone customization, extend the Toolbar class:

```javascript
class CustomToolbar extends Toolbar {
  constructor(options) {
    super(options);

    // Custom snap distances per zone
    this.snapDistances = {
      corners: 30,
      edges: 20
    };
  }

  _calculateSnapZone(x, y) {
    const cornerDist = this.snapDistances.corners;
    const edgeDist = this.snapDistances.edges;
    const bounds = this.state.bounds;

    // Corners use larger snap distance
    if (x <= cornerDist && y <= cornerDist) return "top-left";
    // ... etc

    // Edges use smaller snap distance
    if (y <= edgeDist) return "top";
    // ... etc

    return null;
  }
}
```

## Disabling Specific Snap Zones

Extend the toolbar to disable specific zones:

```javascript
class SelectiveSnapToolbar extends Toolbar {
  constructor(options) {
    super(options);
    this.disabledZones = options.disabledZones || [];
  }

  _calculateSnapZone(x, y) {
    const zone = super._calculateSnapZone(x, y);

    if (this.disabledZones.includes(zone)) {
      return null; // Skip this zone
    }

    return zone;
  }
}

// Usage
const toolbar = new SelectiveSnapToolbar({
  draggable: true,
  snapping: true,
  disabledZones: ["bottom", "bottom-left", "bottom-right"]
  // Only allow snapping to top and sides
});
```

## Magnetic Snapping

Create magnetic snapping that pulls toolbar into snap zones:

```javascript
toolbar.on("drag:move", (data) => {
  const zone = toolbar._calculateSnapZone(data.position.x, data.position.y);

  if (zone) {
    // Show visual feedback that we're in snap zone
    toolbar.element.classList.add("toolbar--near-snap");
  } else {
    toolbar.element.classList.remove("toolbar--near-snap");
  }
});

// CSS
.toolbar--near-snap {
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
}
```

## Responsive Snap Zones

Adjust snap distance based on screen size:

```javascript
function getResponsiveSnapDistance() {
  if (window.innerWidth < 768) {
    return 15; // Small screens - tighter snapping
  } else if (window.innerWidth < 1200) {
    return 20; // Medium screens
  } else {
    return 30; // Large screens - more generous
  }
}

const toolbar = new Toolbar({
  draggable: true,
  snapping: true,
  snapDistance: getResponsiveSnapDistance()
});

// Update on resize
window.addEventListener("resize", () => {
  toolbar.options.snapDistance = getResponsiveSnapDistance();
});
```

## Accessibility

### Keyboard Snapping

Add keyboard shortcuts to snap to specific zones:

```javascript
document.addEventListener("keydown", (e) => {
  if (!e.ctrlKey) return;

  const bounds = toolbar.state.bounds;
  let newPos;

  switch (e.key) {
    case "ArrowUp":
      if (e.shiftKey) {
        // Ctrl+Shift+Up: Snap to top-left
        newPos = { x: 0, y: 0 };
      } else {
        // Ctrl+Up: Snap to top
        newPos = { x: toolbar.getPosition().x, y: 0 };
      }
      break;

    case "ArrowRight":
      if (e.shiftKey) {
        // Ctrl+Shift+Right: Snap to top-right
        newPos = { x: bounds.maxX, y: 0 };
      } else {
        // Ctrl+Right: Snap to right
        newPos = { x: bounds.maxX, y: toolbar.getPosition().y };
      }
      break;

    // ... more shortcuts
  }

  if (newPos) {
    toolbar.setPosition(newPos);
    e.preventDefault();
  }
});
```

### Announce Snapping

```javascript
toolbar.on("snap", (data) => {
  // Create live region for screen readers
  const liveRegion = document.getElementById("toolbar-announcements");
  liveRegion.textContent = `Toolbar snapped to ${data.snapZone.replace("-", " ")}`;
});

// HTML
<div id="toolbar-announcements" role="status" aria-live="polite" aria-atomic="true" class="sr-only"></div>
```

## Best Practices

1. **Always enable with dragging**
   ```javascript
   const toolbar = new Toolbar({
     draggable: true,
     snapping: true // Better UX
   });
   ```

2. **Use appropriate snap distance**
   - Desktop: 20-25px
   - Touch: 30-40px
   - Small screens: 15-20px

3. **Provide visual feedback**
   - Show snap zone highlights (built-in)
   - Add cursor changes
   - Consider haptic feedback on mobile

4. **Save snapped position**
   ```javascript
   toolbar.on("snap", (data) => {
     localStorage.setItem("toolbarSnapZone", data.snapZone);
   });
   ```

5. **Test all snap zones**
   - Ensure toolbar looks good in all positions
   - Check for overlapping UI elements
   - Verify on different screen sizes

---

[Prev: Dragging & Positioning](./dragging.md) | [Index](./index.md) | [Next: API Reference](./api-reference.md)
