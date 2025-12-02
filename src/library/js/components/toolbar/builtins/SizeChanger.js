/**
 * SizeChanger - Built-in tool for changing toolbar size
 */
import BaseBuiltInTool from "./BaseBuiltInTool.js";

export default class SizeChanger extends BaseBuiltInTool {
  constructor(toolbar, config = {}) {
    super(toolbar, config);

    // Size icon map
    this.icons = {
      small: config.iconSmall || "edit.minus",
      medium: config.iconMedium || "edit.equals",
      large: config.iconLarge || "edit.plus",
    };

    // Size label map
    this.labels = {
      small: config.labelSmall || "Small",
      medium: config.labelMedium || "Medium",
      large: config.labelLarge || "Large",
    };

    // Sizes order for cycling
    this.sizes = ["small", "medium", "large"];
  }

  /**
   * Get the default tool ID
   * @returns {string}
   */
  getDefaultId() {
    return "__builtin-size-changer";
  }

  /**
   * Get the current size state
   * @returns {string}
   */
  getCurrentState() {
    return this.toolbar.options.size;
  }

  /**
   * Get the icon for a given size
   * @param {string} size - Size
   * @returns {string}
   */
  getIcon(size) {
    return this.icons[size] || this.icons.medium;
  }

  /**
   * Get the label for a given size
   * @param {string} size - Size
   * @returns {string}
   */
  getLabel(size) {
    return this.labels[size] || "Size";
  }

  /**
   * Get the tooltip for a given size
   * @param {string} size - Size
   * @returns {string}
   */
  getTooltip(size) {
    if (this.config.tooltip) {
      return this.config.tooltip;
    }
    return `Size: ${this.getLabel(size)}`;
  }

  /**
   * Handle size changer action
   */
  handleAction() {
    // Cycle to next size
    this.toolbar.nextSize();

    // Update visuals
    this.updateVisuals();
  }

  /**
   * Register the tool and set up event listeners
   * @returns {string} Tool ID
   */
  register() {
    const toolId = super.register();

    // Listen for size changes from external sources
    this.toolbar.on("size:change", () => {
      this.updateVisuals();
    });

    return toolId;
  }
}
