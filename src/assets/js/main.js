if (typeof window !== "undefined") {
  // ============================================================================
  // EXAMPLE 1: Basic Toolbar
  // ============================================================================

  const basicToolbar = new Toolbar({
    container: "#app",
    // container: document.body,
    position: "bottom-center",
    // theme: "light",
    theme: "dark",
    // draggable: true,
    tools: [
      {
        id: "undo",
        label: "Undo",
        icon: "navigation.rotate_left", // String path instead of icons object
        tooltip: "Undo last action",
        shortcut: "Ctrl+Z",
        action: (tool, e) => {
          console.log("Undo clicked", tool);
        },
      },
      {
        id: "redo",
        label: "Redo",
        icon: "navigation.rotate_right", // String path instead of icons object
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
        icon: "utils.settings", // String path instead of icons object
        tooltip: "Open settings",
        action: (tool, e) => {
          console.log("Settings clicked", tool);
        },
      },
    ],
  });

  window.basicToolbar = basicToolbar;
}
