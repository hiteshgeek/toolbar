# Toolbar Component - Modular Architecture

## Overview

The Toolbar component has been refactored into a modular architecture for better maintainability, extensibility, and code organization.

## Directory Structure

```
toolbar/
├── Toolbar.js                 # Main Toolbar class (orchestrator)
├── ToolbarEmitter.js          # Event emitter for toolbar events
├── builtins/                  # Built-in tools (theme, display mode, size)
│   ├── index.js               # Barrel export for built-in tools
│   ├── BaseBuiltInTool.js     # Abstract base class for built-in tools
│   ├── ThemeSwitcher.js       # Theme switcher tool
│   ├── DisplayModeSwitcher.js # Display mode switcher tool
│   ├── SizeChanger.js         # Size changer tool
│   └── BuiltInToolsManager.js # Manager for built-in tools
└── managers/                  # Functionality managers
    ├── index.js               # Barrel export for managers
    └── ToolManager.js         # Tool management (add, remove, update)
```

## Architecture Principles

### 1. **Separation of Concerns**
Each module handles a specific aspect of toolbar functionality:
- **Built-in Tools**: Self-contained tool implementations
- **Managers**: Handle specific domains (tools, drag, snap, etc.)
- **Main Toolbar**: Orchestrates all components

### 2. **Extensibility**
New built-in tools can be added by:
1. Extending `BaseBuiltInTool`
2. Registering with `BuiltInToolsManager`

### 3. **Encapsulation**
Each module exposes a clean public API while hiding implementation details.

## Built-In Tools Module

### BaseBuiltInTool (Abstract Class)

Base class that all built-in tools must extend.

**Key Methods:**
- `getDefaultId()` - Returns default tool ID
- `getIcon(state)` - Returns icon for current state
- `getLabel(state)` - Returns label for current state
- `getTooltip(state)` - Returns tooltip for current state
- `handleAction()` - Handles tool click
- `getCurrentState()` - Returns current state
- `updateVisuals()` - Updates tool appearance
- `register()` - Registers tool with toolbar
- `unregister()` - Unregisters tool from toolbar

### ThemeSwitcher

Manages theme switching (light, dark, system).

**Configuration:**
```javascript
{
  iconLight: "utils.sun",
  iconDark: "utils.moon",
  iconSystem: "utils.desktop",
  labelLight: "Light",
  labelDark: "Dark",
  labelSystem: "System",
  tooltip: "Change theme",
  customClass: "toolbar__tool--active",
  forceDisplayMode: "icon"
}
```

### DisplayModeSwitcher

Manages display mode switching (icon, label, both).

**Configuration:**
```javascript
{
  iconIcon: "utils.menu",
  iconLabel: "utils.menu",
  iconBoth: "utils.menu",
  labelIcon: "Icons Only",
  labelLabel: "Labels Only",
  labelBoth: "Icons & Labels",
  tooltip: "Change display mode",
  customClass: "toolbar__tool--active"
}
```

### SizeChanger

Manages toolbar size switching (small, medium, large).

**Configuration:**
```javascript
{
  iconSmall: "utils.minimize",
  iconMedium: "utils.menu",
  iconLarge: "utils.maximize",
  labelSmall: "Small",
  labelMedium: "Medium",
  labelLarge: "Large",
  tooltip: "Change size",
  customClass: "toolbar__tool--active"
}
```

### BuiltInToolsManager

Manages registration and lifecycle of all built-in tools.

**Methods:**
- `initialize()` - Initialize all enabled built-in tools
- `registerTool(toolKey, config)` - Register a specific tool
- `unregisterTool(toolKey)` - Unregister a specific tool
- `getTool(toolKey)` - Get tool instance
- `hasTool(toolKey)` - Check if tool exists
- `destroy()` - Cleanup all tools
- `registerToolClass(toolKey, ToolClass)` - Register custom tool class

## Creating Custom Built-In Tools

### Step 1: Create Tool Class

```javascript
import BaseBuiltInTool from "./BaseBuiltInTool.js";

export default class MyCustomTool extends BaseBuiltInTool {
  constructor(toolbar, config = {}) {
    super(toolbar, config);
    // Custom initialization
  }

  getDefaultId() {
    return "__builtin-my-custom-tool";
  }

  getCurrentState() {
    return this.toolbar.options.myState;
  }

  getIcon(state) {
    return this.config[`icon${state}`] || "utils.menu";
  }

  getLabel(state) {
    return this.config[`label${state}`] || "My Tool";
  }

  getTooltip(state) {
    return this.config.tooltip || `My Tool: ${state}`;
  }

  handleAction() {
    // Handle click
    this.toolbar.setMyState(/* new state */);
    this.updateVisuals();
  }
}
```

### Step 2: Register Tool Class

```javascript
// In your initialization code
toolbar.builtInToolsManager.registerToolClass("myCustom", MyCustomTool);

// Enable in toolbar options
const toolbar = new Toolbar({
  builtInTools: {
    theme: true,
    displayMode: true,
    size: true,
    myCustom: true // Your custom tool
  },
  builtInToolsConfig: {
    myCustom: {
      // Custom configuration
    }
  }
});
```

## Managers Module

### ToolManager

Handles tool management operations.

**Methods:**
- `addTool(tool)` - Add a tool
- `removeTool(toolId)` - Remove a tool
- `updateTool(toolId, updates)` - Update tool properties
- `getTool(toolId)` - Get tool by ID
- `getAllTools()` - Get all tools
- `clearTools()` - Clear all tools
- `hasTool(toolId)` - Check if tool exists
- `getToolsCount()` - Get tools count
- `getToolsByGroup(groupId)` - Get tools in a group
- `registerTools()` - Register tools from options
- `registerGroups()` - Register groups from options

**Usage:**
```javascript
// Add tool
toolbar.addTool({
  id: "my-tool",
  label: "My Tool",
  icon: "navigation.search",
  action: () => console.log("Clicked")
});

// Update tool
toolbar.updateTool("my-tool", {
  label: "Updated Label",
  disabled: true
});

// Remove tool
toolbar.removeTool("my-tool");
```

## Future Managers (Planned)

### DragManager
- Handle drag-and-drop functionality
- Manage drag state and boundaries
- Compact drag mode

### SnapManager
- Handle snapping to edges/corners
- Manage snap zones and hints
- Calculate snap positions

### ThemeManager
- Centralized theme management
- Theme persistence
- System preference detection

## Benefits of Modular Architecture

### 1. **Maintainability**
- Clear separation of concerns
- Easier to locate and fix bugs
- Reduced file size per module

### 2. **Testability**
- Each module can be tested independently
- Mocking is easier
- Better test coverage

### 3. **Extensibility**
- Easy to add new built-in tools
- Can replace managers with custom implementations
- Plugin system possible

### 4. **Reusability**
- Managers can be used in other contexts
- Built-in tools can be reused
- Base classes provide templates

### 5. **Code Organization**
- Logical folder structure
- Easy to navigate codebase
- Better developer experience

## Migration Guide

### Before (Monolithic)

```javascript
// All logic in Toolbar.js (~1500+ lines)
// Built-in tools hardcoded
// Difficult to extend
```

### After (Modular)

```javascript
// Toolbar.js (~1200 lines) - orchestration only
// Built-in tools in separate classes (~100 lines each)
// Easy to extend with new tools
// Managers handle specific domains

// Usage remains the same!
const toolbar = new Toolbar({
  builtInTools: { theme: true },
  builtInToolsConfig: { theme: { /* config */ } }
});
```

## Best Practices

1. **Use Managers**: Delegate specific functionality to managers
2. **Extend Base Classes**: Always extend `BaseBuiltInTool` for built-in tools
3. **Single Responsibility**: Each class should have one clear purpose
4. **Clean APIs**: Expose minimal public interface
5. **Documentation**: Document public methods and configuration options

## Examples

See `/src/assets/js/main.js` for complete usage examples.
