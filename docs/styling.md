[Prev: API Reference](./api-reference.md) | [Index](./index.md)

---

# Styling & Customization

Learn how to customize the toolbar's appearance using CSS variables, custom classes, and SCSS.

## CSS Architecture

The toolbar uses SCSS with a modular architecture:

```
src/library/scss/components/toolbar/
├── _base.scss           # Base styles, size variants
├── _tool.scss           # Tool button styles
├── _drag-handle.scss    # Drag handle styles
├── _set-indicator.scss  # Tool set indicator styles
├── _overlay.scss        # Drag overlay styles
└── toolbar.scss         # Main entry point
```

## CSS Variables

The toolbar uses CSS custom properties for easy theming:

### Colors

```css
:root {
  --toolbar-bg: rgba(255, 255, 255, 0.8);
  --toolbar-bg-solid: #ffffff;
  --toolbar-bg-tool: rgba(255, 255, 255, 0.1);
  --toolbar-bg-hover: rgba(255, 255, 255, 0.2);
  --toolbar-text: #333333;
  --toolbar-icon: #666666;
  --toolbar-border: rgba(0, 0, 0, 0.1);
  --toolbar-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### Example: Dark Theme

```css
[data-theme="dark"] {
  --toolbar-bg: rgba(30, 30, 30, 0.9);
  --toolbar-bg-solid: #1e1e1e;
  --toolbar-bg-tool: rgba(255, 255, 255, 0.05);
  --toolbar-bg-hover: rgba(255, 255, 255, 0.1);
  --toolbar-text: #e0e0e0;
  --toolbar-icon: #a0a0a0;
  --toolbar-border: rgba(255, 255, 255, 0.1);
  --toolbar-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}
```

## Custom Classes

Add custom classes to tools for specific styling:

```javascript
toolbar.addTool({
  id: "save",
  label: "Save",
  icon: "navigation.save",
  customClass: "toolbar__tool--primary",
  action: () => save()
});
```

### Example Custom Tool Classes

```css
/* Primary action button */
.toolbar__tool--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.toolbar__tool--primary:hover {
  background: linear-gradient(135deg, #5568d3 0%, #65408d 100%);
}

/* Danger/destructive action */
.toolbar__tool--danger {
  background: #ef4444;
  color: white;
}

.toolbar__tool--danger:hover {
  background: #dc2626;
}

/* Success action */
.toolbar__tool--success {
  background: #10b981;
  color: white;
}

/* Warning action */
.toolbar__tool--warning {
  background: #f59e0b;
  color: white;
}

/* Active/selected state */
.toolbar__tool--active {
  background: var(--toolbar-bg-hover);
  box-shadow: inset 0 0 0 2px rgba(66, 153, 225, 0.5);
}

/* Disabled state (custom override) */
.toolbar__tool--custom-disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}
```

## SCSS Variables

If using SCSS, customize using the variables map:

```scss
// _toolbar-config.scss
@use "sass:map";

$toolbar-colors: (
  bg: rgba(255, 255, 255, 0.8),
  bg-solid: #ffffff,
  bg-tool: rgba(255, 255, 255, 0.1),
  bg-hover: rgba(255, 255, 255, 0.2),
  text: #333333,
  icon: #666666,
  border: rgba(0, 0, 0, 0.1)
);

$toolbar-sizes: (
  tool: (
    small: 32px,
    default: 40px,
    large: 52px
  ),
  icon: (
    small: 14px,
    default: 16px,
    large: 22px
  )
);

$toolbar-spacing: (
  padding: 8px 12px,
  gap: 8px,
  tool-padding: 8px 16px
);

$toolbar-border: (
  radius: 12px,
  tool-radius: 8px
);

$toolbar-animation: (
  duration: (
    fast: 150ms,
    normal: 250ms,
    slow: 350ms
  ),
  easing: cubic-bezier(0.4, 0, 0.2, 1)
);
```

## Customizing Specific Elements

### Toolbar Container

```css
.toolbar {
  /* Override border radius */
  border-radius: 16px;

  /* Custom backdrop filter */
  backdrop-filter: blur(10px) saturate(150%);

  /* Custom shadow */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

  /* Custom border */
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Tool Buttons

```css
/* All tool buttons */
.toolbar__tool {
  /* Custom font */
  font-family: "Inter", system-ui, sans-serif;

  /* Custom transition */
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Custom hover effect */
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  /* Custom active effect */
  &:active {
    transform: translateY(0);
  }
}

/* Icon-only buttons */
.toolbar__tools.icon_only .toolbar__tool {
  /* Custom size for icon-only */
  width: 48px;
  height: 48px;
}

/* Label-only buttons */
.toolbar__tools.label_only .toolbar__tool {
  /* Custom padding */
  padding: 0 20px;

  /* Custom font weight */
  font-weight: 600;
}
```

### Icons

```css
.toolbar__tool-icon {
  /* Custom icon size */
  width: 20px;
  height: 20px;

  /* Custom icon color */
  fill: currentColor;
  opacity: 0.8;
}

/* Icon on hover */
.toolbar__tool:hover .toolbar__tool-icon {
  opacity: 1;
  transform: scale(1.1);
}
```

### Labels

```css
.toolbar__tool-label {
  /* Custom font */
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;

  /* Custom color */
  color: var(--toolbar-text);
  opacity: 0.9;
}

/* Label on hover */
.toolbar__tool:hover .toolbar__tool-label {
  opacity: 1;
}
```

### Drag Handle

```css
.toolbar__drag-handle {
  /* Custom cursor */
  cursor: grab;

  /* Custom opacity */
  opacity: 0.6;

  /* Custom hover */
  &:hover {
    opacity: 1;
    background: var(--toolbar-bg-hover);
    border-radius: 6px;
  }

  /* Custom active */
  &:active {
    cursor: grabbing;
  }
}
```

### Set Indicator

```css
.toolbar__set-indicator {
  /* Custom spacing */
  gap: 12px;
  padding: 0 12px;

  /* Custom border */
  border-left: 2px solid var(--toolbar-border);
}

.toolbar__set-dot {
  /* Custom size */
  width: 8px;
  height: 8px;

  /* Custom color */
  background: var(--toolbar-icon);
  opacity: 0.3;

  /* Custom transition */
  transition: all 200ms ease;

  /* Active state */
  &--active {
    opacity: 1;
    background: #667eea;
    transform: scale(1.3);
  }
}
```

### Drag Overlay

```css
.toolbar--overlay {
  /* Custom background */
  background: rgba(0, 0, 0, 0.6);

  /* Custom backdrop filter */
  backdrop-filter: blur(8px);

  /* Custom cursor */
  cursor: grabbing;
}
```

## Size Customization

### Custom Size Variant

```scss
// Add custom "tiny" size
.toolbar--size-tiny {
  padding: 4px 6px;
  gap: 4px;

  .toolbar__tool {
    height: 24px;
    font-size: 0.75rem;
  }

  .toolbar__tools.icon_only .toolbar__tool {
    width: 24px;
    height: 24px;
  }

  .toolbar__tool-icon {
    width: 12px;
    height: 12px;
  }
}
```

### Custom Size via JavaScript

```javascript
// Add custom size to toolbar
toolbar.element.classList.add("toolbar--size-tiny");
```

## Display Mode Customization

### Custom Display Mode Styles

```css
/* Custom icon-only styling */
.toolbar__tools.icon_only .toolbar__tool {
  /* Square instead of circular */
  border-radius: 8px;

  /* Custom size */
  width: 36px;
  height: 36px;
}

/* Custom label-only styling */
.toolbar__tools.label_only .toolbar__tool {
  /* Pill shape */
  border-radius: 999px;

  /* Custom padding */
  padding: 0 24px;

  /* Uppercase labels */
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
}

/* Custom both mode styling */
.toolbar__tools.with_label .toolbar__tool {
  /* Custom gap between icon and label */
  gap: 12px;

  /* Custom padding */
  padding: 10px 20px;
}
```

## Animation Customization

### Hover Animations

```css
.toolbar__tool {
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Scale on hover */
.toolbar__tool:hover {
  transform: scale(1.05);
}

/* Lift on hover */
.toolbar__tool:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* Glow on hover */
.toolbar__tool:hover {
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}
```

### Display Mode Transitions

```css
.toolbar__tool {
  transition: width 300ms ease,
              height 300ms ease,
              padding 300ms ease,
              border-radius 300ms ease;
}

/* Smooth icon/label fade */
.toolbar__tool-icon,
.toolbar__tool-label {
  transition: opacity 200ms ease,
              transform 200ms ease;
}
```

### Drag Animations

```css
/* Custom compact drag transition */
.toolbar--dragging-compact {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  transform: scale(0.95);
}

/* Custom snap animation */
.toolbar {
  transition: left 300ms cubic-bezier(0.4, 0, 0.2, 1),
              top 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Responsive Styling

### Mobile Styles

```css
@media (max-width: 768px) {
  .toolbar {
    /* Smaller size on mobile */
    padding: 6px 8px;
    gap: 4px;
  }

  .toolbar__tool {
    /* Larger touch targets */
    min-width: 44px;
    min-height: 44px;
  }

  /* Hide labels on mobile, show only icons */
  .toolbar__tools.with_label {
    .toolbar__tool-label {
      display: none;
    }

    .toolbar__tool {
      width: 44px;
      padding: 0;
      border-radius: 50%;
    }
  }
}
```

### Tablet Styles

```css
@media (min-width: 768px) and (max-width: 1024px) {
  .toolbar {
    padding: 8px 12px;
  }

  .toolbar__tool {
    height: 40px;
  }
}
```

## Theme Examples

### Glass Morphism Theme

```css
.toolbar--glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.toolbar--glass .toolbar__tool {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toolbar--glass .toolbar__tool:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

### Neumorphism Theme

```css
.toolbar--neuro {
  background: #e0e5ec;
  box-shadow: 9px 9px 16px rgba(163, 177, 198, 0.6),
              -9px -9px 16px rgba(255, 255, 255, 0.5);
  border-radius: 20px;
}

.toolbar--neuro .toolbar__tool {
  background: #e0e5ec;
  box-shadow: 3px 3px 6px rgba(163, 177, 198, 0.4),
              -3px -3px 6px rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}

.toolbar--neuro .toolbar__tool:hover {
  box-shadow: inset 3px 3px 6px rgba(163, 177, 198, 0.4),
              inset -3px -3px 6px rgba(255, 255, 255, 0.5);
}
```

### Gradient Theme

```css
.toolbar--gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
}

.toolbar--gradient .toolbar__tool {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toolbar--gradient .toolbar__tool:hover {
  background: rgba(255, 255, 255, 0.2);
}

.toolbar--gradient .toolbar__tool-icon {
  fill: white;
}
```

## Complete Custom Theme Example

```css
/* Custom tech theme */
.toolbar--tech {
  /* Container */
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 10px 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);

  /* Tools */
  .toolbar__tool {
    background: rgba(255, 255, 255, 0.1);
    color: #e0e0e0;
    border: 1px solid rgba(255, 255, 255, 0.15);
    font-family: "JetBrains Mono", monospace;
    transition: all 200ms ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
  }

  /* Icons */
  .toolbar__tool-icon {
    fill: #64b5f6;
    filter: drop-shadow(0 0 4px rgba(100, 181, 246, 0.5));
  }

  /* Active tool */
  .toolbar__tool--active {
    background: rgba(100, 181, 246, 0.3);
    box-shadow: inset 0 0 0 2px #64b5f6;
  }

  /* Drag handle */
  .toolbar__drag-handle {
    opacity: 0.7;

    svg {
      fill: #e0e0e0;
    }

    &:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.1);
    }
  }

  /* Set indicator */
  .toolbar__set-dot {
    background: rgba(255, 255, 255, 0.3);

    &--active {
      background: #64b5f6;
      box-shadow: 0 0 8px rgba(100, 181, 246, 0.8);
    }
  }
}
```

### Applying Custom Theme

```javascript
const toolbar = new Toolbar({
  container: document.body
});

// Add custom theme class
toolbar.element.classList.add("toolbar--tech");
```

## Best Practices

1. **Use CSS variables** for easy theming
2. **Avoid !important** unless overriding forced display modes
3. **Test all display modes** when customizing
4. **Test all size variants** with your custom styles
5. **Ensure accessibility** - maintain sufficient color contrast
6. **Test hover states** on both mouse and touch devices
7. **Use transitions** for smooth state changes
8. **Consider dark mode** when theming

---

[Prev: API Reference](./api-reference.md) | [Index](./index.md)
