// Activate DOM++.
//
// This installs prototype extensions such as:
// - setText
// - setChildren
// - setStyles
// - setAttributes
// - setEvents
//
// IMPORTANT:
// This should be imported ONCE at application startup.
import "../../src/index.js";

/**
 * Minimal Counter Example
 *
 * This example demonstrates the core philosophy of DOM++:
 *
 * - Create DOM nodes once
 * - Mutate only what changes
 * - Never re-render subtrees
 * - Avoid unnecessary allocations
 *
 * This approach is commonly called a "retained DOM".
 */

let count = 0;

/**
 * Create the title element once.
 *
 * We keep a reference so it can be mutated later
 * without replacing the node.
 */
const titleEl = document
  .createElement("h2")
  .setText("Count: 0");

/**
 * Update function.
 *
 * Only the text node is mutated.
 * No elements are recreated.
 * No diffing is performed.
 */
function update() {
  titleEl.setText(`Count: ${count}`);
}

/**
 * Attach elements once to the root container.
 *
 * After this, the structure never changes -
 * only internal state does.
 */
document.getElementById("app").setChildren(

  titleEl,

  document.createElement("button")
    .setText("Increment")
    .setEvents({
      click() {
        count++;
        update();
      }
    }),

  document.createElement("button")
    .setText("Decrement")
    .setEvents({
      click() {
        count--;
        update();
      }
    })

);
