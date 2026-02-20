// Load DOMPP core methods before building any UI nodes.
import "./src/index.js";
// Load the reconcile addon to patch repeated set* calls.
import { installDomppReconcile } from "./src/addons/reconcile.addon.js";

// Enable reconcile mode and override default set* behavior.
installDomppReconcile({ overrideSetters: true });

// Initialize mutable demo state.
let count = 0;

const handleDecrement = () => {
  // Decrease the state value.
  count -= 1;
  // Re-render immediately after mutating state.
  render();
};

const handleIncrement = () => {
  // Increase the state value.
  count += 1;
  // Re-render immediately after mutating state.
  render();
};

function component() {
  // Build the next UI tree in a fragment for a single mount/patch entry.
  return document.createDocumentFragment().setChildren(
    document.createElement("h1")
      .setStyles({
        // Apply highlight styles only for even count.
        backgroundColor: count % 2 === 0 ? "tomato" : null,
        color: count % 2 === 0 ? "#fff" : null
      })
      // Render the latest count text.
      .setChildren(`Count: ${count}`),

    document.createElement("button")
      // Declare stable button attributes.
      .setAttributes({ type: "button", "data-action": "decrement" })
      // Set visible button label.
      .setChildren("-")
      // Bind click handler for decrement action.
      .setEvents({ click: handleDecrement }),

    document.createElement("button")
      // Declare stable button attributes.
      .setAttributes({ type: "button", "data-action": "increment" })
      // Set visible button label.
      .setChildren("+")
      // Bind click handler for increment action.
      .setEvents({ click: handleIncrement })
  );
}

function render() {
  // Select the mount point.
  document.getElementById("app").setChildren(component());
  // Call setChildren on every render and let reconcile patch only differences.
}

// Perform the first render.
render();
