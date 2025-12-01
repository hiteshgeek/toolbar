if (typeof window !== "undefined") {
  // ============================================================================
  // CONFIGURATION
  // ============================================================================

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

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  const basicToolbar = new Toolbar({
    container: "#app",
    size: "medium", //small, medium, large
    position: "bottom-center",
    theme: "system",
    showLabels: "icon", // "icon", "label", or "both"
    draggable: true,
    snapToPosition: true,
    allowedSnapPositions: ["bottom-left", "bottom-center", "bottom-right"],
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
            id: "toggle-labels",
            label: "Labels",
            icon: "utils.menu",
            tooltip: "Labels: Icons Only",
            customClass: "toolbar__tool--active",
            action: () => {
              basicToolbar.nextShowLabelsMode();
            },
          },
          { type: "separator" },
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
    onThemeChange: (theme) => {
      // Update visual state when theme changes
      updateThemeVisuals(theme);
    },
    onSizeChange: (size) => {
      // Update visual state when size changes
      updateSizeVisuals(size);
    },
  });

  // Listen for label mode changes
  basicToolbar.on("labels:change", (data) => {
    updateLabelModeVisuals(data.showLabels);
  });

  window.basicToolbar = basicToolbar;

  // ============================================================================
  // LOGIC HANDLERS
  // ============================================================================

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
        // Maintain the active class during updates
        customClass: "toolbar__tool--active",
      });
    }
  };

  const updateSizeVisuals = (size) => {
    const stateLabel = SIZE_CONFIG.labels[size];

    // Only update if size toggle exists in current tool set
    const sizeTool = basicToolbar.tools.get("size-toggle");
    if (sizeTool) {
      basicToolbar.updateTool("size-toggle", {
        tooltip: `Size: ${stateLabel}`,
        // Maintain the active class during updates
        customClass: "toolbar__tool--active",
      });
    }
  };

  const updateLabelModeVisuals = (mode) => {
    const stateLabel = LABEL_MODE_CONFIG.labels[mode];
    const newIcon = LABEL_MODE_CONFIG.icons[mode];

    // Only update if labels toggle exists in current tool set
    const labelsTool = basicToolbar.tools.get("toggle-labels");
    if (labelsTool) {
      basicToolbar.updateTool("toggle-labels", {
        label: stateLabel,
        icon: newIcon,
        tooltip: `Labels: ${stateLabel}`,
        // Maintain the active class during updates
        customClass: "toolbar__tool--active",
      });
    }
  };

  // ============================================================================
  // ENFORCE "ALWAYS ACTIVE" STATE
  // ============================================================================

  // When other toggle buttons are clicked, the Toolbar library
  // normally removes the active class from all other buttons.
  // We listen for this event and immediately re-apply the active class to our control buttons.
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

    const labelsBtn = basicToolbar.toolsContainer.querySelector(
      '[data-tool-id="toggle-labels"]'
    );
    if (labelsBtn) {
      labelsBtn.classList.add("toolbar__tool--active");
      labelsBtn.setAttribute("aria-pressed", "true");
    }
  });

  // Listen for tool set changes
  basicToolbar.on("toolset:change", (data) => {
    console.log("Tool set changed:", data);
    // Re-initialize button visual states when switching tool sets
    updateThemeVisuals(basicToolbar.getTheme());
    updateSizeVisuals(basicToolbar.getSize());
    updateLabelModeVisuals(basicToolbar.getShowLabels());
  });

  // ============================================================================
  // STARTUP
  // ============================================================================

  // Initialize button states
  updateThemeVisuals(basicToolbar.getTheme());
  updateSizeVisuals(basicToolbar.getSize());
  updateLabelModeVisuals(basicToolbar.getShowLabels());
}
