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
    allowedSnapPositions: [
      // "top-left",
      // "top-center",
      // "top-right",
      "bottom-left",
      "bottom-center",
      "bottom-right",
      // "center-left",
      // "center",
      // "center-right",
    ],
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

      // --- THEME SWITCHER BUTTON ---
      {
        id: "theme-toggle",
        label: "Theme",
        icon: "utils.monitor",
        tooltip: "Theme: System",
        // CRITICAL: Force the active class in the definition
        customClass: "toolbar__tool--active",
        action: () => {
          const currentTheme = basicToolbar.getTheme();
          const currentIndex = THEME_CONFIG.order.indexOf(currentTheme);
          const nextIndex = (currentIndex + 1) % THEME_CONFIG.order.length;
          basicToolbar.setTheme(THEME_CONFIG.order[nextIndex]);
        },
      },
      // -----------------------------

      { type: "separator" },

      // This is a Toggle button. Clicking this triggers 'setActiveTool' logic
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
        id: "settings",
        label: "Settings",
        icon: "utils.settings",
        tooltip: "Settings",
        action: () => console.log("Settings"),
      },
    ],
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

    basicToolbar.updateTool("theme-toggle", {
      icon: newIcon,
      tooltip: `Theme: ${stateLabel}`,
      // Maintain the active class during updates
      customClass: "toolbar__tool--active",
    });
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
