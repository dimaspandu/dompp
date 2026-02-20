/**
 * DOM++ Reconcile Counter
 *
 * This example demonstrates an opt-in patching mode where repeated
 * set* calls reconcile changes instead of full child replacement.
 */

import "../../src/index.js";
import { installDomppReconcile } from "../../src/addons/reconcile.addon.js";

installDomppReconcile({ overrideSetters: true });

let count = 0;

const app = document.getElementById("app");

const title = document.createElement("h2");
const status = document.createElement("small");
const row = document.createElement("div").setAttributes({ class: "row" });

const decBtn = document.createElement("button")
  .setAttributes({ type: "button", "data-action": "decrement" })
  .setText("-1");

const incBtn = document.createElement("button")
  .setAttributes({ type: "button", "data-action": "increment" })
  .setText("+1");

const resetBtn = document.createElement("button")
  .setAttributes({ type: "button", "data-action": "reset" })
  .setText("Reset");

row.setChildren(decBtn, incBtn, resetBtn);

function render() {
  title
    .setText(`Count: ${count}`)
    .setStyles({
      backgroundColor: count % 2 === 0 ? "tomato" : null,
      color: count % 2 === 0 ? "white" : null,
      padding: "8px 10px",
      borderRadius: "8px",
      width: "fit-content"
    });

  status.setText(
    count % 2 === 0
      ? "Even value: highlight is enabled."
      : "Odd value: highlight is removed."
  );

  resetBtn.setAttributes({
    disabled: count === 0,
    "aria-disabled": count === 0
  });

  // Repeated setChildren calls patch existing structure and only mutate differences.
  app.setChildren(title, status, row);
}

decBtn.setEvents({
  click() {
    count -= 1;
    render();
  }
});

incBtn.setEvents({
  click() {
    count += 1;
    render();
  }
});

resetBtn.setEvents({
  click() {
    count = 0;
    render();
  }
});

render();
