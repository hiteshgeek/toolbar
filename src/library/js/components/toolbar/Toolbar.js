/**
 * Toolbar - Modular Toolbar System
 * @version 1.0.4
 */

import { ToolbarEventEmitter } from "./ToolbarEmitter.js";
import { icons } from "../../utils/icons.js";
import Tooltip from "../tooltip/Tooltip.js"; // Import the Tooltip class
import { BuiltInToolsManager } from "./builtins/index.js"; // Import BuiltInToolsManager

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

    // Define valid sizes
    this.validSizes = ["small", "medium", "large"];

    // Define valid display modes
    this.validDisplayModes = ["icon", "label", "both"];

    // Define valid orientations
    this.validOrientations = ["horizontal", "vertical"];

    // Validate and set position (default to bottom-center if invalid)
    let position = options.position || "bottom-center";
    if (!this.validPositions.includes(position)) {
      console.warn(
        `Invalid position: ${position}. Defaulting to bottom-center. Valid positions are: ${this.validPositions.join(
          ", "
        )}`
      );
      position = "bottom-center";
    }

    // Validate and set size (default to medium if invalid)
    let size = options.size || "medium";
    if (!this.validSizes.includes(size)) {
      console.warn(
        `Invalid size: ${size}. Defaulting to medium. Valid sizes are: ${this.validSizes.join(
          ", "
        )}`
      );
      size = "medium";
    }

    // Validate and set displayMode (default to "both" if invalid)
    // Support legacy showLabels option for backwards compatibility
    let displayMode =
      options.displayMode !== undefined
        ? options.displayMode
        : options.showLabels !== undefined
        ? options.showLabels
        : "both";

    // Handle legacy boolean values for backwards compatibility
    if (typeof displayMode === "boolean") {
      displayMode = displayMode ? "both" : "icon";
    }

    if (!this.validDisplayModes.includes(displayMode)) {
      console.warn(
        `Invalid displayMode: ${displayMode}. Defaulting to "both". Valid modes are: ${this.validDisplayModes.join(
          ", "
        )}`
      );
      displayMode = "both";
    }

    // Validate and set orientation (default to horizontal if invalid)
    let orientation = options.orientation || "horizontal";
    if (!this.validOrientations.includes(orientation)) {
      console.warn(
        `Invalid orientation: ${orientation}. Defaulting to horizontal. Valid orientations are: ${this.validOrientations.join(
          ", "
        )}`
      );
      orientation = "horizontal";
    }

    this.options = {
      container: options.container || document.body,
      position: position,
      orientation: orientation,
      theme: options.theme || "system", // Default to system preference
      size: size, // Toolbar size: small, medium, large
      draggable: options.draggable !== undefined ? options.draggable : false,
      snapToPosition:
        options.snapToPosition !== undefined ? options.snapToPosition : false,
      allowedSnapPositions: options.allowedSnapPositions || this.validPositions,
      collapsible:
        options.collapsible !== undefined ? options.collapsible : false,
      collapsed: options.collapsed || false,
      displayMode: displayMode, // Display mode: "icon", "label", "both"
      iconSize: options.iconSize || "medium",
      customClass: options.customClass || "",
      tools: options.tools || [],
      groups: options.groups || [],
      toolSets: options.toolSets || null, // Array of tool sets
      defaultToolSet: options.defaultToolSet || 0, // Index of default set
      showSetIndicator:
        options.showSetIndicator !== undefined
          ? options.showSetIndicator
          : true,
      // Built-in tools configuration
      builtInTools: {
        theme: options.builtInTools?.theme !== undefined ? options.builtInTools.theme : true,
        displayMode: options.builtInTools?.displayMode !== undefined ? options.builtInTools.displayMode : true,
        size: options.builtInTools?.size !== undefined ? options.builtInTools.size : true,
      },
      builtInToolsConfig: {
        theme: options.builtInToolsConfig?.theme || {},
        displayMode: options.builtInToolsConfig?.displayMode || {},
        size: options.builtInToolsConfig?.size || {},
      },
      themes: options.themes || ["light", "dark", "system"], // Available themes
      onToolClick: options.onToolClick || null,
      onStateChange: options.onStateChange || null,
      onThemeChange: options.onThemeChange || null,
      onPositionChange: options.onPositionChange || null,
      onToolSetChange: options.onToolSetChange || null,
      onSizeChange: options.onSizeChange || null,
      onOrientationChange: options.onOrientationChange || null,
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

    // Initialize BuiltInToolsManager
    this.builtInToolsManager = new BuiltInToolsManager(this);

    this._init();
  }

  _init() {
    this._createElements();
    this._registerBuiltInTools(); // Register built-in tools first
    this._registerTools();
    this._registerGroups();
    this._addNavigationButton(); // Add navigation button for initial set
    this._attachEventListeners();
    this._setupSystemThemeListener();
    this._applyTheme(this.options.theme); // Apply initial theme
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
    classes.push(`toolbar--size-${this.options.size}`);
    classes.push(`toolbar--icon-${this.options.iconSize}`);

    if (this.state.collapsed) classes.push("toolbar--collapsed");
    if (this.options.draggable) classes.push("toolbar--draggable");
    if (this.options.customClass) classes.push(this.options.customClass);

    return classes.join(" ");
  }

  // NOTE: This is empty now because we handle styles in CSS
  _applyStyles() {}

  /**
   * Register built-in tools (theme switcher, display mode switcher, size changer)
   * Now handled by BuiltInToolsManager
   */
  _registerBuiltInTools() {
    this.builtInToolsManager.initialize();
  }

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

    // Create and show overlay
    this._showOverlay();

    // Add compact drag class to make toolbar circular
    this.element.classList.add("toolbar--dragging-compact");

    // Fixed compact dimensions (60px x 60px)
    const compactWidth = 60;
    const compactHeight = 60;

    // Calculate mouse position relative to toolbar center
    const mouseRelativeX = e.clientX - rect.left - rect.width / 2;
    const mouseRelativeY = e.clientY - rect.top - rect.height / 2;

    // Store the offset from mouse to toolbar center
    this.state.dragOffset = {
      x: mouseRelativeX,
      y: mouseRelativeY,
    };

    // Position toolbar so that its center follows the mouse
    const centerX = e.clientX - parentRect.left - parent.clientLeft;
    const centerY = e.clientY - parentRect.top - parent.clientTop;

    const newLeft = centerX - compactWidth / 2;
    const newTop = centerY - compactHeight / 2;

    this.element.style.position = "absolute";
    this.element.style.left = `${newLeft}px`;
    this.element.style.top = `${newTop}px`;
    this.element.style.bottom = "auto";
    this.element.style.right = "auto";
    this.element.style.transform = "none";
    this.element.style.margin = "0";

    this.state.dragStart = { mouseX: e.clientX, mouseY: e.clientY };
    this.state.initialPos = { left: newLeft, top: newTop };
    this.state.compactSize = { width: compactWidth, height: compactHeight };

    // Calculate bounds based on compact dimensions
    this.state.bounds = {
      minX: 0,
      minY: 0,
      maxX: parent.clientWidth - compactWidth,
      maxY: parent.clientHeight - compactHeight,
    };

    // Show snap hints if snap mode is enabled
    if (this.options.snapToPosition) {
      this._showSnapHints();
    }

    const onMouseMove = this._onDragMove.bind(this);
    const onMouseUp = () => {
      this.state.isDragging = false;

      // Cancel any pending animation frame
      if (this._dragRaf) {
        cancelAnimationFrame(this._dragRaf);
        this._dragRaf = null;
      }

      // Hide overlay
      this._hideOverlay();

      // Remove compact drag class to restore normal appearance
      this.element.classList.remove("toolbar--dragging-compact");

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

    // Use requestAnimationFrame for smoother dragging
    if (this._dragRaf) {
      cancelAnimationFrame(this._dragRaf);
    }

    this._dragRaf = requestAnimationFrame(() => {
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
    });
  }

  /**
   * Create and show overlay
   */
  _showOverlay() {
    if (this.overlay) return; // Already exists

    this.overlay = document.createElement("div");
    this.overlay.className = "toolbar--overlay";
    document.body.appendChild(this.overlay);
  }

  /**
   * Hide and remove overlay
   */
  _hideOverlay() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
      this.overlay = null;
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
    const hints = this.snapHintsContainer.querySelectorAll(
      ".toolbar__snap-hint"
    );

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
      forceDisplayMode: tool.forceDisplayMode || null, // "icon", "label", or null
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
  /**
   * Apply theme to document body
   */
  _applyTheme(theme) {
    // Get effective theme (resolve 'system' to actual theme)
    let effectiveTheme = theme;
    if (theme === "system" && window.matchMedia) {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    // Apply theme to document body
    document.body.setAttribute("data-theme", effectiveTheme);

    // Also apply to toolbar element if it exists
    if (this.element) {
      this.element.setAttribute("data-theme", effectiveTheme);
    }
  }

  setTheme(theme) {
    const validThemes = this.options.themes;
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

    // Apply theme to document
    this._applyTheme(theme);

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
   * Set the toolbar size dynamically
   * @param {string} size - 'small', 'medium', 'large', or 'xlarge'
   */
  setSize(size) {
    if (!this.validSizes.includes(size)) {
      console.warn(
        `Invalid size: ${size}. Valid sizes are: ${this.validSizes.join(", ")}`
      );
      return;
    }

    const previousSize = this.options.size;
    this.options.size = size;

    // Remove old size class
    this.element.classList.remove(`toolbar--size-${previousSize}`);
    // Add new size class
    this.element.classList.add(`toolbar--size-${size}`);

    this.eventEmitter.emit("size:change", {
      size: size,
      previousSize: previousSize,
    });

    if (this.options.onSizeChange) {
      this.options.onSizeChange(size);
    }
  }

  /**
   * Get the current size setting
   * @returns {string} Current size ('small', 'medium', 'large', or 'xlarge')
   */
  getSize() {
    return this.options.size;
  }

  /**
   * Cycle to the next size in the sequence
   */
  nextSize() {
    const currentIndex = this.validSizes.indexOf(this.options.size);
    const nextIndex = (currentIndex + 1) % this.validSizes.length;
    this.setSize(this.validSizes[nextIndex]);
  }

  /**
   * Cycle to the previous size in the sequence
   */
  previousSize() {
    const currentIndex = this.validSizes.indexOf(this.options.size);
    const prevIndex =
      (currentIndex - 1 + this.validSizes.length) % this.validSizes.length;
    this.setSize(this.validSizes[prevIndex]);
  }

  /**
   * Set toolbar orientation
   * @param {string} orientation - "horizontal" or "vertical"
   */
  setOrientation(orientation) {
    if (!this.validOrientations.includes(orientation)) {
      console.warn(
        `Invalid orientation: ${orientation}. Valid orientations are: ${this.validOrientations.join(
          ", "
        )}`
      );
      return;
    }

    const previousOrientation = this.options.orientation;
    this.options.orientation = orientation;

    // Remove old orientation class
    this.element.classList.remove(`toolbar--${previousOrientation}`);
    // Add new orientation class
    this.element.classList.add(`toolbar--${orientation}`);

    // Update tooltip positioning for all tools
    this._updateTooltipPositions();

    this.eventEmitter.emit("orientation:change", {
      orientation: orientation,
      previousOrientation: previousOrientation,
    });

    if (this.options.onOrientationChange) {
      this.options.onOrientationChange(orientation);
    }
  }

  /**
   * Get the current orientation setting
   * @returns {string} Current orientation ('horizontal' or 'vertical')
   */
  getOrientation() {
    return this.options.orientation;
  }

  /**
   * Toggle between horizontal and vertical orientation
   */
  toggleOrientation() {
    const newOrientation =
      this.options.orientation === "horizontal" ? "vertical" : "horizontal";
    this.setOrientation(newOrientation);
  }

  /**
   * Set display mode for toolbar buttons
   * @param {string} mode - "icon", "label", or "both"
   */
  setDisplayMode(mode) {
    // Handle legacy boolean values for backwards compatibility
    if (typeof mode === "boolean") {
      mode = mode ? "both" : "icon";
    }

    if (!this.validDisplayModes.includes(mode)) {
      console.warn(
        `Invalid displayMode: ${mode}. Valid modes are: ${this.validDisplayModes.join(
          ", "
        )}`
      );
      return;
    }

    this.options.displayMode = mode;

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

    // Remove all label-related classes
    this.toolsContainer.classList.remove(
      "with_label",
      "label_only",
      "icon_only"
    );

    // Add appropriate class based on mode
    if (mode === "both") {
      this.toolsContainer.classList.add("with_label");
    } else if (mode === "label") {
      this.toolsContainer.classList.add("label_only");
    } else if (mode === "icon") {
      this.toolsContainer.classList.add("icon_only");
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
      if (mode !== "icon") {
        toggleButton.classList.add("toolbar__tool--active");
        toggleButton.setAttribute("aria-pressed", "true");
      } else {
        toggleButton.classList.remove("toolbar__tool--active");
        toggleButton.setAttribute("aria-pressed", "false");
      }
    }

    // Restore the state
    this.state.activeTool = currentActiveTool;

    this.eventEmitter.emit("displayMode:change", { displayMode: mode });
  }

  /**
   * Legacy method for backwards compatibility
   * @deprecated Use setDisplayMode instead
   */
  setShowLabels(mode) {
    return this.setDisplayMode(mode);
  }

  /**
   * Get current display mode
   * @returns {string} Current mode ("icon", "label", or "both")
   */
  getDisplayMode() {
    return this.options.displayMode;
  }

  /**
   * Legacy method for backwards compatibility
   * @deprecated Use getDisplayMode instead
   */
  getShowLabels() {
    return this.getDisplayMode();
  }

  /**
   * Cycle to the next display mode
   */
  nextDisplayMode() {
    const currentIndex = this.validDisplayModes.indexOf(
      this.options.displayMode
    );
    const nextIndex = (currentIndex + 1) % this.validDisplayModes.length;
    this.setDisplayMode(this.validDisplayModes[nextIndex]);
  }

  /**
   * Legacy method for backwards compatibility
   * @deprecated Use nextDisplayMode instead
   */
  nextShowLabelsMode() {
    return this.nextDisplayMode();
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

    // Re-register built-in tools first (so they stay visible across tool sets)
    this._registerBuiltInTools();

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

    // Determine effective display mode for this tool
    const effectiveMode = tool.forceDisplayMode || this.options.displayMode;

    // Render icon based on effective display mode
    if (tool.icon && (effectiveMode === "icon" || effectiveMode === "both")) {
      const icon = document.createElement("span");
      icon.className = "toolbar__tool-icon";
      icon.innerHTML = Toolbar._resolveIcon(tool.icon);
      button.appendChild(icon);
    }

    // Render label based on effective display mode
    if (tool.label && (effectiveMode === "label" || effectiveMode === "both")) {
      const label = document.createElement("span");
      label.className = "toolbar__tool-label";
      label.textContent = tool.label;
      button.appendChild(label);
    }

    // Add special class if tool has forced display mode
    if (tool.forceDisplayMode) {
      button.classList.add(`toolbar__tool--force-${tool.forceDisplayMode}`);
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
   * Helper to determine best tooltip position based on toolbar location and orientation
   */
  _determineTooltipPosition() {
    const pos = this.options.position;
    const orientation = this.options.orientation;

    // For vertical toolbars, prefer left/right positioning
    if (orientation === "vertical") {
      if (pos.includes("left")) return "right";
      if (pos.includes("right")) return "left";
      // If toolbar is centered or floating, use auto with vertical preference
      return "auto-vertical";
    }

    // For horizontal toolbars, prefer top/bottom positioning
    if (pos.includes("bottom")) return "top";
    if (pos.includes("top")) return "bottom";
    if (pos.includes("left")) return "right";
    if (pos.includes("right")) return "left";
    return "auto"; // Default or floating
  }

  /**
   * Update tooltip positions for all elements when orientation changes
   * @private
   */
  _updateTooltipPositions() {
    const newPosition = this._determineTooltipPosition();

    // Update all tool buttons
    const toolButtons = this.element.querySelectorAll("[data-tooltip-text]");
    toolButtons.forEach((button) => {
      button.setAttribute("data-tooltip-position", newPosition);
    });

    // Update collapse button if it exists
    if (this.collapseButton) {
      this.collapseButton.setAttribute("data-tooltip-position", newPosition);
    }
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

    // Destroy built-in tools manager
    if (this.builtInToolsManager) {
      this.builtInToolsManager.destroy();
    }

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
