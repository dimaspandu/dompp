// Load DOMPP core methods before building any UI nodes.
import "./src/index.js";
// Load addons for reconcile patching and local state bindings.
import { installDomppReconcile } from "./src/addons/reconcile.addon.js";
import { installDomppStateful } from "./src/reactive/stateful.js";

// Enable reconcile mode first so stateful wrappers target patched setters.
installDomppReconcile({ overrideSetters: true });
// Enable local state and callback-based setter bindings.
installDomppStateful();

// Define updater functions for local element state.
const handleDecrement = ({ state }) => {
  state.count -= 1;
};

const handleIncrement = ({ state }) => {
  state.count += 1;
};

// Initialize local state on the parent container.
const app = document.getElementById("app")
  .setState({
    count: 0
  });

// Rebuild a UI template from local state on each update.
app.setChildren(({ state: { count }, setState }) => [
  // Recreate title template and reuse by id during patch.
  document.createElement("h1")
    .setAttributes({ id: "counter-title" })
    .setStyles({
      // Toggle highlight styles from local state.
      backgroundColor: count % 2 === 0 ? "tomato" : null,
      color: count % 2 === 0 ? "#fff" : null
    })
    // Print the latest local count.
    .setChildren(`Count: ${count}`),

  // Recreate decrement button template and reuse by id during patch.
  document.createElement("button")
    .setAttributes({
      id: "counter-decrement",
      type: "button",
      "data-action": "decrement"
    })
    .setChildren("-")
    // Mutate local state from the same parent element.
    .setEvents({ click: () => setState(handleDecrement) }),

  // Recreate increment button template and reuse by id during patch.
  document.createElement("button")
    .setAttributes({
      id: "counter-increment",
      type: "button",
      "data-action": "increment"
    })
    .setChildren("+")
    // Mutate local state from the same parent element.
    .setEvents({ click: () => setState(handleIncrement) }),

  // Instruct children patching to match element nodes by unique id.
  { matchById: true }
]);
