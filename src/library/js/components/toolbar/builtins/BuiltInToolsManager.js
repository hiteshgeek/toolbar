/**
 * BuiltInToolsManager - Manages all built-in toolbar tools
 */
import ThemeSwitcher from "./ThemeSwitcher.js";
import DisplayModeSwitcher from "./DisplayModeSwitcher.js";
import SizeChanger from "./SizeChanger.js";

export default class BuiltInToolsManager {
  /**
   * @param {Object} toolbar - Reference to the parent Toolbar instance
   */
  constructor(toolbar) {
    this.toolbar = toolbar;
    this.tools = new Map();

    // Built-in tool class registry
    this.toolClasses = {
      theme: ThemeSwitcher,
      displayMode: DisplayModeSwitcher,
      size: SizeChanger,
    };
  }

  /**
   * Initialize and register all enabled built-in tools
   */
  initialize() {
    const { builtInTools, builtInToolsConfig } = this.toolbar.options;

    // Register each enabled built-in tool
    Object.keys(builtInTools).forEach((toolKey) => {
      if (builtInTools[toolKey] === true) {
        this.registerTool(toolKey, builtInToolsConfig[toolKey] || {});
      }
    });
  }

  /**
   * Register a specific built-in tool
   * @param {string} toolKey - Tool identifier (theme, displayMode, size)
   * @param {Object} config - Tool-specific configuration
   * @returns {string|null} Tool ID or null if registration failed
   */
  registerTool(toolKey, config = {}) {
    const ToolClass = this.toolClasses[toolKey];

    if (!ToolClass) {
      console.warn(`Unknown built-in tool: ${toolKey}`);
      return null;
    }

    // Create tool instance
    const tool = new ToolClass(this.toolbar, config);

    // Register with toolbar
    const toolId = tool.register();

    // Store reference
    this.tools.set(toolKey, tool);

    return toolId;
  }

  /**
   * Unregister a specific built-in tool
   * @param {string} toolKey - Tool identifier
   */
  unregisterTool(toolKey) {
    const tool = this.tools.get(toolKey);

    if (tool) {
      tool.unregister();
      this.tools.delete(toolKey);
    }
  }

  /**
   * Get a built-in tool instance
   * @param {string} toolKey - Tool identifier
   * @returns {BaseBuiltInTool|null}
   */
  getTool(toolKey) {
    return this.tools.get(toolKey) || null;
  }

  /**
   * Check if a built-in tool is registered
   * @param {string} toolKey - Tool identifier
   * @returns {boolean}
   */
  hasTool(toolKey) {
    return this.tools.has(toolKey);
  }

  /**
   * Unregister all built-in tools
   */
  destroy() {
    this.tools.forEach((tool) => tool.unregister());
    this.tools.clear();
  }

  /**
   * Register a custom built-in tool class
   * @param {string} toolKey - Tool identifier
   * @param {Class} ToolClass - Tool class (must extend BaseBuiltInTool)
   */
  registerToolClass(toolKey, ToolClass) {
    this.toolClasses[toolKey] = ToolClass;
  }
}
