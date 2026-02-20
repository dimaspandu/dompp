# Addons Module

The `src/addons` directory contains optional ergonomics for DOMPP.

Addons are intentionally separated from the core so the runtime can stay minimal and mutation-focused.

---

## Philosophy

Addons should remain:

* Small
* Predictable
* Side-effect free
* Close to platform behavior

If a utility changes mental models or introduces hidden behavior, it does not belong here.

---

## Included Addon

Currently this module includes:

* `vquery.addon.js`
* `reconcile.addon.js`

It exports two utilities:

* `$` for safe single-element selection
* `v` for concise element creation
* `installDomppReconcile` for diff/patch-style set* reconciliation

---

## API

### `$(selectorOrElement)`

Returns:

* `document.querySelector(selector)` when a string is provided
* the same element when an `Element` is provided

Behavior:

* Throws `Error("Element not found")` when the query fails
* Returns native elements, not wrappers

```js
import { $ } from "../../src/addons/vquery.addon.js";

const app = $("#app");
```

This fail-fast behavior prevents silent `null` propagation.

---

### `v(tag)`

A shorthand for `document.createElement(tag)`.

```js
import { v } from "../../src/addons/vquery.addon.js";

const button = v("button").setText("Click");
```

`v` does not add enhancement logic. It only forwards to the browser API.

---

## Installation and Usage

Addons are opt-in.

1. Install DOMPP core methods first.
2. Import addon utilities where needed.

```js
import "../../src/index.js";
import { $, v } from "../../src/addons/vquery.addon.js";

$("#app").setChildren(
  v("h2").setText("Count: 0"),
  v("button").setText("Increment")
);
```

---

## Non-Goals

The addons layer should not become:

* A wrapper framework
* A multi-element query abstraction
* A policy-heavy utility set

Addons exist to reduce boilerplate, not to hide DOM behavior.

---

## Reconcile Addon

`reconcile.addon.js` adds opt-in patch behavior without virtual DOM.

```js
import "../../src/index.js";
import { installDomppReconcile } from "../../src/addons/reconcile.addon.js";

installDomppReconcile({ overrideSetters: true });
```

When `overrideSetters` is `true`:

* `setChildren(...)` patches child nodes instead of total `replaceChildren(...)`
* `setStyles(...)` only applies changed style keys and unsets removed keys
* `setAttributes(...)` only applies changed attrs and removes missing keys
* `setEvents(...)` removes stale listeners and keeps stable handlers

`setChildren(...)` also supports an options object:

* `setChildren(...nodes, { matchById: true })`

When enabled, element children with unique `id` are matched against existing DOM children by id and reused.

Explicit methods are always available:

* `patchText(...)`
* `patchChildren(...)`
* `patchStyles(...)`
* `patchAttributes(...)`
* `patchEvents(...)`
