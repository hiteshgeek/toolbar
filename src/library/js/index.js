import { Toolbar } from "./components/toolbar/Toolbar.js";

export { Toolbar };

// Expose Toolbar class directly for IIFE build
if (typeof window !== "undefined") {
  window.Toolbar = Toolbar;
}
