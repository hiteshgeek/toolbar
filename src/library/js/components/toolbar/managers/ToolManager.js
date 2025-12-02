/**
 * ToolManager - Manages toolbar tools (add, remove, update)
 */
export default class ToolManager {
  /**
   * @param {Object} toolbar - Reference to the parent Toolbar instance
   */
  constructor(toolbar) {
    this.toolbar = toolbar;
    this.tools = new Map();
    this.groups = new Map();
  }

  /**
   * Add a tool to the toolbar
   * @param {Object} tool - Tool configuration
   * @returns {string} Tool ID
   */
  addTool(tool) {
    const toolConfig = {
      id: tool.id || `tool-${Date.now()}-${Math.random()}`,
      type: tool.type || "button",
      label: tool.label || "",
      icon: tool.icon || null,
      tooltip: tool.tooltip || tool.label || "",
      shortcut: tool.shortcut || null,
      group: tool.group || null,
      disabled: tool.disabled || false,
      visible: tool.visible !== undefined ? tool.visible : true,
      action: tool.action || null,
      dropdown: tool.dropdown || null,
      badge: tool.badge || null,
      customClass: tool.customClass || "",
      forceDisplayMode: tool.forceDisplayMode || null,
    };

    this.tools.set(toolConfig.id, toolConfig);
    return toolConfig.id;
  }

  /**
   * Add a group of tools
   * @param {Object} group - Group configuration
   * @returns {string} Group ID
   */
  addGroup(group) {
    const groupConfig = {
      id: group.id || `group-${Date.now()}-${Math.random()}`,
      label: group.label || "",
      tools: group.tools || [],
      collapsible: group.collapsible || false,
      collapsed: group.collapsed || false,
    };

    this.groups.set(groupConfig.id, groupConfig);

    // Add tools to the group
    groupConfig.tools.forEach((tool) => {
      tool.group = groupConfig.id;
      this.addTool(tool);
    });

    return groupConfig.id;
  }

  /**
   * Remove a tool
   * @param {string} toolId - Tool ID
   * @returns {boolean} Success status
   */
  removeTool(toolId) {
    return this.tools.delete(toolId);
  }

  /**
   * Update a tool's properties
   * @param {string} toolId - Tool ID
   * @param {Object} updates - Properties to update
   * @returns {boolean} Success status
   */
  updateTool(toolId, updates) {
    const tool = this.tools.get(toolId);

    if (!tool) {
      console.warn(`Tool not found: ${toolId}`);
      return false;
    }

    // Update tool properties
    Object.keys(updates).forEach((key) => {
      if (key !== "id") {
        // Prevent ID changes
        tool[key] = updates[key];
      }
    });

    return true;
  }

  /**
   * Get a tool by ID
   * @param {string} toolId - Tool ID
   * @returns {Object|undefined}
   */
  getTool(toolId) {
    return this.tools.get(toolId);
  }

  /**
   * Get all tools
   * @returns {Map}
   */
  getAllTools() {
    return this.tools;
  }

  /**
   * Get all groups
   * @returns {Map}
   */
  getAllGroups() {
    return this.groups;
  }

  /**
   * Clear all tools
   */
  clearTools() {
    this.tools.clear();
  }

  /**
   * Clear all groups
   */
  clearGroups() {
    this.groups.clear();
  }

  /**
   * Check if a tool exists
   * @param {string} toolId - Tool ID
   * @returns {boolean}
   */
  hasTool(toolId) {
    return this.tools.has(toolId);
  }

  /**
   * Get tools count
   * @returns {number}
   */
  getToolsCount() {
    return this.tools.size;
  }

  /**
   * Get tools by group
   * @param {string} groupId - Group ID
   * @returns {Array}
   */
  getToolsByGroup(groupId) {
    return Array.from(this.tools.values()).filter(
      (tool) => tool.group === groupId
    );
  }

  /**
   * Register tools from options
   */
  registerTools() {
    const { toolSets, tools, defaultToolSet } = this.toolbar.options;

    // If toolSets are defined, use the current tool set
    if (toolSets && toolSets.length > 0) {
      const currentSet = toolSets[this.toolbar.state.currentToolSet];
      if (currentSet && currentSet.tools) {
        currentSet.tools.forEach((tool) => this.addTool(tool));
      }
    } else {
      // Otherwise use the regular tools array
      tools.forEach((tool) => this.addTool(tool));
    }
  }

  /**
   * Register groups from options
   */
  registerGroups() {
    const { toolSets, groups } = this.toolbar.options;

    // If toolSets are defined, use the current tool set's groups
    if (toolSets && toolSets.length > 0) {
      const currentSet = toolSets[this.toolbar.state.currentToolSet];
      if (currentSet && currentSet.groups) {
        currentSet.groups.forEach((group) => this.addGroup(group));
      }
    } else {
      // Otherwise use the regular groups array
      groups.forEach((group) => this.addGroup(group));
    }
  }
}
