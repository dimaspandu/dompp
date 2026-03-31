# DOMPP (DOM++)

DOMPP (read as DOM plus plus) is an experiment in ergonomic APIs on top of the native DOM.
The name "DOM++" is inspired by C++ naming style: DOM extended with small, explicit, chainable methods and no wrapper objects.

This project focuses on deterministic mutation primitives, fine-grained updates, and low abstraction overhead.
It is intentionally small and modular so that mutation, reactivity, reconciliation, and hydration can be studied independently.

---

## Documentation Index

* [Root Overview](./README.md)
* [DOM Module](./src/dom/README.md)
* [Reactive Module](./src/reactive/README.md)
* [Addons](./src/addons/README.md)

Note: Long-form proposal/paper docs are planned but not included in this repo yet.

Examples:

* [Minimal Counter](./examples/minimal-counter/README.md)
* [Mini Post](./examples/mini-post/README.md)
* [Reactive Counter](./examples/reactive-counter/README.md)
* [Stateful Counter](./examples/stateful-counter/README.md)
* [VQuery Counter](./examples/vquery-counter/README.md)
* [Reconcile Counter](./examples/reconcile-counter/README.md)
* [Reconcile Match By Id Ordered List](./examples/reconcile-match-by-id-ordered-list/README.md)
* [Reconcile Match By Id](./examples/reconcile-match-by-id/README.md)
* [Reconcile Stateful Counter](./examples/reconcile-stateful-counter/README.md)
* [Hydration Assimilation Counter](./examples/hydration-assimilation-counter/README.md)
* [Hydration Assimilation List](./examples/hydration-assimilation-list/README.md)
* [Hydration + Stateful Counter](./examples/hydration-stateful-counter/README.md)
* [Setter Callback Core](./examples/setter-callback-core/README.md)
* [Setter Callback Stateful](./examples/setter-callback-stateful/README.md)
* [DOMPP State Reconcile Demo](./examples/dompp-state-reconcile-demo/README.md)
* [DOMPP Step-by-Step Case Study](./examples/dompp-step-by-step-case-study/README.md)
* [DOMPP Step-by-Step Case Study JSX](./examples/dompp-step-by-step-case-study-jsx/README.md)

---

## Goals

* Explore UI engine architecture from first principles
* Keep rendering behavior explicit and predictable
* Reduce unnecessary DOM work and allocations
* Provide a minimal base for experiments in reactivity and scheduling

DOMPP is not intended to replace production frameworks.
It exists to understand and validate design tradeoffs.

---

## Core API

DOMPP adds a small set of chainable mutation helpers:

* `setText(...)`
* `setChildren(...)`
* `setStyles(...)`
* `setAttributes(...)`
* `setEvents(...)`

Basic usage:

```js
import { installDompp } from "./src/dom/dompp.js";

installDompp();

document.body.setChildren(
  document.createElement("div")
    .setText("Hello DOMPP")
    .setStyles({ color: "tomato" })
    .setAttributes({ id: "greeting" })
);
```

---

## Setter Callback Mode (Core)

Core DOMPP supports callback updaters for each setter. The callback receives the previous value and DOM context:

```js
const title = document.createElement("h2").setText("Count: 0");

// Later...

title.setText(({ text }) => text.replace("0", "1"));
```

Supported callbacks:

* `setText(({ text }) => ...)`
* `setStyles(({ styles }) => ...)`
* `setAttributes(({ attributes }) => ...)`
* `setEvents(({ events }) => ...)`
* `setChildren(({ childNodes }) => ...)`

This enables hydration/assimilation patterns without adding a reactive system.

---

## Addons Overview

DOMPP keeps the core small. Optional addons extend behavior without changing mutation semantics.

### `stateful`

Adds element-local state and reactive setter bindings:

```js
import "./src/index.js";
import { installDomppStateful } from "./src/reactive/stateful.js";

installDomppStateful();

const app = document.getElementById("app").setState({ count: 0 });

app.setChildren(({ state, setState }) => [
  document.createElement("h2").setText(`Count: ${state.count}`),
  document.createElement("button")
    .setText("Increment")
    .setEvents({ click: () => setState(({ state }) => { state.count += 1; }) })
]);
```

### `reconcile`

Adds patch-style updates and optional id-based matching:

```js
import "./src/index.js";
import { installDomppReconcile } from "./src/addons/reconcile.addon.js";

installDomppReconcile({ overrideSetters: true });

list.setChildren(...nodes, { matchById: true });
```

### `hydration`

Adds `hydrateChildren(recipe)` to assimilate existing DOM trees (SSR/static HTML) without recreating the subtree:

```js
import "./src/index.js";
import { installDomppHydration } from "./src/addons/hydration.addon.js";

installDomppHydration();

document.getElementById("counter").hydrateChildren(({ children }) => {
  const [countEl, decBtn, incBtn] = children;
  let count = Number(countEl.textContent || 0);

  return [
    countEl,
    decBtn.setEvents({ click: () => countEl.setText(--count) }),
    incBtn.setEvents({ click: () => countEl.setText(++count) })
  ];
});
```

### `vquery`

Small DOM helpers:

* `$(selectorOrElement)` for safe single-element selection
* `v(tag)` for concise element creation

---

## Project Structure

```text
src/
  dom/
    dompp.js
  reactive/
    signal.js
    stateful.js
    scheduler.js
  addons/
    vquery.addon.js
    reconcile.addon.js
    hydration.addon.js
  index.js

examples/
  serve.js
  minimal-counter/
  mini-post/
  reactive-counter/
  stateful-counter/
  vquery-counter/
  reconcile-counter/
  reconcile-match-by-id-ordered-list/
  reconcile-match-by-id/
  reconcile-stateful-counter/
  hydration-assimilation-counter/
  hydration-assimilation-list/
  hydration-stateful-counter/
  setter-callback-core/
  setter-callback-stateful/
```

---

## Quick Start (Examples)

Run the example server:

```bash
node examples/serve.js
```

Open:

`http://localhost:3000`

This auto-generates a list of examples.

---

## Example Snippets

Each snippet is intentionally short and highlights the core idea of that example.

### `setter-callback-core`

```js
import "../../src/index.js";

const title = document.createElement("h2").setText("Count: 0");

// Update using previous value without stateful addon
setInterval(() => {
  title.setText(({ text }) => `Count: ${Number(text.split(":")[1]) + 1}`);
}, 1000);
```

### `setter-callback-stateful`

```js
import "../../src/index.js";
import { installDomppStateful } from "../../src/reactive/stateful.js";

installDomppStateful();

const app = document.getElementById("app").setState({ n: 0 });

app.setChildren(({ state, setState }) => [
  document.createElement("h2").setText(`Count: ${state.n}`),
  document.createElement("button")
    .setText("+")
    .setEvents({ click: () => setState(({ state }) => { state.n += 1; }) })
]);
```

### `hydration-assimilation-counter`

```js
import "../../src/index.js";
import { installDomppHydration } from "../../src/addons/hydration.addon.js";

installDomppHydration();

document.getElementById("counter").hydrateChildren(({ children }) => {
  const [countEl, decBtn, incBtn] = children;
  let count = Number(countEl.textContent || 0);

  return [
    countEl,
    decBtn.setEvents({ click: () => countEl.setText(--count) }),
    incBtn.setEvents({ click: () => countEl.setText(++count) })
  ];
});
```

---

## Design Principles

* Explicit over magical behavior
* Minimal runtime surface area
* Fine-grained mutation
* Deterministic update flow
* Framework-independent architecture

---

## Status

DOMPP is experimental and under active iteration.
Breaking changes are expected while architecture decisions are validated.

---

## Contributing

Contributions are welcome, especially around:

* reactive architecture
* scheduling strategies
* memory behavior
* rendering performance
* documentation quality

Before large changes, open a discussion to align direction.

For practical setup, conventions, and expectations, see:

* [CONTRIBUTING](./CONTRIBUTING.md)

---

## License

[MIT](LICENSE.md) Copyright (c) Dimas Pandu Pratama
