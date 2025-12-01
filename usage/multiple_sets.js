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

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  const basicToolbar = new Toolbar({
    container: "#app",
    position: "bottom-center",
    theme: "system",
    showLabels: false,
    draggable: true,
    snapToPosition: true,
    allowedSnapPositions: ["bottom-left", "bottom-center", "bottom-right"],
    // Define multiple tool sets
    toolSets: [
      {
        name: "Editing Tools",
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
          { type: "separator" },
          {
            id: "next-set",
            label: "More",
            icon: "navigation.angle_right",
            tooltip: "Next tools",
            action: () => basicToolbar.nextToolSet(),
          },
        ],
      },
      {
        name: "View Tools",
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
            id: "toggle-labels",
            label: "Labels",
            icon: "utils.menu",
            tooltip: "Toggle labels",
            type: "toggle",
            action: () => {
              const newState = !basicToolbar.options.showLabels;
              basicToolbar.setShowLabels(newState);
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
          { type: "separator" },
          {
            id: "next-set-2",
            label: "More",
            icon: "navigation.angle_right",
            tooltip: "Next tools",
            action: () => basicToolbar.nextToolSet(),
          },
        ],
      },
      {
        name: "Settings Tools",
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
          { type: "separator" },
          {
            id: "back-to-first",
            label: "Back",
            icon: "navigation.angle_left",
            tooltip: "Back to editing tools",
            action: () => basicToolbar.switchToolSet(0),
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
        icon: newIcon,
        tooltip: `Theme: ${stateLabel}`,
        // Maintain the active class during updates
        customClass: "toolbar__tool--active",
      });
    }
  };

  // ============================================================================
  // ENFORCE "ALWAYS ACTIVE" STATE
  // ============================================================================

  // When other toggle buttons (like "Labels") are clicked, the Toolbar library
  // normally removes the active class from all other buttons.
  // We listen for this event and immediately re-apply the active class to our theme button.
  basicToolbar.on("tool:activate", () => {
    const themeBtn = basicToolbar.toolsContainer.querySelector(
      '[data-tool-id="theme-toggle"]'
    );
    if (themeBtn) {
      themeBtn.classList.add("toolbar__tool--active");
      themeBtn.setAttribute("aria-pressed", "true");
    }
  });

  // Listen for tool set changes
  basicToolbar.on("toolset:change", (data) => {
    console.log("Tool set changed:", data);
    // Re-initialize theme button visual state if switching to view tools
    updateThemeVisuals(basicToolbar.getTheme());
  });

  // ============================================================================
  // STARTUP
  // ============================================================================

  // Initialize button state
  updateThemeVisuals(basicToolbar.getTheme());

  // Initialize labels toggle state if needed
  if (basicToolbar.options.showLabels) {
    basicToolbar.setActiveTool("toggle-labels");
  }
}
