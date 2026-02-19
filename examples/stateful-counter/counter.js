// Install DOM++ (includes stateful extensions)
import "../../src/index.js";
import { installDomppStateful } from "../../src/reactive/stateful.js";
installDomppStateful();

/**
 * This example demonstrates element-local state.
 *
 * Key ideas:
 * - State is owned by the element
 * - Setters automatically re-run when state updates
 * - No reactive system required
 * - No subtree replacement
 */

const app = document.getElementById("app");

/**
 * Create a title with internal state.
 * Because setText receives a function,
 * it becomes reactive to state changes.
 */
const titleEl = document
  .createElement("h2")
  .setState({ count: 0 })
  .setText(({ state }) => `Count: ${state.count}`);

/**
 * Mutate the element's state.
 * Only dependent setters re-run.
 */
function update(action) {
  titleEl.setState(({ state }) => {
    state.count =
      action === "increment"
        ? state.count + 1
        : state.count - 1;
  });
}

/**
 * Attach nodes once.
 * Future updates mutate in place.
 */
app.setChildren(

  titleEl,

  document.createElement("button")
    .setText("Increment")
    .setEvents({
      click() {
        update("increment");
      }
    }),

  document.createElement("button")
    .setText("Decrement")
    .setEvents({
      click() {
        update("decrement");
      }
    })

);
