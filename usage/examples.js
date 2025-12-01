/**
 * Toolbar Usage Example
 * Demonstrates various ways to use the Toolbar component
 */

import Toolbar from "./Toolbar.js";

// ============================================================================
// EXAMPLE 1: Basic Toolbar
// ============================================================================

const basicToolbar = new Toolbar({
  container: "#app",
  position: "top",
  theme: "light",
  tools: [
    {
      id: "undo",
      label: "Undo",
      icon: "navigation.rotate_left",
      tooltip: "Undo last action",
      shortcut: "Ctrl+Z",
      action: (tool, e) => {
        console.log("Undo clicked", tool);
      },
    },
    {
      id: "redo",
      label: "Redo",
      icon: "navigation.rotate_right",
      tooltip: "Redo action",
      shortcut: "Ctrl+Y",
      action: (tool, e) => {
        console.log("Redo clicked", tool);
      },
    },
    { type: "separator" },
    {
      id: "settings",
      label: "Settings",
      icon: "utils.settings",
      tooltip: "Open settings",
      action: (tool, e) => {
        console.log("Settings clicked", tool);
      },
    },
  ],
});

// ============================================================================
// EXAMPLE 2: Toolbar with Groups
// ============================================================================

const groupedToolbar = new Toolbar({
  container: "#toolbar-container",
  position: "top",
  theme: "dark",
  showLabels: true,
  groups: [
    {
      id: "file",
      label: "File",
      tools: [
        {
          id: "new",
          label: "New",
          icon: "utils.toolbox",
          tooltip: "Create new file",
          action: () => console.log("New file"),
        },
        {
          id: "save",
          label: "Save",
          icon: "utils.settings",
          tooltip: "Save file",
          shortcut: "Ctrl+S",
          action: () => console.log("Save file"),
        },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      tools: [
        {
          id: "cut",
          label: "Cut",
          icon: "utils.wrench",
          tooltip: "Cut selection",
          action: () => console.log("Cut"),
        },
        {
          id: "copy",
          label: "Copy",
          icon: "utils.tools",
          tooltip: "Copy selection",
          action: () => console.log("Copy"),
        },
        {
          id: "paste",
          label: "Paste",
          icon: "utils.toolbox",
          tooltip: "Paste from clipboard",
          action: () => console.log("Paste"),
        },
      ],
    },
  ],
});

// ============================================================================
// EXAMPLE 3: Image Editor Toolbar
// ============================================================================

const imageEditorToolbar = new Toolbar({
  container: "#image-editor",
  position: "left",
  orientation: "vertical",
  theme: "light",
  collapsible: true,
  iconSize: "large",
  showLabels: false,
  tools: [
    {
      id: "select",
      type: "radio",
      icon: "navigation.angle_up",
      tooltip: "Selection Tool",
      action: function (tool) {
        this.setActiveTool(tool.id);
        console.log("Select tool activated");
      },
    },
    {
      id: "brush",
      type: "radio",
      icon: "utils.wrench",
      tooltip: "Brush Tool",
      action: function (tool) {
        this.setActiveTool(tool.id);
        console.log("Brush tool activated");
      },
    },
    {
      id: "eraser",
      type: "radio",
      icon: "utils.close",
      tooltip: "Eraser Tool",
      action: function (tool) {
        this.setActiveTool(tool.id);
        console.log("Eraser tool activated");
      },
    },
    { type: "separator" },
    {
      id: "rotate-left",
      icon: "navigation.rotate_left",
      tooltip: "Rotate Left 90°",
      action: () => console.log("Rotate left"),
    },
    {
      id: "rotate-right",
      icon: "navigation.rotate_right",
      tooltip: "Rotate Right 90°",
      action: () => console.log("Rotate right"),
    },
  ],
});

// Set default active tool
imageEditorToolbar.setActiveTool("select");

// ============================================================================
// EXAMPLE 4: Video Editor Toolbar
// ============================================================================

const videoEditorToolbar = new Toolbar({
  container: "#video-editor",
  position: "bottom",
  theme: "dark",
  draggable: false,
  groups: [
    {
      id: "playback",
      label: "Playback",
      tools: [
        {
          id: "play",
          icon: "navigation.forward",
          tooltip: "Play/Pause",
          shortcut: "Space",
          action: () => console.log("Play/Pause"),
        },
        {
          id: "stop",
          icon: "utils.close",
          tooltip: "Stop",
          action: () => console.log("Stop"),
        },
        {
          id: "skip-back",
          icon: "navigation.back",
          tooltip: "Skip Backward",
          action: () => console.log("Skip back"),
        },
        {
          id: "skip-forward",
          icon: "navigation.forward",
          tooltip: "Skip Forward",
          action: () => console.log("Skip forward"),
        },
      ],
    },
    {
      id: "editing",
      label: "Edit",
      tools: [
        {
          id: "split",
          icon: "utils.wrench",
          tooltip: "Split Clip",
          action: () => console.log("Split clip"),
        },
        {
          id: "trim",
          icon: "utils.tools",
          tooltip: "Trim",
          action: () => console.log("Trim"),
        },
      ],
    },
  ],
});

// ============================================================================
// EXAMPLE 5: Floating Toolbar with Dynamic Tools
// ============================================================================

const floatingToolbar = new Toolbar({
  container: document.body,
  position: "floating",
  draggable: true,
  collapsible: true,
  theme: "light",
  iconSize: "medium",
  tools: [],
});

// Dynamically add tools
floatingToolbar.addTool({
  id: "zoom-in",
  icon: "navigation.up",
  tooltip: "Zoom In",
  action: () => console.log("Zoom in"),
});

floatingToolbar.addTool({
  id: "zoom-out",
  icon: "navigation.down",
  tooltip: "Zoom Out",
  action: () => console.log("Zoom out"),
});

floatingToolbar.addTool({
  id: "zoom-fit",
  label: "Fit",
  icon: "utils.toolbox",
  tooltip: "Fit to Screen",
  action: () => console.log("Fit to screen"),
});

// ============================================================================
// EXAMPLE 6: Event Handling
// ============================================================================

const eventToolbar = new Toolbar({
  container: "#event-example",
  tools: [
    { id: "tool1", label: "Tool 1", icon: "utils.wrench" },
    { id: "tool2", label: "Tool 2", icon: "utils.tools" },
    { id: "tool3", label: "Tool 3", icon: "utils.settings" },
  ],
  onToolClick: (tool, event) => {
    console.log("Tool clicked via callback:", tool.id);
  },
});

// Subscribe to events
eventToolbar.on("tool:click", ({ tool, event }) => {
  console.log("Tool clicked via event:", tool.id);
});

eventToolbar.on("tool:activate", ({ toolId, previousToolId }) => {
  console.log(`Tool activated: ${toolId}, previous: ${previousToolId}`);
});

eventToolbar.on("toolbar:collapse", ({ collapsed }) => {
  console.log("Toolbar collapsed state:", collapsed);
});

// ============================================================================
// EXAMPLE 7: Programmatic Control
// ============================================================================

const controlToolbar = new Toolbar({
  container: "#control-example",
  tools: [
    { id: "item1", label: "Item 1", icon: "utils.wrench" },
    { id: "item2", label: "Item 2", icon: "utils.tools", badge: "3" },
    {
      id: "item3",
      label: "Item 3",
      icon: "utils.settings",
      disabled: true,
    },
  ],
});

// Update tool dynamically
setTimeout(() => {
  controlToolbar.updateTool("item2", {
    badge: "5",
    disabled: false,
  });
}, 2000);

// Remove a tool
setTimeout(() => {
  controlToolbar.removeTool("item3");
}, 4000);

// Add new tool
setTimeout(() => {
  controlToolbar.addTool({
    id: "item4",
    label: "New Tool",
    icon: "utils.toolbox",
    tooltip: "Newly added tool",
  });
}, 6000);

// Get active tool
console.log("Current active tool:", controlToolbar.getActiveTool());

// Show/hide toolbar
setTimeout(() => {
  controlToolbar.hide();
  setTimeout(() => controlToolbar.show(), 2000);
}, 8000);

// ============================================================================
// EXAMPLE 8: Integration with Application State
// ============================================================================

class Application {
  constructor() {
    this.state = {
      currentTool: "select",
      zoomLevel: 100,
      canUndo: false,
      canRedo: false,
    };

    this.toolbar = new Toolbar({
      container: "#app-toolbar",
      tools: [
        {
          id: "undo",
          icon: "navigation.rotate_left",
          tooltip: "Undo",
          disabled: !this.state.canUndo,
          action: () => this.undo(),
        },
        {
          id: "redo",
          icon: "navigation.rotate_right",
          tooltip: "Redo",
          disabled: !this.state.canRedo,
          action: () => this.redo(),
        },
        { type: "separator" },
        {
          id: "select",
          type: "radio",
          icon: "navigation.angle_up",
          tooltip: "Select Tool",
          action: () => this.changeTool("select"),
        },
        {
          id: "draw",
          type: "radio",
          icon: "utils.wrench",
          tooltip: "Draw Tool",
          action: () => this.changeTool("draw"),
        },
      ],
    });

    this.toolbar.setActiveTool(this.state.currentTool);
  }

  changeTool(toolId) {
    this.state.currentTool = toolId;
    this.toolbar.setActiveTool(toolId);
    console.log("Tool changed to:", toolId);
  }

  undo() {
    console.log("Undo action");
    this.updateUndoRedoState();
  }

  redo() {
    console.log("Redo action");
    this.updateUndoRedoState();
  }

  updateUndoRedoState() {
    this.toolbar.updateTool("undo", { disabled: !this.state.canUndo });
    this.toolbar.updateTool("redo", { disabled: !this.state.canRedo });
  }
}

// Initialize application
// const app = new Application();

// ============================================================================
// EXAMPLE 9: Custom Styling
// ============================================================================

const customStyledToolbar = new Toolbar({
  container: "#custom-styled",
  customClass: "my-custom-toolbar",
  theme: "dark",
  tools: [
    {
      id: "custom1",
      label: "Custom",
      icon: "utils.settings",
      customClass: "my-custom-tool",
    },
  ],
});

// Add custom CSS variables
document.documentElement.style.setProperty("--toolbar-active", "#ff5722");
document.documentElement.style.setProperty("--toolbar-active-bg", "#ffe0db");

// ============================================================================
// EXAMPLE 10: Using Direct SVG Strings (Alternative)
// ============================================================================

const customIconToolbar = new Toolbar({
  container: "#custom-icons",
  tools: [
    {
      id: "custom-svg",
      label: "Custom SVG",
      // You can also pass direct SVG strings if needed
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/></svg>',
      tooltip: "Custom SVG Icon",
      action: () => console.log("Custom SVG clicked"),
    },
    {
      id: "from-icon-set",
      label: "From Icon Set",
      // Or use the string path to the icon set
      icon: "utils.settings",
      tooltip: "Icon from Set",
      action: () => console.log("Icon set clicked"),
    },
  ],
});

// ============================================================================
// EXAMPLE 11: Cleanup
// ============================================================================

// When you need to remove the toolbar
function cleanup() {
  basicToolbar.destroy();
  groupedToolbar.destroy();
  imageEditorToolbar.destroy();
  // ... destroy other instances
}

// Export for use in other modules
export {
  basicToolbar,
  groupedToolbar,
  imageEditorToolbar,
  videoEditorToolbar,
  floatingToolbar,
};
