/**
 * vQuery (Vanilla Query)
 *
 * A minimal DOM helper inspired by the ergonomics of selector-based APIs,
 * but intentionally much smaller and without introducing a wrapper layer.
 *
 * IMPORTANT PHILOSOPHY:
 *
 * vQuery does NOT return a custom object.
 * It always returns the native DOM Element.
 *
 * This preserves:
 * - platform performance
 * - full browser compatibility
 * - zero abstraction cost
 *
 * WHY IS THIS AN ADDON?
 *
 * DOM++ is designed as a prototype enhancement library.
 * Query helpers are considered optional developer ergonomics,
 * not part of the core runtime.
 *
 * Projects that prefer direct DOM access can omit this file entirely.
 */


/**
 * $(selector | Element)
 *
 * Retrieves a DOM element using querySelector,
 * or returns the provided element unchanged.
 *
 * This function exists purely for convenience and readability.
 *
 * Example:
 *
 *   const app = $("#app");
 *
 * Instead of:
 *
 *   const app = document.querySelector("#app");
 *
 *
 * DESIGN DECISION:
 * Throws if the element is not found.
 *
 * WHY THROW?
 *
 * Silent failures create harder-to-debug issues later when
 * code attempts to operate on null.
 *
 * Failing early makes errors obvious during development.
 *
 * CONTRIBUTORS:
 * Do NOT convert this into a multi-element selector.
 * Returning NodeLists would change the mental model
 * and encourage jQuery-style patterns, which DOM++
 * intentionally avoids.
 */
export const $ = (selector) => {

  const el =
    typeof selector === "string"
      ? document.querySelector(selector)
      : selector;

  if (!el) {
    throw new Error("Element not found");
  }

  return el;
};


/**
 * v(tag)
 *
 * A thin alias for document.createElement.
 *
 * PURPOSE:
 * Reduce verbosity when constructing DOM trees.
 *
 * Example:
 *
 *   v("div").setText("Hello")
 *
 * Instead of:
 *
 *   document.createElement("div").setText("Hello")
 *
 *
 * WHY NOT INCLUDE THIS IN CORE?
 *
 * Some teams prefer explicit platform APIs.
 * Keeping this as an addon allows DOM++ to remain
 * minimally opinionated.
 *
 * IMPORTANT:
 * This function performs ZERO enhancements.
 * It simply forwards the call to the browser.
 *
 * Contributors should avoid adding behavior here.
 * Any hidden logic would violate the "no magic" principle.
 */
export const v = (tag) => document.createElement(tag);
