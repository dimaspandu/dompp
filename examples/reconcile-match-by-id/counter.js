/**
 * DOM++ Reconcile Match By Id
 *
 * This example recreates fresh template nodes on each render.
 * The matchById option preserves DOM identity by unique id.
 */

import "../../src/index.js";
import { installDomppReconcile } from "../../src/addons/reconcile.addon.js";
import { installDomppStateful } from "../../src/reactive/stateful.js";

installDomppReconcile({ overrideSetters: true });
installDomppStateful();

const handleDecrement = ({ state }) => {
  state.count -= 1;
};

const handleIncrement = ({ state }) => {
  state.count += 1;
};

const app = document.getElementById("app")
  .setState({
    count: 0
  });

app.setChildren(({ state: { count }, setState }) => [
  document.createElement("h1")
    .setAttributes({ id: "counter-title" })
    .setStyles({
      backgroundColor: count % 2 === 0 ? "tomato" : null,
      color: count % 2 === 0 ? "#fff" : null
    })
    .setChildren(`Count: ${count}`),

  document.createElement("button")
    .setAttributes({
      id: "counter-decrement",
      type: "button",
      "data-action": "decrement"
    })
    .setChildren("-")
    .setEvents({ click: () => setState(handleDecrement) }),

  document.createElement("button")
    .setAttributes({
      id: "counter-increment",
      type: "button",
      "data-action": "increment"
    })
    .setChildren("+")
    .setEvents({ click: () => setState(handleIncrement) }),

  { matchById: true }
]);
