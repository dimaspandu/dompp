/**
 * DOM++ Reconcile Stateful Counter
 *
 * This example combines:
 * - local element state (setState)
 * - callback-based setter bindings
 * - reconcile patching with positional child matching
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

const title = document.createElement("h2");
const meta = document.createElement("small");

const decrementBtn = document.createElement("button")
  .setAttributes({ type: "button" })
  .setEvents({ click: () => app.setState(decrement) });

const incrementBtn = document.createElement("button")
  .setAttributes({ type: "button" })
  .setEvents({ click: () => app.setState(increment) });

const growStepBtn = document.createElement("button")
  .setAttributes({ type: "button" })
  .setChildren("Increase Step")
  .setEvents({ click: () => app.setState(growStep) });

const resetBtn = document.createElement("button")
  .setAttributes({ type: "button" })
  .setChildren("Reset")
  .setEvents({ click: () => app.setState(reset) });

app.setChildren(({ state }) => {
  title
    .setStyles({
      backgroundColor: state.count % 2 === 0 ? "tomato" : null,
      color: state.count % 2 === 0 ? "#fff" : null,
      padding: "8px 10px",
      borderRadius: "8px",
      width: "fit-content"
    })
    .setChildren(`Count: ${state.count}`);

  meta.setChildren(`Step: ${state.step}`);

  decrementBtn.setChildren(`-${state.step}`);
  incrementBtn.setChildren(`+${state.step}`);

  resetBtn.setAttributes({
    type: "button",
    disabled: state.count === 0 && state.step === 1
  });

  return [
    title,
    meta,
    decrementBtn,
    incrementBtn,
    growStepBtn,
    resetBtn
  ];
});
