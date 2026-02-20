/**
 * DOM++ Reconcile Stateful Counter
 *
 * This example combines:
 * - local element state (setState)
 * - callback-based setter bindings
 * - id-based children reuse via matchById
 */

import "../../src/index.js";
import { installDomppReconcile } from "../../src/addons/reconcile.addon.js";
import { installDomppStateful } from "../../src/reactive/stateful.js";

installDomppReconcile({ overrideSetters: true });
installDomppStateful();

const increment = ({ state }) => {
  state.count += state.step;
};

const decrement = ({ state }) => {
  state.count -= state.step;
};

const growStep = ({ state }) => {
  state.step += 1;
};

const reset = ({ state }) => {
  state.count = 0;
  state.step = 1;
};

const app = document.getElementById("app")
  .setState({
    count: 0,
    step: 1
  });

app.setChildren(({ state, setState }) => [
  document.createElement("h2")
    .setAttributes({ id: "stateful-title" })
    .setStyles({
      backgroundColor: state.count % 2 === 0 ? "tomato" : null,
      color: state.count % 2 === 0 ? "#fff" : null,
      padding: "8px 10px",
      borderRadius: "8px",
      width: "fit-content"
    })
    .setChildren(`Count: ${state.count}`),

  document.createElement("small")
    .setAttributes({ id: "stateful-meta" })
    .setChildren(`Step: ${state.step}`),

  document.createElement("button")
    .setAttributes({ id: "btn-decrement", type: "button" })
    .setChildren(`-${state.step}`)
    .setEvents({ click: () => setState(decrement) }),

  document.createElement("button")
    .setAttributes({ id: "btn-increment", type: "button" })
    .setChildren(`+${state.step}`)
    .setEvents({ click: () => setState(increment) }),

  document.createElement("button")
    .setAttributes({ id: "btn-grow-step", type: "button" })
    .setChildren("Increase Step")
    .setEvents({ click: () => setState(growStep) }),

  document.createElement("button")
    .setAttributes({
      id: "btn-reset",
      type: "button",
      disabled: state.count === 0 && state.step === 1
    })
    .setChildren("Reset")
    .setEvents({ click: () => setState(reset) }),

  { matchById: true }
]);
