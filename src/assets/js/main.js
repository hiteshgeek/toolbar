if (typeof window !== "undefined") {
  // ============================================================================
  // CUSTOMIZE PRIMARY COLOR (Optional)
  // ============================================================================
  // You can customize the primary color by setting the CSS custom property
  // document.documentElement.style.setProperty('--toolbar-primary-color', '#3498db');

  // ============================================================================
  // EXAMPLE 1: Basic Toolbar with Dynamic Theme Switching
  // ============================================================================

  const basicToolbar = new Toolbar({
    container: "#app",
    // container: document.body,
    position: "bottom-center",
    // Theme options: 'light', 'dark', or 'system' (follows OS preference)
    theme: "system", // Default to system preference
    // draggable: true,
    showLabels: false,
    onThemeChange: (theme, isSystemTriggered) => {
      console.log(
        `Theme changed to: ${theme}${
          isSystemTriggered ? " (system triggered)" : ""
        }`
      );
      console.log(`Effective theme: ${basicToolbar.getEffectiveTheme()}`);

      // Update active state for theme buttons
      updateActiveThemeButton(theme);
    },
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
        id: "theme-light",
        label: "Light",
        icon: "utils.sun",
        tooltip: "Switch to light mode",
        action: () => {
          basicToolbar.setTheme("light");
        },
      },
      {
        id: "theme-dark",
        label: "Dark",
        icon: "utils.moon",
        tooltip: "Switch to dark mode",
        action: () => {
          basicToolbar.setTheme("dark");
        },
      },
      {
        id: "theme-system",
        label: "System",
        icon: "utils.monitor",
        tooltip: "Follow system theme",
        action: () => {
          basicToolbar.setTheme("system");
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
          console.log(`Labels ${newState ? "shown" : "hidden"}`);
        },
      },
      {
        id: "settings",
        label: "Settings",
        icon: "utils.settings",
        tooltip: "Open settings",
        action: (tool, e) => {
          console.log("Settings clicked", tool);
          console.log(`Current theme: ${basicToolbar.getTheme()}`);
          console.log(`Effective theme: ${basicToolbar.getEffectiveTheme()}`);
        },
      },
    ],
  });

  // Listen for theme changes
  basicToolbar.on("theme:change", (data) => {
    console.log("Theme change event:", data);
  });

  basicToolbar.on("theme:system-change", (data) => {
    console.log("System theme changed:", data);
  });

  basicToolbar.on("labels:change", (data) => {
    console.log("Labels changed:", data);
    // Restore theme button active state after label toggle
    updateActiveThemeButton(basicToolbar.getTheme());
  });

  window.basicToolbar = basicToolbar;

  // Helper function to update active state of theme buttons
  function updateActiveThemeButton(theme) {
    // Map theme to corresponding tool ID
    const themeToolMap = {
      light: "theme-light",
      dark: "theme-dark",
      system: "theme-system",
    };

    // Use toolbar's container to ensure we're searching in the right scope
    const toolsContainer = basicToolbar.toolsContainer;

    // Remove active state from all theme buttons
    Object.values(themeToolMap).forEach((id) => {
      const button = toolsContainer.querySelector(`[data-tool-id="${id}"]`);
      if (button) {
        button.classList.remove("toolbar__tool--active");
        button.setAttribute("aria-pressed", "false");
      }
    });

    // Set active state for the current theme button
    const toolId = themeToolMap[theme];
    if (toolId) {
      const button = toolsContainer.querySelector(`[data-tool-id="${toolId}"]`);
      if (button) {
        button.classList.add("toolbar__tool--active");
        button.setAttribute("aria-pressed", "true");
      }
      // Update the internal state
      basicToolbar.state.activeTool = toolId;
    }
  }

  // Set initial active state based on current theme
  updateActiveThemeButton(basicToolbar.getTheme());

  // Set initial active state for labels toggle based on showLabels
  if (basicToolbar.options.showLabels) {
    const toggleButton = basicToolbar.toolsContainer.querySelector('[data-tool-id="toggle-labels"]');
    if (toggleButton) {
      toggleButton.classList.add("toolbar__tool--active");
      toggleButton.setAttribute("aria-pressed", "true");
    }
  }

  // Log initial theme state
  console.log(`Initial theme: ${basicToolbar.getTheme()}`);
  console.log(`Initial effective theme: ${basicToolbar.getEffectiveTheme()}`);
}
