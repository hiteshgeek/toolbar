/**
 * Toolbar - Modular Toolbar System
 * @version 1.0.4
 */

import { ToolbarEventEmitter } from "./ToolbarEmitter.js";
import { icons } from "../../utils/icons.js";
import Tooltip from "../tooltip/Tooltip.js"; // Import the Tooltip class
import { BuiltInToolsManager } from "./builtins/index.js"; // Import BuiltInToolsManager
import StorageManager from "../../utils/StorageManager.js"; // Import StorageManager

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

    // Initialize StorageManager for persisting settings
    const appName = options.appName || "toolbar";
    const storageKey = options.storageKey || "settings";
    this.storageManager = new StorageManager(appName, storageKey);

    // Load saved settings from localStorage using StorageManager
    const savedSettings = this.storageManager.load();

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

    // Validate and set size (prioritize: saved settings > explicit options > default)
    let size = savedSettings.size || options.size || "medium";
    if (!this.validSizes.includes(size)) {
      console.warn(
        `Invalid size: ${size}. Defaulting to medium. Valid sizes are: ${this.validSizes.join(
          ", "
        )}`
      );
      size = "medium";
    }

    // Validate and set displayMode (prioritize: saved settings > explicit options > default)
    // Support legacy showLabels option for backwards compatibility
    let displayMode =
      savedSettings.displayMode !== undefined
        ? savedSettings.displayMode
        : options.displayMode !== undefined
        ? options.displayMode
        : options.showLabels !== undefined
        ? options.showLabels
        : "both";

    // Force icon-only mode for small toolbar size to save space
    if (size === "small" && displayMode !== "icon") {
      console.info(
        "[Toolbar] Forcing icon-only display mode for small toolbar size to optimize space"
      );
      displayMode = "icon";
    }

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
      theme: savedSettings.theme || options.theme || "system", // Prioritize saved theme
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
      // Built-in tools configuration (used when adding built-in tools with { builtIn: "theme" })
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
      currentPage: 0,
      totalPages: 1,
      hasOverflow: false,
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
    this._registerTools(); // Register tools (includes built-in tools via { builtIn: "..." })
    this._registerGroups();
    this._addNavigationButton(); // Add navigation button for initial set
    this._attachEventListeners();
    this._setupSystemThemeListener();
    this._applyTheme(this.options.theme); // Apply initial theme

    // Check if we need pagination BEFORE rendering
    this._preCalculatePagination();

    this._render();

    // Apply overflow check immediately after render (synchronously)
    this._checkOverflow();
  }

  /**
   * Setup listener for system theme changes when theme is set to 'system'
   */
  _setupSystemThemeListener() {
    if (this.options.theme === "system" && window.matchMedia) {
      const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

      this.systemThemeListener = (e) => {
        // Double-check that we're still in system mode before applying changes
        if (this.options.theme !== "system") {
          console.warn(
            "[Toolbar] System theme change detected but theme is not set to 'system'. Ignoring."
          );
          return;
        }

        const detectedTheme = e.matches ? "dark" : "light";

        // Apply the new theme to the document and toolbar
        this._applyTheme("system");

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

    // Apply initial display mode classes
    if (this.options.displayMode === "both") {
      this.toolsContainer.classList.add("with_label");
    } else if (this.options.displayMode === "label") {
      this.toolsContainer.classList.add("label_only");
    } else if (this.options.displayMode === "icon") {
      this.toolsContainer.classList.add("icon_only");
    }

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
   * @deprecated No longer auto-called. Add built-in tools manually using { builtIn: "theme" } in tools array.
   * This method is kept for backward compatibility if someone calls it programmatically.
   */
  _registerBuiltInTools() {
    this.builtInToolsManager.initialize();
  }

  _registerTools() {
    // Register persistent tools from main tools array (if any)
    // These tools appear BEFORE tool set tools and persist across all sets
    if (this.options.tools && this.options.tools.length > 0) {
      this.options.tools.forEach((tool) => this.addTool(tool));
    }

    // If toolSets are defined, add tools from the current tool set
    if (this.options.toolSets && this.options.toolSets.length > 0) {
      const currentSet = this.options.toolSets[this.state.currentToolSet];
      if (currentSet && currentSet.tools) {
        currentSet.tools.forEach((tool) => this.addTool(tool));
      }
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

    // Add resize listener for responsive overflow detection
    this._resizeHandler = () => {
      clearTimeout(this._resizeTimeout);
      this._resizeTimeout = setTimeout(() => {
        this._checkOverflow();
      }, 150); // Debounce resize events
    };
    window.addEventListener("resize", this._resizeHandler);
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

    // Update tooltip positions based on new toolbar position
    this._updateTooltipPositions();
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
    // Handle built-in tool placeholder syntax: { builtIn: "theme" }
    if (tool.builtIn) {
      return this.addBuiltInTool(tool.builtIn, tool.config || {});
    }

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

  /**
   * Manually add a specific built-in tool
   * @param {string} toolKey - "theme", "displayMode", or "size"
   * @param {Object} config - Configuration for the built-in tool
   * @returns {string|null} Tool ID or null if failed
   */
  addBuiltInTool(toolKey, config = {}) {
    return this.builtInToolsManager.registerTool(toolKey, config);
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

    // Save theme to localStorage
    this._saveSettings();
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

    // Save size to localStorage
    this._saveSettings();
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

    // Save display mode to localStorage
    this._saveSettings();
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

    // Re-register tools and groups from new set (includes built-in tools)
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

    // Preserve navigation buttons if they exist
    const prevBtn = this.prevButton;
    const nextBtn = this.nextButton;
    if (prevBtn && prevBtn.parentNode) {
      prevBtn.parentNode.removeChild(prevBtn);
    }
    if (nextBtn && nextBtn.parentNode) {
      nextBtn.parentNode.removeChild(nextBtn);
    }

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

    // Restore navigation buttons if they were present
    if (prevBtn) {
      const wasVisible = prevBtn.style.display !== "none";
      this.toolsContainer.insertBefore(prevBtn, this.toolsContainer.firstChild);
      prevBtn.style.display = wasVisible ? "" : "none";
    }
    if (nextBtn) {
      const wasVisible = nextBtn.style.display !== "none";
      this.toolsContainer.appendChild(nextBtn);
      nextBtn.style.display = wasVisible ? "" : "none";
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

    // For vertical toolbars, ALWAYS use left/right positioning
    if (orientation === "vertical") {
      // Determine which side has more space
      if (pos.includes("left")) return "right"; // Toolbar on left, tooltip on right
      if (pos.includes("right")) return "left"; // Toolbar on right, tooltip on left
      // For center position, prefer right side
      return "right";
    }

    // For horizontal toolbars, ALWAYS use top/bottom positioning
    // Determine which side has more space
    if (pos.includes("bottom")) return "top"; // Toolbar at bottom, tooltip on top
    if (pos.includes("top")) return "bottom"; // Toolbar at top, tooltip on bottom
    // For center or side positions with horizontal orientation
    if (pos.includes("center")) return "top"; // Default to top for center
    // For left/right positions with horizontal orientation, still prefer top/bottom
    return "top";
  }

  /**
   * Update tooltip positions for all elements when orientation or position changes
   * @private
   */
  _updateTooltipPositions() {
    const newPosition = this._determineTooltipPosition();

    // Update all tool buttons
    const toolButtons = this.element.querySelectorAll("[data-tooltip-text]");
    toolButtons.forEach((button) => {
      // Update data attribute
      button.setAttribute("data-tooltip-position", newPosition);

      // Remove old position classes from CSS-based tooltips
      button.classList.remove(
        "tooltip-top",
        "tooltip-bottom",
        "tooltip-left",
        "tooltip-right"
      );

      // Add new position class if it's a CSS-based tooltip
      if (button.classList.contains("has-tooltip")) {
        button.classList.add(`tooltip-${newPosition}`);
      }

      // Update wrapper-based tooltips (with shortcuts)
      const wrapper = button.querySelector(".tooltip-wrapper");
      if (wrapper) {
        wrapper.classList.remove(
          "tooltip-top",
          "tooltip-bottom",
          "tooltip-left",
          "tooltip-right"
        );
        // Don't add the class here - it will be added when shown
      }
    });

    // Update collapse button if it exists
    if (this.collapseButton) {
      this.collapseButton.setAttribute("data-tooltip-position", newPosition);

      // Remove old position classes
      this.collapseButton.classList.remove(
        "tooltip-top",
        "tooltip-bottom",
        "tooltip-left",
        "tooltip-right"
      );

      // Add new position class
      if (this.collapseButton.classList.contains("has-tooltip")) {
        this.collapseButton.classList.add(`tooltip-${newPosition}`);
      }
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

  /**
   * Pre-calculate if pagination will be needed based on tool count
   * This runs before render to prevent initial overflow
   * @private
   */
  _preCalculatePagination() {
    const isHorizontal = this.options.orientation === "horizontal";

    // Get available space from window (entire screen)
    const availableSpace = isHorizontal ? window.innerWidth : window.innerHeight;

    // Max toolbar size: 85% of screen width (horizontal), 45% of screen height (vertical)
    // Using more conservative thresholds to trigger pagination earlier
    const maxToolbarSize = isHorizontal
      ? availableSpace * 0.85
      : availableSpace * 0.45;

    // Tool sizes based on toolbar size and display mode
    const toolSizes = {
      small: 32,
      medium: 40,
      large: 52,
    };

    // Gap sizes
    const gapSizes = {
      small: 6,
      medium: 12,
      large: 16,
    };

    const toolSize = toolSizes[this.options.size] || toolSizes.medium;
    const gap = gapSizes[this.options.size] || gapSizes.medium;

    // Count registered tools (excluding separators and groups)
    const toolCount = this.tools.size;

    // Estimate tool width based on display mode
    let estimatedToolWidth = toolSize;
    if (this.options.displayMode === "both") {
      // Icon + label + padding: roughly 2x the base size
      estimatedToolWidth = toolSize * 2.5;
    } else if (this.options.displayMode === "label") {
      // Label only: estimate average label width
      estimatedToolWidth = 100; // Average label width
    }

    // Estimate toolbar size: tools + gaps + some padding
    const estimatedToolbarSize =
      toolCount * estimatedToolWidth + (toolCount - 1) * gap + 40; // 40px for padding

    console.log("[PAGINATION PRE-CALC]", {
      availableSpace,
      maxToolbarSize,
      toolCount,
      estimatedToolWidth,
      estimatedToolbarSize,
      willOverflow: estimatedToolbarSize > maxToolbarSize,
      displayMode: this.options.displayMode,
      size: this.options.size,
    });

    // If estimated size exceeds max, enable pagination immediately
    if (estimatedToolbarSize > maxToolbarSize) {
      this.state.hasOverflow = true;
      this._enablePagination();
    }
  }

  /**
   * Check if toolbar has overflow and needs pagination
   * @private
   */
  _checkOverflow() {
    if (!this.toolsContainer || !this.element) return;

    const isHorizontal = this.options.orientation === "horizontal";

    // Get available space from window (entire screen)
    const availableSpace = isHorizontal ? window.innerWidth : window.innerHeight;

    // Get toolbar dimensions
    const toolbarSize = isHorizontal
      ? this.element.offsetWidth
      : this.element.offsetHeight;

    // Max toolbar size: 85% of screen width (horizontal), 45% of screen height (vertical)
    // Using more conservative thresholds to trigger pagination earlier
    const maxToolbarSize = isHorizontal
      ? availableSpace * 0.85
      : availableSpace * 0.45;

    // Check if overflow exists
    const hasOverflow = toolbarSize > maxToolbarSize;

    console.log("[OVERFLOW CHECK]", {
      availableSpace,
      maxToolbarSize,
      toolbarSize,
      hasOverflow,
      previousState: this.state.hasOverflow,
      willChange: hasOverflow !== this.state.hasOverflow,
    });

    // Always apply pagination if overflow is detected (even if state hasn't changed)
    // This handles the case where pre-calc set hasOverflow=true but couldn't apply pagination yet
    if (hasOverflow) {
      console.log("[OVERFLOW] Applying pagination");
      this.state.hasOverflow = true;
      this._enablePagination();
    } else if (this.state.hasOverflow) {
      // Only disable if we were previously in overflow state
      console.log("[OVERFLOW] Disabling pagination");
      this.state.hasOverflow = false;
      this._disablePagination();
    }
  }

  /**
   * Calculate maximum visible tools based on screen size and toolbar size
   * @private
   * @returns {number} Maximum number of visible tools
   */
  _calculateMaxVisibleTools() {
    const isHorizontal = this.options.orientation === "horizontal";

    // Get available space from window (entire screen)
    const availableSpace = isHorizontal ? window.innerWidth : window.innerHeight;

    // Max toolbar size: 85% of screen width (horizontal), 45% of screen height (vertical)
    // Using more conservative thresholds to trigger pagination earlier
    const maxToolbarSize = isHorizontal
      ? availableSpace * 0.85
      : availableSpace * 0.45;

    // Tool sizes based on toolbar size
    const toolSizes = {
      small: 32,
      medium: 40,
      large: 52,
    };

    // Gap sizes
    const gapSizes = {
      small: 6,
      medium: 12,
      large: 16,
    };

    const baseToolSize = toolSizes[this.options.size] || toolSizes.medium;
    const gap = gapSizes[this.options.size] || gapSizes.medium;

    // Calculate actual tool width based on display mode
    let toolWidth = baseToolSize;
    let usedMeasurement = false;

    // Always measure from actual tools if they exist (to account for forceDisplayMode)
    const allTools = this.toolsContainer.querySelectorAll(
      ".toolbar__tool:not(.toolbar__nav-btn)"
    );

    // Count separators in the toolbar
    const separators = this.toolsContainer.querySelectorAll(".toolbar__separator");
    const separatorCount = separators.length;
    const separatorWidth = 1; // 1px width
    const separatorMargin = 16; // 8px on each side = 16px total
    const separatorTotalWidth = separatorWidth + separatorMargin; // 17px per separator

    if (allTools.length > 0) {
      // Force reflow to ensure CSS has been applied
      void this.toolsContainer.offsetHeight;

      // Measure all tools and use the maximum width to be safe
      let maxToolWidth = 0;
      let minToolWidth = Infinity;
      const toolWidths = [];

      allTools.forEach((tool) => {
        // Force individual reflow
        void tool.offsetHeight;
        const width = tool.offsetWidth;
        toolWidths.push(width);
        if (width > maxToolWidth) {
          maxToolWidth = width;
        }
        if (width < minToolWidth) {
          minToolWidth = width;
        }
      });

      if (maxToolWidth > 0) {
        toolWidth = maxToolWidth;
        usedMeasurement = true;
        console.log("[CALCULATE MAX TOOLS] Tool widths:", toolWidths);
        console.log("[CALCULATE MAX TOOLS] Min/Max tool width:", minToolWidth, "/", maxToolWidth);
      }
    } else {
      // Fallback to estimates based on display mode
      if (this.options.displayMode === "both") {
        toolWidth = baseToolSize * 2.5;
      } else if (this.options.displayMode === "label") {
        toolWidth = 100;
      }
      console.log("[CALCULATE MAX TOOLS] Using estimated tool width:", toolWidth);
    }

    // Reserved space for navigation buttons (prev + next + gaps)
    const navButtonSpace = (baseToolSize + gap) * 2 + gap * 2;

    // Toolbar padding: 12px 20px = 40px horizontal total
    const toolbarPadding = 40;

    // Space taken by separators
    const separatorSpace = separatorCount * separatorTotalWidth;

    // Available space for tools (max toolbar size minus nav buttons, toolbar padding, and separators)
    const toolSpace = maxToolbarSize - navButtonSpace - toolbarPadding - separatorSpace;

    // Calculate how many tools fit (accounting for gaps between tools)
    const maxTools = Math.floor(toolSpace / (toolWidth + gap));

    console.log("[CALCULATE MAX TOOLS]", {
      availableSpace,
      maxToolbarSize,
      baseToolSize,
      gap,
      toolWidth,
      usedMeasurement,
      displayMode: this.options.displayMode,
      navButtonSpace,
      toolbarPadding,
      separatorCount,
      separatorSpace,
      toolSpace,
      maxTools: Math.max(3, maxTools),
    });

    return Math.max(3, maxTools); // Minimum 3 tools
  }

  /**
   * Enable pagination mode
   * @private
   */
  _enablePagination() {
    console.log("[ENABLE PAGINATION] Called");

    // Hide drag handle when pagination is active to save space
    if (this.dragHandle) {
      this.dragHandle.style.display = "none";
      console.log("[ENABLE PAGINATION] Hiding drag handle");
    }

    // Hide header if it becomes empty (only had drag handle)
    if (this.header) {
      // Check if header has any visible children besides the drag handle
      const visibleChildren = Array.from(this.header.children).filter(
        child => child !== this.dragHandle && child.style.display !== "none"
      );

      if (visibleChildren.length === 0) {
        this.header.style.display = "none";
        console.log("[ENABLE PAGINATION] Hiding empty header");
      }
    }

    // Create navigation buttons if they don't exist
    if (!this.prevButton) {
      console.log("[ENABLE PAGINATION] Creating navigation buttons");
      this._createNavigationButtons();
    }

    // Show navigation buttons
    if (this.prevButton) this.prevButton.style.display = "";
    if (this.nextButton) this.nextButton.style.display = "";

    // Apply pagination only if tools exist
    const toolElements = Array.from(
      this.toolsContainer.querySelectorAll(".toolbar__tool:not(.toolbar__nav-btn)")
    );

    console.log("[ENABLE PAGINATION] Tool count:", toolElements.length);

    if (toolElements.length > 0) {
      const maxVisible = this._calculateMaxVisibleTools();
      this.state.totalPages = Math.ceil(toolElements.length / maxVisible);
      this.state.currentPage = 0;

      console.log("[ENABLE PAGINATION]", {
        totalTools: toolElements.length,
        maxVisible,
        totalPages: this.state.totalPages,
        currentPage: this.state.currentPage,
      });

      this._updatePagination();
    } else {
      console.log("[ENABLE PAGINATION] No tools found in DOM yet");
    }
  }

  /**
   * Disable pagination mode
   * @private
   */
  _disablePagination() {
    // Show drag handle when pagination is disabled
    if (this.dragHandle) {
      this.dragHandle.style.display = "";
    }

    // Show header again when pagination is disabled
    if (this.header) {
      this.header.style.display = "";
    }

    // Hide navigation buttons
    if (this.prevButton) this.prevButton.style.display = "none";
    if (this.nextButton) this.nextButton.style.display = "none";

    // Show all tools
    const toolElements = this.toolsContainer.querySelectorAll(".toolbar__tool");
    toolElements.forEach((tool) => {
      tool.style.display = "";
    });

    // Show all separators again
    const separators = this.toolsContainer.querySelectorAll(".toolbar__separator");
    separators.forEach((separator) => {
      separator.style.display = "";
    });

    this.state.totalPages = 1;
    this.state.currentPage = 0;
  }

  /**
   * Create previous/next navigation buttons
   * @private
   */
  _createNavigationButtons() {
    // Create previous button
    this.prevButton = document.createElement("button");
    this.prevButton.className = "toolbar__nav-btn toolbar__nav-btn--prev";
    this.prevButton.innerHTML =
      this.options.orientation === "horizontal"
        ? Toolbar._resolveIcon("navigation.chevron_left")
        : Toolbar._resolveIcon("navigation.chevron_up");
    this.prevButton.setAttribute("aria-label", "Previous tools");
    this.prevButton.addEventListener("click", () => this._previousPage());

    // Create next button
    this.nextButton = document.createElement("button");
    this.nextButton.className = "toolbar__nav-btn toolbar__nav-btn--next";
    this.nextButton.innerHTML =
      this.options.orientation === "horizontal"
        ? Toolbar._resolveIcon("navigation.chevron_right")
        : Toolbar._resolveIcon("navigation.chevron_down");
    this.nextButton.setAttribute("aria-label", "Next tools");
    this.nextButton.addEventListener("click", () => this._nextPage());

    // Insert buttons
    this.toolsContainer.insertBefore(
      this.prevButton,
      this.toolsContainer.firstChild
    );
    this.toolsContainer.appendChild(this.nextButton);

    // Initially hide them
    this.prevButton.style.display = "none";
    this.nextButton.style.display = "none";
  }

  /**
   * Update pagination - show/hide tools based on current page
   * @private
   */
  _updatePagination() {
    const maxVisible = this._calculateMaxVisibleTools();
    const toolElements = Array.from(
      this.toolsContainer.querySelectorAll(
        ".toolbar__tool:not(.toolbar__nav-btn)"
      )
    );

    const startIdx = this.state.currentPage * maxVisible;
    const endIdx = startIdx + maxVisible;

    console.log("[UPDATE PAGINATION]", {
      maxVisible,
      totalTools: toolElements.length,
      currentPage: this.state.currentPage,
      totalPages: this.state.totalPages,
      startIdx,
      endIdx,
      visibleCount: endIdx - startIdx,
    });

    toolElements.forEach((tool, idx) => {
      if (idx >= startIdx && idx < endIdx) {
        tool.style.display = "";
      } else {
        tool.style.display = "none";
      }
    });

    // Hide all separators when pagination is active
    const separators = this.toolsContainer.querySelectorAll(".toolbar__separator");
    separators.forEach((separator) => {
      separator.style.display = "none";
    });

    // Update button states
    if (this.prevButton) {
      this.prevButton.disabled = this.state.currentPage === 0;
    }
    if (this.nextButton) {
      this.nextButton.disabled =
        this.state.currentPage >= this.state.totalPages - 1;
    }

    // After updating pagination, log the final toolbar width and tool details
    setTimeout(() => {
      const visibleTools = Array.from(
        this.toolsContainer.querySelectorAll(".toolbar__tool:not(.toolbar__nav-btn)")
      ).filter(tool => tool.style.display !== "none");

      const toolWidths = visibleTools.map(tool => ({
        width: tool.offsetWidth,
        label: tool.textContent.trim().substring(0, 20),
        classes: tool.className
      }));

      console.log("[UPDATE PAGINATION] Final toolbar width:", this.element.offsetWidth);
      console.log("[UPDATE PAGINATION] Visible tool count:", visibleTools.length);
      console.log("[UPDATE PAGINATION] Tool widths:", toolWidths);
      console.log("[UPDATE PAGINATION] Toolbar container width:", this.toolsContainer.offsetWidth);
    }, 0);
  }

  /**
   * Go to next page
   * @private
   */
  _nextPage() {
    if (this.state.currentPage < this.state.totalPages - 1) {
      this.state.currentPage++;
      this._updatePagination();
    }
  }

  /**
   * Go to previous page
   * @private
   */
  _previousPage() {
    if (this.state.currentPage > 0) {
      this.state.currentPage--;
      this._updatePagination();
    }
  }

  /**
   * Save current settings to localStorage using StorageManager
   * @private
   */
  _saveSettings() {
    const settings = {
      theme: this.options.theme,
      size: this.options.size,
      displayMode: this.options.displayMode,
    };
    this.storageManager.save(settings);
  }

  destroy() {
    // Remove system theme listener
    this._removeSystemThemeListener();

    // Remove resize listener
    if (this._resizeHandler) {
      window.removeEventListener("resize", this._resizeHandler);
      this._resizeHandler = null;
    }

    // Clear resize timeout
    if (this._resizeTimeout) {
      clearTimeout(this._resizeTimeout);
      this._resizeTimeout = null;
    }

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
