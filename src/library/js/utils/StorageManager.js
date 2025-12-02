/**
 * StorageManager - Utility class for managing localStorage with app name support
 * @version 1.0.0
 */

export default class StorageManager {
  /**
   * Create a StorageManager instance
   * @param {string} appName - Application name for namespacing storage keys
   * @param {string} storageKey - Specific storage key for this data
   */
  constructor(appName = "toolbar", storageKey = "settings") {
    this.appName = appName;
    this.storageKey = storageKey;
    this.fullKey = `${appName}:${storageKey}`;
  }

  /**
   * Load settings from localStorage
   * @returns {Object} Saved settings object, or empty object if not found
   */
  load() {
    try {
      const saved = localStorage.getItem(this.fullKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn(
        `[StorageManager] Failed to load settings from localStorage (${this.fullKey}):`,
        error
      );
    }
    return {};
  }

  /**
   * Save settings to localStorage
   * @param {Object} data - Data to save
   * @returns {boolean} True if successful, false otherwise
   */
  save(data) {
    try {
      localStorage.setItem(this.fullKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn(
        `[StorageManager] Failed to save settings to localStorage (${this.fullKey}):`,
        error
      );
      return false;
    }
  }

  /**
   * Update specific fields in the stored settings
   * @param {Object} updates - Object with fields to update
   * @returns {boolean} True if successful, false otherwise
   */
  update(updates) {
    try {
      const current = this.load();
      const merged = { ...current, ...updates };
      return this.save(merged);
    } catch (error) {
      console.warn(
        `[StorageManager] Failed to update settings (${this.fullKey}):`,
        error
      );
      return false;
    }
  }

  /**
   * Get a specific field from stored settings
   * @param {string} key - Field key to retrieve
   * @param {*} defaultValue - Default value if field doesn't exist
   * @returns {*} Field value or default value
   */
  get(key, defaultValue = null) {
    const data = this.load();
    return data[key] !== undefined ? data[key] : defaultValue;
  }

  /**
   * Set a specific field in stored settings
   * @param {string} key - Field key to set
   * @param {*} value - Value to set
   * @returns {boolean} True if successful, false otherwise
   */
  set(key, value) {
    return this.update({ [key]: value });
  }

  /**
   * Remove settings from localStorage
   * @returns {boolean} True if successful, false otherwise
   */
  clear() {
    try {
      localStorage.removeItem(this.fullKey);
      return true;
    } catch (error) {
      console.warn(
        `[StorageManager] Failed to clear settings (${this.fullKey}):`,
        error
      );
      return false;
    }
  }

  /**
   * Check if settings exist in localStorage
   * @returns {boolean} True if settings exist
   */
  exists() {
    try {
      return localStorage.getItem(this.fullKey) !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the full storage key being used
   * @returns {string} Full storage key
   */
  getFullKey() {
    return this.fullKey;
  }

  /**
   * Static method to create a StorageManager instance
   * @param {string} appName - Application name
   * @param {string} storageKey - Storage key
   * @returns {StorageManager} New StorageManager instance
   */
  static create(appName, storageKey) {
    return new StorageManager(appName, storageKey);
  }
}
