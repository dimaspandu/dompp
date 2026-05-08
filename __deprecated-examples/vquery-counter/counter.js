/**
 * DOM++ Counter - VQuery Example
 *
 * Rendering model:
 * - Retained DOM
 * - Stable node references
 * - Direct mutation
 *
 * No virtual DOM.
 * No diffing.
 * No re-render cycles.
 */

import "../../src/index.js";
import { $, v } from "../../src/addons/vquery.addon.js";

let count = 0;

/**
 * Create nodes once.
 * References remain stable for the lifetime of the app.
 */
const title = v("h2").setText("Count: 0");

/**
 * Update only the mutated surface.
 * Avoid subtree replacement.
 */
function update() {
  title.setText(`Count: ${count}`);
}

/**
 * Single mount operation.
 * No repeated renders.
 */
$("#app").setChildren(

  title,

  v("button")
    .setText("Increment")
    .setEvents({
      click() {
        count++;
        update();
      }
    }),

  v("button")
    .setText("Decrement")
    .setEvents({
      click() {
        count--;
        update();
      }
    })
);
