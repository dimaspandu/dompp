/**
 * DOM++ Reactive Counter
 *
 * Rendering model:
 * - Fine-grained reactivity
 * - Retained DOM
 * - Direct mutation
 *
 * No virtual DOM.
 * No reconciliation.
 * No component re-execution.
 */

import "../../src/index.js";
import { createSignal } from "../../src/reactive/signal.js";

// -------------------------------------
// State
// -------------------------------------

const [count, setCount] = createSignal(0);

// -------------------------------------
// Nodes
// -------------------------------------

const title = document
  .createElement("h2")
  .setText("Count: 0");

const incBtn = document
  .createElement("button")
  .setText("Increment")
  .setEvents({
    click() {
      setCount(count() + 1);
    }
  });

const decBtn = document
  .createElement("button")
  .setText("Decrement")
  .setEvents({
    click() {
      setCount(count() - 1);
    }
  });

// -------------------------------------
// Reactive binding
// -------------------------------------

count.subscribe(value => {
  title.setText(`Count: ${value}`);
});

// -------------------------------------
// Mount (single commit)
// -------------------------------------

document
  .getElementById("app")
  .setChildren(title, incBtn, decBtn);
