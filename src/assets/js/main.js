if (typeof window !== "undefined") {
  // ============================================================================
  // CONFIGURATION (No longer needed - built-in tools handle this automatically)
  // ============================================================================

  /* Kept for reference - these configs were used for manual tool implementations
  const THEME_CONFIG = {
    order: ["system", "light", "dark"],
    icons: {
      system: "utils.monitor",
      light: "utils.sun",
      dark: "utils.moon",
    },
    labels: {
      system: "System Preference",
      light: "Light Mode",
      dark: "Dark Mode",
    },
  };

  const SIZE_CONFIG = {
    order: ["small", "medium", "large"],
    labels: {
      small: "Small",
      medium: "Medium",
      large: "Large",
    },
  };

  const LABEL_MODE_CONFIG = {
    order: ["icon", "both", "label"],
    icons: {
      icon: "utils.menu",
      both: "utils.menu",
      label: "utils.menu",
    },
    labels: {
      icon: "Icons Only",
      both: "Icons & Labels",
      label: "Labels Only",
    },
  };
  */

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  const basicToolbar = new Toolbar({
    container: "#app",
    size: "medium", //small, medium, large
    position: "bottom-center",
    orientation: "horizontal", // "horizontal" or "vertical"
    theme: "system",
    displayMode: "icon", // "icon", "label", or "both"
    draggable: true,
    snapToPosition: true,
    allowedSnapPositions: ["bottom-left", "bottom-center", "bottom-right"],
    // Built-in tools configuration (enabled by default)
    builtInTools: {
      theme: true, // Enable theme switcher
      displayMode: true, // Enable display mode switcher
      size: true, // Enable size changer
    },
    // Optional: Customize built-in tools
    builtInToolsConfig: {
      theme: {
        // id: "custom-theme-switcher", // Optional custom ID
        // tooltip: "Change theme", // Optional custom tooltip
        // forceDisplayMode: "icon", // Optional force display mode
        // Custom icons (optional)
        iconLight: "utils.sun",
        iconDark: "utils.moon",
        iconSystem: "utils.monitor",
        // Custom labels (optional)
        labelLight: "Light",
        labelDark: "Dark",
        labelSystem: "System",
      },
      displayMode: {
        // Custom configuration for display mode switcher (optional)
      },
      size: {
        // Custom configuration for size changer (optional)
      },
    },
    // Available themes (default: ["light", "dark", "system"])
    themes: ["light", "dark", "system"],
    // Define multiple tool sets
    toolSets: [
      {
        name: "Editing Tools",
        navigationButton: {
          label: "View",
          icon: "navigation.angle_right",
          tooltip: "Switch to view tools",
          targetSet: "next", // Can be "next", "previous", or a specific index like 1
        },
        tools: [
          {
            id: "undo",
            label: "Undo",
            icon: "navigation.rotate_left",
            tooltip: "Undo",
            shortcut: "Ctrl+Z",
            action: () => console.log("Undo"),
          },
          {
            id: "redo",
            label: "Redo",
            icon: "navigation.rotate_right",
            tooltip: "Redo",
            shortcut: "Ctrl+Y",
            action: () => console.log("Redo"),
          },
          { type: "separator" },
          {
            id: "cut",
            label: "Cut",
            icon: "edit.scissors",
            tooltip: "Cut",
            shortcut: "Ctrl+X",
            action: () => console.log("Cut"),
          },
          {
            id: "copy",
            label: "Copy",
            icon: "edit.copy",
            tooltip: "Copy",
            shortcut: "Ctrl+C",
            action: () => console.log("Copy"),
          },
          {
            id: "paste",
            label: "Paste",
            icon: "edit.clipboard",
            tooltip: "Paste",
            shortcut: "Ctrl+V",
            action: () => console.log("Paste"),
          },
        ],
      },
      {
        name: "View Tools",
        navigationButton: {
          label: "Settings",
          icon: "utils.settings",
          tooltip: "Go to settings",
          targetSet: "next", // Go to specific set index
        },
        tools: [
          // NOTE: Theme, Size, and Display Mode switchers are now built-in tools!
          // They are automatically added by the toolbar when builtInTools options are enabled.
          // The code below shows how they were manually implemented before.
          // You can still customize them using builtInToolsConfig option (see initialization above).

          /* MANUAL IMPLEMENTATION (No longer needed - kept for reference)
          {
            id: "theme-toggle",
            label: "Theme",
            icon: "utils.monitor",
            tooltip: "Theme: System",
            customClass: "toolbar__tool--active",
            action: () => {
              const currentTheme = basicToolbar.getTheme();
              const currentIndex = THEME_CONFIG.order.indexOf(currentTheme);
              const nextIndex = (currentIndex + 1) % THEME_CONFIG.order.length;
              basicToolbar.setTheme(THEME_CONFIG.order[nextIndex]);
            },
          },
          { type: "separator" },
          {
            id: "size-toggle",
            label: "Size",
            icon: "edit.plus",
            tooltip: "Size: Medium",
            customClass: "toolbar__tool--active",
            action: () => {
              basicToolbar.nextSize();
            },
          },
          { type: "separator" },
          {
            id: "toggle-display-mode",
            label: "Display",
            icon: "utils.menu",
            tooltip: "Display: Icons Only",
            customClass: "toolbar__tool--active",
            action: () => {
              basicToolbar.nextDisplayMode();
            },
          },
          { type: "separator" },
          */

          // Other example tools
          {
            id: "zoom-in",
            label: "Zoom In",
            icon: "navigation.plus",
            tooltip: "Zoom in",
            action: () => console.log("Zoom in"),
          },
          {
            id: "zoom-out",
            label: "Zoom Out",
            icon: "navigation.minus",
            tooltip: "Zoom out",
            action: () => console.log("Zoom out"),
          },
          { type: "separator" },
          {
            id: "toggle-orientation",
            label: "Toggle Layout",
            icon: "utils.columns",
            tooltip: "Toggle Horizontal/Vertical",
            action: () => {
              basicToolbar.toggleOrientation();
              const newOrientation = basicToolbar.getOrientation();
              console.log("Orientation toggled to:", newOrientation);
            },
          },
          { type: "separator" },
          {
            id: "icon-only-demo",
            label: "Help",
            icon: "navigation.circle_question",
            tooltip: "Help (Always Icon Only)",
            forceDisplayMode: "icon",
            action: () => console.log("Help"),
          },
          {
            id: "label-only-demo",
            label: "Shortcuts",
            icon: "utils.menu",
            tooltip: "Keyboard Shortcuts (Always Label Only)",
            forceDisplayMode: "label",
            action: () => console.log("Shortcuts"),
          },
        ],
      },
      {
        name: "Settings Tools",
        navigationButton: {
          label: "Edit",
          icon: "navigation.angle_left",
          tooltip: "Back to editing tools",
          targetSet: "next", // Go back to first set
        },
        tools: [
          {
            id: "settings",
            label: "Settings",
            icon: "utils.settings",
            tooltip: "Settings",
            action: () => console.log("Settings"),
          },
          {
            id: "help",
            label: "Help",
            icon: "navigation.circle_question",
            tooltip: "Help",
            action: () => console.log("Help"),
          },
          {
            id: "info",
            label: "Info",
            icon: "navigation.circle_info",
            tooltip: "Info",
            action: () => console.log("Info"),
          },
        ],
      },
    ],
    defaultToolSet: 0,
    showSetIndicator: true,
    onToolSetChange: (setIndex, currentSet) => {
      console.log(`Switched to tool set ${setIndex}:`, currentSet.name);
    },
    // Optional: Add custom callbacks (built-in tools handle their own updates)
    onThemeChange: (theme, isSystemChange) => {
      console.log("Theme changed to:", theme, "System change:", isSystemChange);
      // Save to localStorage or perform other custom actions
      localStorage.setItem("toolbarTheme", theme);
    },
    onSizeChange: (size) => {
      console.log("Size changed to:", size);
      // Save to localStorage or perform other custom actions
      localStorage.setItem("toolbarSize", size);
    },
  });

  // Listen for display mode changes (optional - for custom behavior)
  basicToolbar.on("displayMode:change", (data) => {
    console.log("Display mode changed to:", data.displayMode);
    // Save to localStorage or perform other custom actions
    localStorage.setItem("toolbarDisplayMode", data.displayMode);
  });

  // Listen for orientation changes (optional - for custom behavior)
  basicToolbar.on("orientation:change", (data) => {
    console.log("Orientation changed to:", data.orientation);
    console.log("Previous orientation:", data.previousOrientation);
    // Save to localStorage or perform other custom actions
    localStorage.setItem("toolbarOrientation", data.orientation);
  });

  window.basicToolbar = basicToolbar;

  // ============================================================================
  // LOGIC HANDLERS (For manual implementation - not needed with built-in tools)
  // ============================================================================

  /* NO LONGER NEEDED - Built-in tools handle their own updates
  const updateThemeVisuals = (theme) => {
    const newIcon = THEME_CONFIG.icons[theme];
    const stateLabel = THEME_CONFIG.labels[theme];

    // Only update if theme toggle exists in current tool set
    const themeTool = basicToolbar.tools.get("theme-toggle");
    if (themeTool) {
      basicToolbar.updateTool("theme-toggle", {
        label: stateLabel,
        icon: newIcon,
        tooltip: `Theme: ${stateLabel}`,
        customClass: "toolbar__tool--active",
      });
    }
  };

  const updateSizeVisuals = (size) => {
    const stateLabel = SIZE_CONFIG.labels[size];

    const sizeTool = basicToolbar.tools.get("size-toggle");
    if (sizeTool) {
      basicToolbar.updateTool("size-toggle", {
        tooltip: `Size: ${stateLabel}`,
        customClass: "toolbar__tool--active",
      });
    }
  };

  const updateDisplayModeVisuals = (mode) => {
    const stateLabel = LABEL_MODE_CONFIG.labels[mode];
    const newIcon = LABEL_MODE_CONFIG.icons[mode];

    const displayTool = basicToolbar.tools.get("toggle-display-mode");
    if (displayTool) {
      basicToolbar.updateTool("toggle-display-mode", {
        label: stateLabel,
        icon: newIcon,
        tooltip: `Display: ${stateLabel}`,
        customClass: "toolbar__tool--active",
      });
    }
  };

  // ENFORCE "ALWAYS ACTIVE" STATE
  basicToolbar.on("tool:activate", () => {
    const themeBtn = basicToolbar.toolsContainer.querySelector(
      '[data-tool-id="theme-toggle"]'
    );
    if (themeBtn) {
      themeBtn.classList.add("toolbar__tool--active");
      themeBtn.setAttribute("aria-pressed", "true");
    }

    const sizeBtn = basicToolbar.toolsContainer.querySelector(
      '[data-tool-id="size-toggle"]'
    );
    if (sizeBtn) {
      sizeBtn.classList.add("toolbar__tool--active");
      sizeBtn.setAttribute("aria-pressed", "true");
    }

    const displayBtn = basicToolbar.toolsContainer.querySelector(
      '[data-tool-id="toggle-display-mode"]'
    );
    if (displayBtn) {
      displayBtn.classList.add("toolbar__tool--active");
      displayBtn.setAttribute("aria-pressed", "true");
    }
  });
  */

  // Listen for tool set changes
  basicToolbar.on("toolset:change", (data) => {
    console.log("Tool set changed:", data);
    // Built-in tools automatically update themselves when tool sets change
    // No manual visual updates needed anymore!
  });

  // ============================================================================
  // ADDITIONAL EXAMPLES
  // ============================================================================

  // Example: Create a toolbar with built-in tools disabled
  /*
  const minimalToolbar = new Toolbar({
    container: "#app",
    displayMode: "icon",
    size: "medium",
    // Disable all built-in tools
    builtInTools: {
      theme: false,
      displayMode: false,
      size: false,
    },
    tools: [
      {
        id: "custom-tool",
        label: "Custom Tool",
        icon: "navigation.search",
        action: () => console.log("Custom tool clicked"),
      },
    ],
  });
  */

  // Example: Disable only specific built-in tools
  /*
  const partialToolbar = new Toolbar({
    container: "#app",
    // Enable only theme switcher
    builtInTools: {
      theme: true,
      displayMode: false, // Disable display mode switcher
      size: false, // Disable size changer
    },
  });
  */

  // Example: Vertical toolbar
  /*
  const verticalToolbar = new Toolbar({
    container: "#app",
    orientation: "vertical", // Vertical layout
    position: "center-left",
    displayMode: "icon",
    size: "medium",
    draggable: true,
    tools: [
      { id: "tool1", icon: "navigation.search", action: () => {} },
      { id: "tool2", icon: "navigation.settings", action: () => {} },
    ],
  });
  */

  // Example: Toggle orientation programmatically
  /*
  // Toggle between horizontal and vertical
  toolbar.toggleOrientation();

  // Set specific orientation
  toolbar.setOrientation("vertical");

  // Get current orientation
  const currentOrientation = toolbar.getOrientation();
  console.log(currentOrientation); // "horizontal" or "vertical"
  */
}
