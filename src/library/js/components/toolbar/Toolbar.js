/**
 * Toolbar - Modular Toolbar System
 * @version 1.0.4
 */

import { ToolbarEventEmitter } from "./ToolbarEmitter.js";
import { icons } from "../../utils/icons.js";
import Tooltip from "../tooltip/Tooltip.js"; // Import the Tooltip class

export default class Toolbar {
  static _resolveIcon(iconPath) {
    if (!iconPath) return null;
    if (typeof iconPath === "string" && iconPath.includes("<svg")) {
      return iconPath;
    }
    const parts = iconPath.split(".");
    let icon = icons;
    for (const part of parts) {
      if (icon && typeof icon === "object" && part in icon) {
        icon = icon[part];
      } else {
        console.warn(`Icon not found: ${iconPath}`);
        return null;
      }
    }
    return icon;
  }

  constructor(options = {}) {
    // Define valid positions
    this.validPositions = [
      "top-left",
      "top-center",
      "top-right",
      "bottom-left",
      "bottom-center",
      "bottom-right",
      "center-left",
      "center",
      "center-right",
    ];

    // Validate and set position (default to bottom-center if invalid)
    let position = options.position || "bottom-center";
    if (!this.validPositions.includes(position)) {
      console.warn(
        `Invalid position: ${position}. Defaulting to bottom-center. Valid positions are: ${this.validPositions.join(", ")}`
      );
      position = "bottom-center";
    }

    this.options = {
      container: options.container || document.body,
      position: position,
      orientation: options.orientation || "horizontal",
      theme: options.theme || "system", // Default to system preference
      draggable: options.draggable !== undefined ? options.draggable : false,
      snapToPosition:
        options.snapToPosition !== undefined ? options.snapToPosition : false,
      allowedSnapPositions: options.allowedSnapPositions || this.validPositions,
      collapsible:
        options.collapsible !== undefined ? options.collapsible : false,
      collapsed: options.collapsed || false,
      showLabels: options.showLabels !== undefined ? options.showLabels : true,
      iconSize: options.iconSize || "medium",
      customClass: options.customClass || "",
      tools: options.tools || [],
      groups: options.groups || [],
      toolSets: options.toolSets || null, // Array of tool sets
      defaultToolSet: options.defaultToolSet || 0, // Index of default set
      showSetIndicator:
        options.showSetIndicator !== undefined ? options.showSetIndicator : true,
      onToolClick: options.onToolClick || null,
      onStateChange: options.onStateChange || null,
      onThemeChange: options.onThemeChange || null,
      onPositionChange: options.onPositionChange || null,
      onToolSetChange: options.onToolSetChange || null,
    };

    // Validate allowedSnapPositions
    this.options.allowedSnapPositions =
      this.options.allowedSnapPositions.filter((pos) => {
        if (!this.validPositions.includes(pos)) {
          console.warn(`Invalid snap position: ${pos}. Ignoring.`);
          return false;
        }
        return true;
      });

    // If no valid snap positions, use all valid positions
    if (this.options.allowedSnapPositions.length === 0) {
      this.options.allowedSnapPositions = this.validPositions;
    }

    this.state = {
      activeTool: null,
      collapsed: this.options.collapsed,
      position: { x: 0, y: 0 },
      isDragging: false,
      snapHintsVisible: false,
      currentToolSet: this.options.defaultToolSet,
    };

    this.tools = new Map();
    this.groups = new Map();
    this.eventEmitter = new ToolbarEventEmitter();
    this.element = null;
    this.toolsContainer = null;
    this.systemThemeListener = null;
    this.snapHintsContainer = null;
    this.setIndicator = null;

    this._init();
  }

  _init() {
    this._createElements();
    this._registerTools();
    this._registerGroups();
    this._addNavigationButton(); // Add navigation button for initial set
    this._attachEventListeners();
    this._setupSystemThemeListener();
    this._render();
  }

  /**
   * Setup listener for system theme changes when theme is set to 'system'
   */
  _setupSystemThemeListener() {
    if (this.options.theme === "system" && window.matchMedia) {
      const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

      this.systemThemeListener = (e) => {
        const detectedTheme = e.matches ? "dark" : "light";
        this.eventEmitter.emit("theme:system-change", {
          theme: detectedTheme,
          systemPreference: true,
        });
        if (this.options.onThemeChange) {
          this.options.onThemeChange(detectedTheme, true);
        }
      };

      // Modern browsers
      if (darkModeQuery.addEventListener) {
        darkModeQuery.addEventListener("change", this.systemThemeListener);
      }
      // Fallback for older browsers
      else if (darkModeQuery.addListener) {
        darkModeQuery.addListener(this.systemThemeListener);
      }
    }
  }

  /**
   * Remove system theme listener
   */
  _removeSystemThemeListener() {
    if (this.systemThemeListener && window.matchMedia) {
      const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

      if (darkModeQuery.removeEventListener) {
        darkModeQuery.removeEventListener("change", this.systemThemeListener);
      } else if (darkModeQuery.removeListener) {
        darkModeQuery.removeListener(this.systemThemeListener);
      }

      this.systemThemeListener = null;
    }
  }

  _createElements() {
    const container =
      typeof this.options.container === "string"
        ? document.querySelector(this.options.container)
        : this.options.container;

    if (!container) throw new Error(`Toolbar: Container not found.`);

    // Force positioning context
    const containerStyle = window.getComputedStyle(container);
    if (containerStyle.position === "static" && container !== document.body) {
      container.style.position = "relative";
    }

    this.element = document.createElement("div");
    this.element.className = this._generateClassName();
    this.element.setAttribute("role", "toolbar");

    // Header & Drag Handle
    if (this.options.draggable || this.options.collapsible) {
      this.header = document.createElement("div");
      this.header.className = "toolbar__header";
      this.element.appendChild(this.header);

      if (this.options.collapsible) {
        this.collapseButton = document.createElement("button");
        this.collapseButton.className = "toolbar__collapse-btn";
        this.collapseButton.innerHTML = this._getCollapseIcon();
        // Add tooltip for collapse button
        this.collapseButton.setAttribute(
          "data-tooltip-text",
          this.state.collapsed ? "Expand" : "Collapse"
        );
        this.collapseButton.setAttribute(
          "data-tooltip-position",
          this._determineTooltipPosition()
        );
        Tooltip.init(this.collapseButton);

        this.header.appendChild(this.collapseButton);
      }

      if (this.options.draggable) {
        this.dragHandle = document.createElement("div");
        this.dragHandle.className = "toolbar__drag-handle";
        this.dragHandle.innerHTML = Toolbar._resolveIcon("drag.vertical");
        this.header.appendChild(this.dragHandle);
      }
    }

    this.toolsContainer = document.createElement("div");
    this.toolsContainer.className = "toolbar__tools";
    this.element.appendChild(this.toolsContainer);

    container.appendChild(this.element);
  }

  _generateClassName() {
    const classes = ["toolbar"];
    classes.push(`toolbar--${this.options.position}`);
    classes.push(`toolbar--${this.options.orientation}`);
    classes.push(`toolbar--${this.options.theme}`);
    classes.push(`toolbar--icon-${this.options.iconSize}`);

    if (this.state.collapsed) classes.push("toolbar--collapsed");
    if (this.options.draggable) classes.push("toolbar--draggable");
    if (this.options.customClass) classes.push(this.options.customClass);

    return classes.join(" ");
  }

  // NOTE: This is empty now because we handle styles in CSS
  _applyStyles() {}

  _registerTools() {
    // If toolSets are defined, use the current tool set
    if (this.options.toolSets && this.options.toolSets.length > 0) {
      const currentSet = this.options.toolSets[this.state.currentToolSet];
      if (currentSet && currentSet.tools) {
        currentSet.tools.forEach((tool) => this.addTool(tool));
      }
    } else {
      // Otherwise use the regular tools array
      this.options.tools.forEach((tool) => this.addTool(tool));
    }
  }

  _registerGroups() {
    // If toolSets are defined, use the current tool set's groups
    if (this.options.toolSets && this.options.toolSets.length > 0) {
      const currentSet = this.options.toolSets[this.state.currentToolSet];
      if (currentSet && currentSet.groups) {
        currentSet.groups.forEach((group) => this.addGroup(group));
      }
    } else {
      // Otherwise use the regular groups array
      this.options.groups.forEach((group) => this.addGroup(group));
    }
  }

  _attachEventListeners() {
    if (this.collapseButton) {
      this.collapseButton.addEventListener("click", () =>
        this.toggleCollapse()
      );
    }
    if (this.options.draggable && this.dragHandle) {
      this.dragHandle.addEventListener(
        "mousedown",
        this._onDragStart.bind(this)
      );
    }
    this.toolsContainer.addEventListener("click", this._onToolClick.bind(this));
    this.element.addEventListener("keydown", this._onKeyDown.bind(this));
  }

  _onDragStart(e) {
    e.preventDefault();
    this.state.isDragging = true;

    const parent = this.element.offsetParent || document.body;
    const rect = this.element.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    const currentLeft = rect.left - parentRect.left - parent.clientLeft;
    const currentTop = rect.top - parentRect.top - parent.clientTop;

    this.element.style.position = "absolute";
    this.element.style.left = `${currentLeft}px`;
    this.element.style.top = `${currentTop}px`;
    this.element.style.bottom = "auto";
    this.element.style.right = "auto";
    this.element.style.transform = "none";
    this.element.style.margin = "0";

    this.state.dragStart = { mouseX: e.clientX, mouseY: e.clientY };
    this.state.initialPos = { left: currentLeft, top: currentTop };

    this.state.bounds = {
      minX: 0,
      minY: 0,
      maxX: parent.clientWidth - this.element.offsetWidth,
      maxY: parent.clientHeight - this.element.offsetHeight,
    };

    // Show snap hints if snap mode is enabled
    if (this.options.snapToPosition) {
      this._showSnapHints();
    }

    const onMouseMove = this._onDragMove.bind(this);
    const onMouseUp = () => {
      this.state.isDragging = false;

      // Hide snap hints
      if (this.options.snapToPosition) {
        this._hideSnapHints();
        this._snapToNearestPosition();
      }

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      this.element.classList.remove("toolbar--dragging");
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    this.element.classList.add("toolbar--dragging");
  }

  _onDragMove(e) {
    if (!this.state.isDragging) return;

    const deltaX = e.clientX - this.state.dragStart.mouseX;
    const deltaY = e.clientY - this.state.dragStart.mouseY;

    let newLeft = this.state.initialPos.left + deltaX;
    let newTop = this.state.initialPos.top + deltaY;

    newLeft = Math.max(
      this.state.bounds.minX,
      Math.min(newLeft, this.state.bounds.maxX)
    );
    newTop = Math.max(
      this.state.bounds.minY,
      Math.min(newTop, this.state.bounds.maxY)
    );

    this.element.style.left = `${newLeft}px`;
    this.element.style.top = `${newTop}px`;
    this.state.position = { x: newLeft, y: newTop };

    // Highlight nearest snap position if snap mode is enabled
    if (this.options.snapToPosition) {
      this._highlightNearestSnapHint();
    }
  }

  /**
   * Show snap position hints
   */
  _showSnapHints() {
    if (!this.snapHintsContainer) {
      this._createSnapHints();
    }
    this.snapHintsContainer.classList.add("toolbar__snap-hints--visible");
    this.state.snapHintsVisible = true;
  }

  /**
   * Hide snap position hints
   */
  _hideSnapHints() {
    if (this.snapHintsContainer) {
      this.snapHintsContainer.classList.remove("toolbar__snap-hints--visible");
    }
    this.state.snapHintsVisible = false;
  }

  /**
   * Create snap position hint elements
   */
  _createSnapHints() {
    const container =
      typeof this.options.container === "string"
        ? document.querySelector(this.options.container)
        : this.options.container;

    this.snapHintsContainer = document.createElement("div");
    this.snapHintsContainer.className = "toolbar__snap-hints";

    this.options.allowedSnapPositions.forEach((position) => {
      const hint = document.createElement("div");
      hint.className = `toolbar__snap-hint toolbar__snap-hint--${position}`;
      hint.dataset.position = position;
      this.snapHintsContainer.appendChild(hint);
    });

    container.appendChild(this.snapHintsContainer);
  }

  /**
   * Highlight the nearest snap hint based on current toolbar position
   */
  _highlightNearestSnapHint() {
    if (!this.snapHintsContainer) return;

    const nearestPosition = this._findNearestSnapPosition();
    const hints = this.snapHintsContainer.querySelectorAll(".toolbar__snap-hint");

    hints.forEach((hint) => {
      if (hint.dataset.position === nearestPosition) {
        hint.classList.add("toolbar__snap-hint--active");
      } else {
        hint.classList.remove("toolbar__snap-hint--active");
      }
    });
  }

  /**
   * Find the nearest snap position based on current toolbar position
   */
  _findNearestSnapPosition() {
    const parent = this.element.offsetParent || document.body;
    const rect = this.element.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    // Get toolbar center relative to parent
    const toolbarCenterX =
      rect.left + rect.width / 2 - parentRect.left - parent.clientLeft;
    const toolbarCenterY =
      rect.top + rect.height / 2 - parentRect.top - parent.clientTop;

    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;

    let nearestPosition = null;
    let minDistance = Infinity;

    this.options.allowedSnapPositions.forEach((position) => {
      const coords = this._getPositionCoordinates(
        position,
        parentWidth,
        parentHeight
      );
      const distance = Math.sqrt(
        Math.pow(coords.x - toolbarCenterX, 2) +
          Math.pow(coords.y - toolbarCenterY, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestPosition = position;
      }
    });

    return nearestPosition;
  }

  /**
   * Get coordinates for a position name (center point)
   */
  _getPositionCoordinates(position, parentWidth, parentHeight) {
    const coords = { x: 0, y: 0 };

    // Horizontal positioning
    if (position.includes("left")) {
      coords.x = parentWidth * 0.1; // 10% from left
    } else if (position.includes("right")) {
      coords.x = parentWidth * 0.9; // 90% from left (10% from right)
    } else {
      coords.x = parentWidth * 0.5; // Center
    }

    // Vertical positioning
    if (position.includes("top")) {
      coords.y = parentHeight * 0.1; // 10% from top
    } else if (position.includes("bottom")) {
      coords.y = parentHeight * 0.9; // 90% from top (10% from bottom)
    } else {
      coords.y = parentHeight * 0.5; // Center
    }

    return coords;
  }

  /**
   * Snap toolbar to nearest allowed position
   */
  _snapToNearestPosition() {
    const nearestPosition = this._findNearestSnapPosition();

    if (nearestPosition) {
      this._setPosition(nearestPosition, true);

      if (this.options.onPositionChange) {
        this.options.onPositionChange(nearestPosition);
      }

      this.eventEmitter.emit("position:change", { position: nearestPosition });
    }
  }

  /**
   * Set toolbar to a specific position with optional animation
   */
  _setPosition(position, animate = false) {
    if (!this.validPositions.includes(position)) {
      console.warn(`Invalid position: ${position}`);
      return;
    }

    this.options.position = position;

    // Remove all position classes
    this.validPositions.forEach((pos) => {
      this.element.classList.remove(`toolbar--${pos}`);
    });

    // Add new position class
    this.element.classList.add(`toolbar--${position}`);

    // Add animation class if requested
    if (animate) {
      this.element.classList.add("toolbar--snapping");
      setTimeout(() => {
        this.element.classList.remove("toolbar--snapping");
      }, 300); // Match transition duration
    }

    // Reset positioning styles to let CSS handle it
    this.element.style.position = "";
    this.element.style.left = "";
    this.element.style.top = "";
    this.element.style.right = "";
    this.element.style.bottom = "";
    this.element.style.transform = "";
  }

  _onToolClick(e) {
    const toolButton = e.target.closest("[data-tool-id]");
    if (!toolButton) return;
    const toolId = toolButton.dataset.toolId;
    const tool = this.tools.get(toolId);
    if (!tool || tool.disabled) return;

    if (tool.type === "toggle" || tool.type === "radio") {
      this.setActiveTool(toolId);
    }
    if (tool.action) tool.action.call(this, tool, e);
    this.eventEmitter.emit("tool:click", { tool, event: e });
    if (this.options.onToolClick) this.options.onToolClick(tool, e);
  }

  _onKeyDown(e) {
    const currentFocus = document.activeElement;
    const toolButtons = Array.from(
      this.toolsContainer.querySelectorAll("[data-tool-id]:not([disabled])")
    );
    const currentIndex = toolButtons.indexOf(currentFocus);
    let nextIndex = currentIndex;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        nextIndex = (currentIndex + 1) % toolButtons.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        nextIndex =
          (currentIndex - 1 + toolButtons.length) % toolButtons.length;
        break;
      case "Home":
        e.preventDefault();
        nextIndex = 0;
        break;
      case "End":
        e.preventDefault();
        nextIndex = toolButtons.length - 1;
        break;
      default:
        return;
    }
    if (toolButtons[nextIndex]) toolButtons[nextIndex].focus();
  }

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
    };
    this.tools.set(toolConfig.id, toolConfig);
    return toolConfig.id;
  }

  addGroup(group) {
    const groupConfig = {
      id: group.id || `group-${Date.now()}-${Math.random()}`,
      label: group.label || "",
      tools: group.tools || [],
      collapsible: group.collapsible || false,
      collapsed: group.collapsed || false,
    };
    this.groups.set(groupConfig.id, groupConfig);
    groupConfig.tools.forEach((tool) => {
      tool.group = groupConfig.id;
      this.addTool(tool);
    });
    return groupConfig.id;
  }

  removeTool(toolId) {
    const element = this.toolsContainer.querySelector(
      `[data-tool-id="${toolId}"]`
    );
    if (element) Tooltip.remove(element); // Cleanup tooltip

    this.tools.delete(toolId);
    this._render();
  }

  getTool(toolId) {
    return this.tools.get(toolId);
  }

  updateTool(toolId, updates) {
    const tool = this.tools.get(toolId);
    if (!tool) return;

    Object.assign(tool, updates);

    // If updating existing element in place (optimization)
    const element = this.toolsContainer.querySelector(
      `[data-tool-id="${toolId}"]`
    );
    if (element) {
      if (updates.tooltip || updates.label) {
        Tooltip.updateText(element, updates.tooltip || updates.label);
      }
      if (updates.shortcut) {
        Tooltip.updateShortcut(element, updates.shortcut);
      }
    }

    this._render();
  }

  setActiveTool(toolId) {
    const previousTool = this.state.activeTool;
    this.state.activeTool = toolId;
    this.toolsContainer.querySelectorAll("[data-tool-id]").forEach((btn) => {
      btn.classList.remove("toolbar__tool--active");
      btn.setAttribute("aria-pressed", "false");
    });
    const activeButton = this.toolsContainer.querySelector(
      `[data-tool-id="${toolId}"]`
    );
    if (activeButton) {
      activeButton.classList.add("toolbar__tool--active");
      activeButton.setAttribute("aria-pressed", "true");
    }
    this.eventEmitter.emit("tool:activate", {
      toolId,
      previousToolId: previousTool,
    });
    if (this.options.onStateChange)
      this.options.onStateChange({ activeTool: toolId });
  }

  getActiveTool() {
    return this.state.activeTool ? this.tools.get(this.state.activeTool) : null;
  }

  toggleCollapse() {
    this.state.collapsed = !this.state.collapsed;
    this.element.classList.toggle("toolbar--collapsed");

    if (this.collapseButton) {
      this.collapseButton.innerHTML = this._getCollapseIcon();
      this.collapseButton.setAttribute("aria-expanded", !this.state.collapsed);
      // Update collapse button tooltip
      Tooltip.updateText(
        this.collapseButton,
        this.state.collapsed ? "Expand" : "Collapse"
      );
    }

    this.eventEmitter.emit("toolbar:collapse", {
      collapsed: this.state.collapsed,
    });
  }

  show() {
    this.element.style.display = "";
    this.eventEmitter.emit("toolbar:show");
  }
  hide() {
    this.element.style.display = "none";
    this.eventEmitter.emit("toolbar:hide");
  }

  /**
   * Set the toolbar theme dynamically
   * @param {string} theme - 'light', 'dark', or 'system'
   */
  setTheme(theme) {
    const validThemes = ["light", "dark", "system"];
    if (!validThemes.includes(theme)) {
      console.warn(
        `Invalid theme: ${theme}. Valid themes are: ${validThemes.join(", ")}`
      );
      return;
    }

    const previousTheme = this.options.theme;
    this.options.theme = theme;

    // Remove old theme class
    this.element.classList.remove(`toolbar--${previousTheme}`);
    // Add new theme class
    this.element.classList.add(`toolbar--${theme}`);

    // Update system theme listener
    this._removeSystemThemeListener();
    if (theme === "system") {
      this._setupSystemThemeListener();
    }

    // Get current effective theme for system mode
    let effectiveTheme = theme;
    if (theme === "system" && window.matchMedia) {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    this.eventEmitter.emit("theme:change", {
      theme: theme,
      previousTheme: previousTheme,
      effectiveTheme: effectiveTheme,
    });

    if (this.options.onThemeChange) {
      this.options.onThemeChange(theme, false);
    }
  }

  /**
   * Get the current theme setting
   * @returns {string} Current theme ('light', 'dark', or 'system')
   */
  getTheme() {
    return this.options.theme;
  }

  /**
   * Get the effective theme (resolves 'system' to actual theme)
   * @returns {string} Effective theme ('light' or 'dark')
   */
  getEffectiveTheme() {
    if (this.options.theme === "system" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return this.options.theme;
  }

  /**
   * Set whether to show labels on toolbar buttons
   * @param {boolean} show - True to show labels, false to hide them
   */
  setShowLabels(show) {
    this.options.showLabels = show;

    // Preserve all currently active tools before re-rendering
    const activeTools = [];
    this.toolsContainer
      .querySelectorAll(".toolbar__tool--active")
      .forEach((btn) => {
        const toolId = btn.getAttribute("data-tool-id");
        if (toolId) {
          activeTools.push(toolId);
        }
      });

    if (show) {
      this.toolsContainer.classList.add("with_label");
    } else {
      this.toolsContainer.classList.remove("with_label");
    }

    // Store the current active tool ID
    const currentActiveTool = this.state.activeTool;

    this._render();

    // Restore all active tool states after re-rendering (except toggle-labels)
    activeTools.forEach((toolId) => {
      if (toolId !== "toggle-labels") {
        const button = this.toolsContainer.querySelector(
          `[data-tool-id="${toolId}"]`
        );
        if (button) {
          button.classList.add("toolbar__tool--active");
          button.setAttribute("aria-pressed", "true");
        }
      }
    });

    // Set the toggle-labels button active state based on the new showLabels value
    const toggleButton = this.toolsContainer.querySelector(
      '[data-tool-id="toggle-labels"]'
    );
    if (toggleButton) {
      if (show) {
        toggleButton.classList.add("toolbar__tool--active");
        toggleButton.setAttribute("aria-pressed", "true");
      } else {
        toggleButton.classList.remove("toolbar__tool--active");
        toggleButton.setAttribute("aria-pressed", "false");
      }
    }

    // Restore the state
    this.state.activeTool = currentActiveTool;

    this.eventEmitter.emit("labels:change", { showLabels: show });
  }

  /**
   * Switch to a specific tool set by index
   * @param {number} setIndex - Index of the tool set to switch to
   */
  switchToolSet(setIndex) {
    if (!this.options.toolSets || this.options.toolSets.length === 0) {
      console.warn("No tool sets defined");
      return;
    }

    if (setIndex < 0 || setIndex >= this.options.toolSets.length) {
      console.warn(`Invalid tool set index: ${setIndex}`);
      return;
    }

    const previousSet = this.state.currentToolSet;
    this.state.currentToolSet = setIndex;

    // Clear existing tools and groups
    this.tools.clear();
    this.groups.clear();

    // Re-register tools and groups from new set
    this._registerTools();
    this._registerGroups();

    // Add automatic navigation button if configured
    this._addNavigationButton();

    // Re-render toolbar
    this._render();

    // Update set indicator if it exists
    this._updateSetIndicator();

    // Emit event
    const currentSet = this.options.toolSets[setIndex];
    this.eventEmitter.emit("toolset:change", {
      currentSet: setIndex,
      previousSet: previousSet,
      setName: currentSet.name || `Set ${setIndex + 1}`,
    });

    if (this.options.onToolSetChange) {
      this.options.onToolSetChange(setIndex, currentSet);
    }
  }

  /**
   * Add automatic navigation button based on current set's configuration
   *
   * Configuration options:
   * {
   *   label: string,           // Button label (default: "More")
   *   icon: string,            // Icon path (default: "navigation.angle_right")
   *   tooltip: string,         // Tooltip text (default: "Next tools")
   *   targetSet: number|"next"|"previous",  // Target set (default: "next")
   *   showSeparator: boolean,  // Show separator before button (default: true)
   *   customClass: string      // Custom CSS class
   * }
   */
  _addNavigationButton() {
    if (!this.options.toolSets || this.options.toolSets.length <= 1) return;

    const currentSet = this.options.toolSets[this.state.currentToolSet];
    if (!currentSet || !currentSet.navigationButton) return;

    const navConfig = currentSet.navigationButton;

    // Determine target set index
    let targetSetIndex;
    if (typeof navConfig.targetSet === "number") {
      targetSetIndex = navConfig.targetSet;
    } else if (navConfig.targetSet === "next") {
      targetSetIndex =
        (this.state.currentToolSet + 1) % this.options.toolSets.length;
    } else if (navConfig.targetSet === "previous") {
      targetSetIndex =
        (this.state.currentToolSet - 1 + this.options.toolSets.length) %
        this.options.toolSets.length;
    } else {
      // Default to next
      targetSetIndex =
        (this.state.currentToolSet + 1) % this.options.toolSets.length;
    }

    // Add separator before navigation button (unless explicitly disabled)
    if (navConfig.showSeparator !== false) {
      this.addTool({
        id: `__nav-separator-${this.state.currentToolSet}`,
        type: "separator",
      });
    }

    // Add the navigation button
    const actualNavButton = {
      id: navConfig.id || `__nav-button-${this.state.currentToolSet}`,
      label: navConfig.label || "More",
      icon: navConfig.icon || "navigation.angle_right",
      tooltip: navConfig.tooltip || "Next tools",
      action: () => {
        this.switchToolSet(targetSetIndex);
      },
      customClass: navConfig.customClass || "",
    };

    this.addTool(actualNavButton);
  }

  /**
   * Switch to the next tool set
   */
  nextToolSet() {
    if (!this.options.toolSets || this.options.toolSets.length === 0) return;

    const nextIndex =
      (this.state.currentToolSet + 1) % this.options.toolSets.length;
    this.switchToolSet(nextIndex);
  }

  /**
   * Switch to the previous tool set
   */
  previousToolSet() {
    if (!this.options.toolSets || this.options.toolSets.length === 0) return;

    const prevIndex =
      (this.state.currentToolSet - 1 + this.options.toolSets.length) %
      this.options.toolSets.length;
    this.switchToolSet(prevIndex);
  }

  /**
   * Get the current tool set index
   * @returns {number} Current tool set index
   */
  getCurrentToolSet() {
    return this.state.currentToolSet;
  }

  /**
   * Get the total number of tool sets
   * @returns {number} Total number of tool sets
   */
  getToolSetCount() {
    return this.options.toolSets ? this.options.toolSets.length : 0;
  }

  /**
   * Update the set indicator dots
   */
  _updateSetIndicator() {
    if (!this.setIndicator || !this.options.showSetIndicator) return;

    const dots = this.setIndicator.querySelectorAll(".toolbar__set-dot");
    dots.forEach((dot, index) => {
      if (index === this.state.currentToolSet) {
        dot.classList.add("toolbar__set-dot--active");
      } else {
        dot.classList.remove("toolbar__set-dot--active");
      }
    });
  }

  /**
   * Create set indicator (pagination dots)
   */
  _createSetIndicator() {
    if (
      !this.options.toolSets ||
      this.options.toolSets.length <= 1 ||
      !this.options.showSetIndicator
    ) {
      return null;
    }

    const indicator = document.createElement("div");
    indicator.className = "toolbar__set-indicator";

    this.options.toolSets.forEach((set, index) => {
      const dot = document.createElement("button");
      dot.className = "toolbar__set-dot";
      dot.setAttribute("aria-label", set.name || `Tool set ${index + 1}`);
      dot.setAttribute("data-set-index", index);

      if (index === this.state.currentToolSet) {
        dot.classList.add("toolbar__set-dot--active");
      }

      dot.addEventListener("click", () => {
        this.switchToolSet(index);
      });

      indicator.appendChild(dot);
    });

    return indicator;
  }

  _render() {
    // Cleanup old tooltips before re-rendering
    this.toolsContainer
      .querySelectorAll("[data-tool-id]")
      .forEach((el) => Tooltip.remove(el));

    this.toolsContainer.innerHTML = "";
    const groupedTools = new Map();
    const ungroupedTools = [];

    this.tools.forEach((tool) => {
      if (!tool.visible) return;
      if (tool.group) {
        if (!groupedTools.has(tool.group)) groupedTools.set(tool.group, []);
        groupedTools.get(tool.group).push(tool);
      } else {
        ungroupedTools.push(tool);
      }
    });

    this.groups.forEach((group, groupId) => {
      const groupTools = groupedTools.get(groupId) || [];
      if (groupTools.length === 0) return;
      this.toolsContainer.appendChild(
        this._createGroupElement(group, groupTools)
      );
    });

    ungroupedTools.forEach((tool) => {
      this.toolsContainer.appendChild(this._createToolElement(tool));
    });

    // Add set indicator if tool sets are enabled
    if (
      this.options.toolSets &&
      this.options.toolSets.length > 1 &&
      this.options.showSetIndicator
    ) {
      // Remove existing indicator if present
      if (this.setIndicator && this.setIndicator.parentNode) {
        this.setIndicator.parentNode.removeChild(this.setIndicator);
      }

      // Create new indicator
      this.setIndicator = this._createSetIndicator();
      if (this.setIndicator) {
        this.toolsContainer.appendChild(this.setIndicator);
      }
    }
  }

  _createGroupElement(group, tools) {
    const groupElement = document.createElement("div");
    groupElement.className = "toolbar__group";
    groupElement.setAttribute("data-group-id", group.id);
    if (group.label) {
      const label = document.createElement("div");
      label.className = "toolbar__group-label";
      label.textContent = group.label;
      groupElement.appendChild(label);
    }
    const toolsWrapper = document.createElement("div");
    toolsWrapper.className = "toolbar__group-tools";
    tools.forEach((tool) =>
      toolsWrapper.appendChild(this._createToolElement(tool))
    );
    groupElement.appendChild(toolsWrapper);
    return groupElement;
  }

  _createToolElement(tool) {
    if (tool.type === "separator") {
      const separator = document.createElement("div");
      separator.className = "toolbar__separator";
      separator.setAttribute("role", "separator");
      return separator;
    }

    const button = document.createElement("button");
    button.className = `toolbar__tool toolbar__tool--${tool.type}`;
    button.setAttribute("data-tool-id", tool.id);
    button.setAttribute("type", "button");
    button.setAttribute("aria-label", tool.tooltip || tool.label);

    // INTEGRATION: Modern Tooltip System
    // We do NOT set 'title' anymore to avoid native tooltip conflict
    button.setAttribute("data-tooltip-text", tool.tooltip || tool.label);

    if (tool.shortcut) {
      button.setAttribute("data-tooltip-shortcut", tool.shortcut);
    }

    // Smart Positioning based on toolbar orientation
    button.setAttribute(
      "data-tooltip-position",
      this._determineTooltipPosition()
    );

    if (tool.customClass) button.classList.add(tool.customClass);
    if (tool.disabled) button.disabled = true;

    if (this.state.activeTool === tool.id) {
      button.classList.add("toolbar__tool--active");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.setAttribute("aria-pressed", "false");
    }

    if (tool.icon) {
      const icon = document.createElement("span");
      icon.className = "toolbar__tool-icon";
      icon.innerHTML = Toolbar._resolveIcon(tool.icon);
      button.appendChild(icon);
    }

    if (this.options.showLabels && tool.label) {
      const label = document.createElement("span");
      label.className = "toolbar__tool-label";
      label.textContent = tool.label;
      button.appendChild(label);
    }

    if (tool.badge) {
      const badge = document.createElement("span");
      badge.className = "toolbar__tool-badge";
      badge.textContent = tool.badge;
      button.appendChild(badge);
    }

    if (tool.type === "dropdown") {
      const dropIcon = document.createElement("span");
      dropIcon.className = "toolbar__tool-dropdown-icon";
      dropIcon.innerHTML = Toolbar._resolveIcon("navigation.chevron_down");
      button.appendChild(dropIcon);
    }

    // Initialize the tooltip logic for this button
    Tooltip.init(button);

    return button;
  }

  /**
   * Helper to determine best tooltip position based on toolbar location
   */
  _determineTooltipPosition() {
    const pos = this.options.position;
    if (pos.includes("bottom")) return "top";
    if (pos.includes("top")) return "bottom";
    if (pos.includes("left")) return "right";
    if (pos.includes("right")) return "left";
    return "auto"; // Default or floating
  }

  _getCollapseIcon() {
    if (this.options.orientation === "horizontal") {
      return this.state.collapsed
        ? Toolbar._resolveIcon("navigation.chevron_down")
        : Toolbar._resolveIcon("navigation.chevron_up");
    } else {
      return this.state.collapsed
        ? Toolbar._resolveIcon("navigation.chevron_right")
        : Toolbar._resolveIcon("navigation.chevron_left");
    }
  }

  destroy() {
    // Remove system theme listener
    this._removeSystemThemeListener();

    if (this.element && this.element.parentNode) {
      // Cleanup tooltips inside
      if (this.collapseButton) Tooltip.remove(this.collapseButton);
      this.toolsContainer
        .querySelectorAll("[data-tool-id]")
        .forEach((el) => Tooltip.remove(el));

      this.element.parentNode.removeChild(this.element);
    }
    this.tools.clear();
    this.groups.clear();
    this.eventEmitter.removeAllListeners();
  }

  getElement() {
    return this.element;
  }
  on(event, callback) {
    this.eventEmitter.on(event, callback);
  }
  off(event, callback) {
    this.eventEmitter.off(event, callback);
  }
}

export { Toolbar };
