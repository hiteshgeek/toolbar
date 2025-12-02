[Prev: Force Display Mode](./force-display-mode.md) | [Index](./index.md) | [Next: Dragging & Positioning](./dragging.md)

---

# Size Variants

The toolbar supports three pre-configured size variants: small, medium, and large. Each size variant adjusts button dimensions, spacing, and font sizes.

## Available Sizes

### Small
- **Button size:** 32px × 32px (icon-only)
- **Icon size:** 14px
- **Font size:** 0.813rem (~13px)
- **Gap:** 6px
- **Padding:** 6px 10px
- **Best for:** Compact interfaces, mobile devices, minimal footprint

### Medium (Default)
- **Button size:** 40px × 40px (icon-only)
- **Icon size:** 16px
- **Font size:** 0.938rem (~15px)
- **Gap:** 8px
- **Padding:** 8px 12px
- **Best for:** Standard desktop interfaces, balanced design

### Large
- **Button size:** 52px × 52px (icon-only)
- **Icon size:** 22px
- **Font size:** 1.063rem (~17px)
- **Gap:** 16px
- **Padding:** 16px 24px
- **Best for:** Touch interfaces, accessibility, large displays

## Setting Size

### At Initialization

```javascript
const toolbar = new Toolbar({
  size: "large" // "small" | "medium" | "large"
});
```

### Programmatically

```javascript
// Set to small
toolbar.setSize("small");

// Set to medium
toolbar.setSize("medium");

// Set to large
toolbar.setSize("large");
```

### Getting Current Size

```javascript
const currentSize = toolbar.getSize();
console.log(currentSize); // "small", "medium", or "large"
```

### Cycling Through Sizes

```javascript
// Cycle to next size: small → medium → large → small
toolbar.nextSize();
```

## Size Comparison

### Icon-Only Mode

```
Small:  [🔍] [🔎] [❓]  (32px buttons, 6px gap)

Medium: [ 🔍 ] [ 🔎 ] [ ❓ ]  (40px buttons, 8px gap)

Large:  [  🔍  ] [  🔎  ] [  ❓  ]  (52px buttons, 16px gap)
```

### Both Mode

```
Small:  [🔍 Search] [🔎 Zoom] [❓ Help]

Medium: [ 🔍 Search ] [ 🔎 Zoom ] [ ❓ Help ]

Large:  [  🔍 Search  ] [  🔎 Zoom  ] [  ❓ Help  ]
```

## Implementing a Size Toggle

Create a button that cycles through all three sizes:

```javascript
const SIZE_CONFIG = {
  order: ["small", "medium", "large"],
  labels: {
    small: "Small",
    medium: "Medium",
    large: "Large"
  }
};

// Add size toggle button
toolbar.addTool({
  id: "toggle-size",
  label: "Size",
  icon: "utils.menu",
  tooltip: "Size: Medium",
  action: () => {
    toolbar.nextSize();
  }
});

// Update button visuals when size changes
toolbar.on("size:change", (data) => {
  const size = data.size;
  const label = SIZE_CONFIG.labels[size];

  toolbar.updateTool("toggle-size", {
    tooltip: `Size: ${label}`
  });
});
```

## Size Events

Listen for size changes:

```javascript
toolbar.on("size:change", (data) => {
  console.log("Size changed to:", data.size);

  // Update UI or save preference
  localStorage.setItem("toolbarSize", data.size);
});
```

## Responsive Sizing

Automatically adjust size based on screen width:

```javascript
function updateToolbarSize() {
  if (window.innerWidth < 768) {
    toolbar.setSize("small");
  } else if (window.innerWidth < 1200) {
    toolbar.setSize("medium");
  } else {
    toolbar.setSize("large");
  }
}

// Update on resize
window.addEventListener("resize", updateToolbarSize);

// Initial update
updateToolbarSize();
```

## Touch-Friendly Sizing

For touch interfaces, use larger sizes:

```javascript
// Detect touch support
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const toolbar = new Toolbar({
  size: isTouchDevice ? "large" : "medium"
});
```

## Accessibility Considerations

### Small Size
- May be difficult for users with motor impairments
- Small touch targets (32px may not meet WCAG 2.1 requirements)
- Consider only for desktop with precise mouse input

### Medium Size
- Good balance for most users
- Meets minimum touch target size (40px)
- Recommended default

### Large Size
- Exceeds WCAG 2.1 touch target guidelines (44px minimum)
- Easier for users with motor impairments
- Better for elderly users
- Recommended for accessibility-focused applications

```javascript
// Accessibility-first approach
const toolbar = new Toolbar({
  size: "large" // Exceed accessibility guidelines
});
```

## CSS Implementation

Size variants are implemented using modifier classes:

```scss
// Small size
.toolbar--size-small {
  padding: 6px 10px;
  gap: 6px;

  .toolbar__tool {
    height: 32px;
    font-size: 0.813rem;
  }

  .toolbar__tools.icon_only .toolbar__tool {
    width: 32px;
    height: 32px;
  }
}

// Medium size (default)
.toolbar--size-medium {
  padding: 8px 12px;
  gap: 8px;

  .toolbar__tool {
    height: 40px;
    font-size: 0.938rem;
  }

  .toolbar__tools.icon_only .toolbar__tool {
    width: 40px;
    height: 40px;
  }
}

// Large size
.toolbar--size-large {
  padding: 16px 24px;
  gap: 16px;

  .toolbar__tool {
    height: 52px;
    font-size: 1.063rem;
  }

  .toolbar__tools.icon_only .toolbar__tool {
    width: 52px;
    height: 52px;
  }
}
```

## Detailed Specifications

### Small Size Specifications

| Property | Icon Only | Label Only | Both |
|----------|-----------|------------|------|
| Width | 32px | auto (min 40px) | auto (min 40px) |
| Height | 32px | 32px | 32px |
| Padding | 0 | 0 12px | 6px 12px |
| Border Radius | 50% | 8px | 8px |
| Icon Size | 14px | - | 14px |
| Font Size | - | 0.813rem | 0.813rem |
| Gap | 6px | 6px | 6px |

### Medium Size Specifications

| Property | Icon Only | Label Only | Both |
|----------|-----------|------------|------|
| Width | 40px | auto (min 40px) | auto (min 40px) |
| Height | 40px | 40px | 40px |
| Padding | 0 | 0 16px | 8px 16px |
| Border Radius | 50% | 8px | 8px |
| Icon Size | 16px | - | 16px |
| Font Size | - | 0.938rem | 0.938rem |
| Gap | 8px | 8px | 8px |

### Large Size Specifications

| Property | Icon Only | Label Only | Both |
|----------|-----------|------------|------|
| Width | 52px | auto (min 40px) | auto (min 40px) |
| Height | 52px | 52px | 52px |
| Padding | 0 | 0 20px | 12px 20px |
| Border Radius | 50% | 8px | 8px |
| Icon Size | 22px | - | 22px |
| Font Size | - | 1.063rem | 1.063rem |
| Gap | 16px | 16px | 16px |

## Combining with Display Modes

Size variants work seamlessly with display modes:

```javascript
const toolbar = new Toolbar({
  size: "large",
  displayMode: "icon"
});

// Large icon-only buttons (52px × 52px, circular)
toolbar.addTool({
  id: "search",
  icon: "navigation.search",
  action: () => search()
});

// Change to both mode
toolbar.setDisplayMode("both");
// Now: Large buttons with icons and labels

// Change to small size
toolbar.setSize("small");
// Now: Small buttons with icons and labels (32px height)
```

## Combining with Force Display Mode

Forced display modes respect size variants:

```javascript
const toolbar = new Toolbar({
  size: "small",
  displayMode: "both"
});

// Regular tool: small, both mode (32px height, icon + label)
toolbar.addTool({
  id: "search",
  label: "Search",
  icon: "navigation.search"
});

// Forced icon-only: small circular button (32px × 32px)
toolbar.addTool({
  id: "help",
  label: "Help",
  icon: "navigation.circle_question",
  forceDisplayMode: "icon"
});

// Change to large size
toolbar.setSize("large");
// search: 52px height, icon + label
// help: 52px × 52px circular (forced icon-only)
```

## Best Practices

1. **Choose based on context**
   - Mobile: small or medium
   - Desktop: medium
   - Touch: large
   - Accessibility: large

2. **Test all combinations**
   - Test each size with all display modes
   - Ensure icons are clear at all sizes
   - Verify labels are readable

3. **Persist user preference**
   ```javascript
   const savedSize = localStorage.getItem("toolbarSize") || "medium";
   toolbar.setSize(savedSize);

   toolbar.on("size:change", (data) => {
     localStorage.setItem("toolbarSize", data.size);
   });
   ```

4. **Consider screen density**
   ```javascript
   const pixelRatio = window.devicePixelRatio || 1;
   const size = pixelRatio >= 2 ? "medium" : "large";
   toolbar.setSize(size);
   ```

5. **Provide user control**
   - Allow users to change size
   - Show current size in UI
   - Save preference across sessions

---

[Prev: Force Display Mode](./force-display-mode.md) | [Index](./index.md) | [Next: Dragging & Positioning](./dragging.md)
