/**
 * DisplayModeSwitcher - Built-in tool for switching display modes
 */
import BaseBuiltInTool from "./BaseBuiltInTool.js";

export default class DisplayModeSwitcher extends BaseBuiltInTool {
  constructor(toolbar, config = {}) {
    super(toolbar, config);

    // Display mode icon map
    this.icons = {
      icon: config.iconIcon || "utils.menu",
      label: config.iconLabel || "utils.menu",
      both: config.iconBoth || "utils.menu",
    };

    // Display mode label map
    this.labels = {
      icon: config.labelIcon || "Icons Only",
      label: config.labelLabel || "Labels Only",
      both: config.labelBoth || "Icons & Labels",
    };

    // Display modes order for cycling
    this.modes = ["icon", "both", "label"];
  }

  /**
   * Get the default tool ID
   * @returns {string}
   */
  getDefaultId() {
    return "__builtin-display-mode-switcher";
  }

  /**
   * Get the current display mode state
   * @returns {string}
   */
  getCurrentState() {
    return this.toolbar.options.displayMode;
  }

  /**
   * Get the icon for a given display mode
   * @param {string} mode - Display mode
   * @returns {string}
   */
  getIcon(mode) {
    return this.icons[mode] || this.icons.both;
  }

  /**
   * Get the label for a given display mode
   * @param {string} mode - Display mode
   * @returns {string}
   */
  getLabel(mode) {
    return this.labels[mode] || "Display";
  }

  /**
   * Get the tooltip for a given display mode
   * @param {string} mode - Display mode
   * @returns {string}
   */
  getTooltip(mode) {
    if (this.config.tooltip) {
      return this.config.tooltip;
    }
    return `Display: ${this.getLabel(mode)}`;
  }

  /**
   * Handle display mode switcher action
   */
  handleAction() {
    // Cycle to next display mode
    this.toolbar.nextDisplayMode();

    // Update visuals
    this.updateVisuals();
  }

  /**
   * Register the tool and set up event listeners
   * @returns {string} Tool ID
   */
  register() {
    const toolId = super.register();

    // Listen for display mode changes from external sources
    this.toolbar.on("displayMode:change", () => {
      this.updateVisuals();
    });

    return toolId;
  }
}
