/**
 * BaseBuiltInTool - Base class for built-in toolbar tools
 * @abstract
 */
export default class BaseBuiltInTool {
  /**
   * @param {Object} toolbar - Reference to the parent Toolbar instance
   * @param {Object} config - Tool-specific configuration
   */
  constructor(toolbar, config = {}) {
    if (this.constructor === BaseBuiltInTool) {
      throw new Error("BaseBuiltInTool is an abstract class and cannot be instantiated directly");
    }

    this.toolbar = toolbar;
    this.config = config;
    this.toolId = null;
  }

  /**
   * Get the default tool ID
   * @abstract
   * @returns {string}
   */
  getDefaultId() {
    throw new Error("getDefaultId() must be implemented by subclass");
  }

  /**
   * Get the default icon for a given state
   * @abstract
   * @param {string} state - Current state
   * @returns {string}
   */
  getIcon(state) {
    throw new Error("getIcon() must be implemented by subclass");
  }

  /**
   * Get the label for a given state
   * @abstract
   * @param {string} state - Current state
   * @returns {string}
   */
  getLabel(state) {
    throw new Error("getLabel() must be implemented by subclass");
  }

  /**
   * Get the tooltip for a given state
   * @abstract
   * @param {string} state - Current state
   * @returns {string}
   */
  getTooltip(state) {
    throw new Error("getTooltip() must be implemented by subclass");
  }

  /**
   * Handle tool action
   * @abstract
   */
  handleAction() {
    throw new Error("handleAction() must be implemented by subclass");
  }

  /**
   * Get the current state
   * @abstract
   * @returns {string}
   */
  getCurrentState() {
    throw new Error("getCurrentState() must be implemented by subclass");
  }

  /**
   * Update tool visuals based on current state
   */
  updateVisuals() {
    const state = this.getCurrentState();

    this.toolbar.updateTool(this.toolId, {
      icon: this.getIcon(state),
      label: this.getLabel(state),
      tooltip: this.getTooltip(state),
    });
  }

  /**
   * Register the tool with the toolbar
   * @returns {string} Tool ID
   */
  register() {
    const state = this.getCurrentState();

    this.toolId = this.toolbar.addTool({
      id: this.config.id || this.getDefaultId(),
      label: this.getLabel(state),
      icon: this.getIcon(state),
      tooltip: this.config.tooltip || this.getTooltip(state),
      customClass: this.config.customClass || "toolbar__tool--active",
      forceDisplayMode: this.config.forceDisplayMode || null,
      action: () => this.handleAction(),
    });

    return this.toolId;
  }

  /**
   * Unregister the tool from the toolbar
   */
  unregister() {
    if (this.toolId) {
      this.toolbar.removeTool(this.toolId);
      this.toolId = null;
    }
  }
}
