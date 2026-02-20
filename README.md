# DOMPP (DOM++)

DOMPP (read as DOM plus plus) is an experiment in ergonomic APIs on top of the native DOM.
The name "DOM++" is inspired by C++ naming style: DOM extended with small, explicit, chainable methods and no wrapper objects.

This project focuses on deterministic mutation primitives, fine-grained updates, and low abstraction overhead.

---

## Documentation Index

* [Root Overview](./README.md)
* [DOM Module](./src/dom/README.md)
* [Reactive Module](./src/reactive/README.md)
* [Addons](./src/addons/README.md)
* [Benchmark Suite](./benchmarks/README.md)
* [Example: Minimal Counter](./examples/minimal-counter/README.md)
* [Example: Mini Post](./examples/mini-post/README.md)
* [Example: Reactive Counter](./examples/reactive-counter/README.md)
* [Example: Stateful Counter](./examples/stateful-counter/README.md)
* [Example: VQuery Counter](./examples/vquery-counter/README.md)
* [Example: Reconcile Counter](./examples/reconcile-counter/README.md)
* [Example: Reconcile List Patterns](./examples/reconcile-list-patterns/README.md)
* [Example: Reconcile Match By Id](./examples/reconcile-match-by-id/README.md)
* [Example: Reconcile Stateful Counter](./examples/reconcile-stateful-counter/README.md)
* [Proposal: DOM Extension for ECMAScript](./docs/ECMASCRIPT_DOM_EXTENSION_PROPOSAL.md)

---

## Goals

* Explore UI engine architecture from first principles
* Keep rendering behavior explicit and predictable
* Reduce unnecessary DOM work and allocations
* Provide a minimal base for experiments in reactivity and scheduling

DOMPP is not intended to replace production frameworks.
It exists to understand and validate design tradeoffs.

---

## Native Web API Proposal Direction

Based on the proposal paper, DOMPP is also positioned as an experiment toward a possible native Web Platform API (via DOM/WHATWG standardization pathways, then MDN-style documentation).

Expected API documentation snippet (MDN-style format):

```md
## Element.prototype.setChildren()

The `setChildren()` method of `Element` replaces the element's children
with the provided nodes or strings, and returns the element itself.

### Syntax
element.setChildren(...children)

### Parameters
- `...children`
  - A sequence of `Node` or string values.

### Return value
- The same `Element` instance (for chaining).
```

Proposal semantics are documented in:
`docs/ECMASCRIPT_DOM_EXTENSION_PROPOSAL.md`

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
  index.js

examples/
  serve.js
  minimal-counter/
  mini-post/
  reactive-counter/
  stateful-counter/
  vquery-counter/
  reconcile-counter/
  reconcile-list-patterns/
  reconcile-match-by-id/
  reconcile-stateful-counter/
```

---

## Quick Start

Run examples:

```bash
node examples/serve.js
```

Open:

`http://localhost:3000`

---

## Addons Overview

### `stateful`

Adds element-local state and callback-based setter bindings.

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

---

## Example Snippets

Each snippet is intentionally short and highlights the core idea of that example.

### `minimal-counter`

```js
import "../../src/index.js";

let count = 0;
const titleEl = document.createElement("h2").setText("Count: 0");

function update() {
  titleEl.setText(`Count: ${count}`);
}
```

### `reactive-counter`

```js
import "../../src/index.js";
import { createSignal } from "../../src/reactive/signal.js";

const [count, setCount] = createSignal(0);
const title = document.createElement("h2").setText("Count: 0");

count.subscribe(value => {
  title.setText(`Count: ${value}`);
});
```

### `stateful-counter`

```js
import "../../src/index.js";
import { installDomppStateful } from "../../src/reactive/stateful.js";

installDomppStateful();

const titleEl = document.createElement("h2")
  .setState({ count: 0 })
  .setText(({ state }) => `Count: ${state.count}`);
```

### `vquery-counter`

```js
import "../../src/index.js";
import { $, v } from "../../src/addons/vquery.addon.js";

const title = v("h2").setText("Count: 0");

$("#app").setChildren(title);
```

### `mini-post`

```js
import "../../src/index.js";
import { createSignal } from "../../src/reactive/signal.js";

const [posts, setPosts] = createSignal([]);
const feed = document.createElement("div");

const postNode = document.createElement("div").setText("New post");
feed.prepend(postNode);
setPosts(prev => [{ id: Date.now(), text: "New post" }, ...prev]);
```

### `reconcile-counter`

```js
import "../../src/index.js";
import { installDomppReconcile } from "../../src/addons/reconcile.addon.js";

installDomppReconcile({ overrideSetters: true });

app.setChildren(title, status, row);
```

### `reconcile-list-patterns`

```js
installDomppReconcile({ overrideSetters: true });

appendNodes.push(createListItem("append"));
prependNodes.unshift(createListItem("prepend"));

idList.setChildren(...idNodes);
```

### `reconcile-match-by-id`

```js
installDomppReconcile({ overrideSetters: true });

const templates = buildTemplateNodes();
list.setChildren(...templates, { matchById: true });
```

### `reconcile-stateful-counter`

```js
installDomppReconcile({ overrideSetters: true });
installDomppStateful();

app.setChildren(({ state, setState }) => [
  document.createElement("h2").setChildren(`Count: ${state.count}`),
  document.createElement("button")
    .setChildren("+")
    .setEvents({ click: () => setState(({ state }) => { state.count += 1; }) }),
  { matchById: true }
]);
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

---

## License

[MIT](LICENSE.md) Copyright (c) Dimas Pandu Pratama
