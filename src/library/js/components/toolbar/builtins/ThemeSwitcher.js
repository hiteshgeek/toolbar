/**
 * ThemeSwitcher - Built-in tool for switching themes
 */
import BaseBuiltInTool from "./BaseBuiltInTool.js";

export default class ThemeSwitcher extends BaseBuiltInTool {
  constructor(toolbar, config = {}) {
    super(toolbar, config);

    // Theme icon map
    this.icons = {
      light: config.iconLight || "utils.sun",
      dark: config.iconDark || "utils.moon",
      system: config.iconSystem || "utils.monitor",
    };

    // Theme label map
    this.labels = {
      light: config.labelLight || "Light",
      dark: config.labelDark || "Dark",
      system: config.labelSystem || "System",
    };

    // Get available themes from toolbar options
    this.themes = this.toolbar.options.themes || ["light", "dark", "system"];
  }

  /**
   * Get the default tool ID
   * @returns {string}
   */
  getDefaultId() {
    return "__builtin-theme-switcher";
  }

  /**
   * Get the current theme state
   * @returns {string}
   */
  getCurrentState() {
    return this.toolbar.options.theme;
  }

  /**
   * Get the icon for a given theme
   * @param {string} theme - Theme name
   * @returns {string}
   */
  getIcon(theme) {
    return this.icons[theme] || this.icons.system;
  }

  /**
   * Get the label for a given theme
   * @param {string} theme - Theme name
   * @returns {string}
   */
  getLabel(theme) {
    return this.labels[theme] || "Theme";
  }

  /**
   * Get the tooltip for a given theme
   * @param {string} theme - Theme name
   * @returns {string}
   */
  getTooltip(theme) {
    if (this.config.tooltip) {
      return this.config.tooltip;
    }
    return `Theme: ${this.getLabel(theme)}`;
  }

  /**
   * Handle theme switcher action
   */
  handleAction() {
    // Cycle through available themes
    const currentTheme = this.toolbar.options.theme;
    const currentIndex = this.themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    const nextTheme = this.themes[nextIndex];

    // Update theme
    this.toolbar.setTheme(nextTheme);

    // Update visuals
    this.updateVisuals();
  }

  /**
   * Register the tool and set up event listeners
   * @returns {string} Tool ID
   */
  register() {
    const toolId = super.register();

    // Listen for theme changes from external sources
    this.toolbar.on("theme:change", () => {
      this.updateVisuals();
    });

    return toolId;
  }
}
