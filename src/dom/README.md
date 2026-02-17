# DOM Module

The `src/dom` directory provides the **mutation layer** of DOMPP.

These utilities extend native browser elements with a minimal set of chainable methods designed to make DOM mutations more expressive while preserving the performance and semantics of the underlying platform.

The DOM module intentionally stays focused on mutation. Reactive behavior is introduced separately through addons such as `stateful` or the primitives inside `src/reactive`.

---

## Architectural Role

DOMPP is intentionally split into clear layers:

```
Reactive → decides WHEN updates happen
DOM → decides HOW mutations occur
```

The DOM module:

* Does not schedule work
* Does not track dependencies
* Does not implement reactivity

It performs fast, explicit mutations — nothing more.

This separation keeps the engine predictable, inspectable, and free from hidden behavior.

---

## Philosophy

### Extend, do not wrap

DOMPP augments `Element.prototype` rather than introducing wrapper objects.

Benefits:

* Zero additional allocation per node
* No proxy overhead
* Full browser compatibility
* Predictable performance

You are always working with real DOM elements.

---

### Chainable mutations

All helpers return `this`, enabling fluent construction patterns:

```js
document.createElement("button")
  .setText("Click")
  .setStyles({ padding: "8px" })
  .setEvents({ click: handler });
```

The goal is readability without sacrificing explicitness.

---

### Minimal API surface

Every method exists to eliminate repetitive boilerplate commonly encountered when mutating the DOM.

If a helper does not significantly improve clarity or ergonomics, it does not belong in this module.

---

### Deterministic mutations

DOMPP favors predictable operations over heuristic-driven behavior.

Helpers perform exactly what they describe:

* `setChildren` replaces
* `setText` assigns
* `setStyles` mutates
* `setAttributes` applies
* `setEvents` binds

No diffing.
No virtual DOM.
No observers.

Just direct mutation.

---

## Installation

Install the helpers once at app startup:

```js
import { installDompp } from "./dompp.js";
installDompp();
```

Most projects will instead import the root entry:

```js
import "../index.js";
```

Installation is **idempotent** — methods are only defined if they do not already exist, preventing prototype collisions.

---

## Available Methods

---

### `setText(text)`

Sets `textContent` on the element.

```js
el.setText("Hello");
```

**Why it exists:**

* Shorter than assigning `textContent`
* Chainable
* Explicit intent

---

### `setChildren(...children)`

Replaces all children using `replaceChildren`.

Strings are automatically converted into `TextNode` instances.

```js
container.setChildren(
  "Title",
  document.createElement("hr")
);
```

**Design notes:**

* Uses native APIs for maximum performance
* Avoids manual loops
* Prevents accidental node duplication

Best used during initial tree construction or when a full replacement is intentional.

For reactive updates, prefer mutating existing nodes instead of replacing subtrees.

---

### `setStyles(styles)`

Applies multiple inline styles via `Object.assign`.

```js
el.setStyles({
  display: "flex",
  gap: "8px"
});
```

**Why no class helpers?**

Class management introduces policy decisions (merge, toggle, dedupe).
DOMPP intentionally favors primitives over opinionated abstractions.

---

### `setAttributes(attrs)`

Sets or removes attributes based on value semantics:

| Value                    | Behavior        |
| ------------------------ | --------------- |
| false / null / undefined | removed         |
| true                     | empty attribute |
| other                    | stringified     |

```js
input.setAttributes({
  disabled: true,
  placeholder: "Email"
});
```

This removes the need for repetitive conditional logic.

---

### `setEvents(events)`

Attaches event listeners while safely replacing previous handlers.

```js
button.setEvents({
  click: onClick
});
```

**Internal behavior:**

* Handlers are stored on the element
* Reassigning automatically removes the old listener
* Prevents duplicate subscriptions

This helps eliminate a common source of memory leaks in dynamic interfaces.

---

## About Stateful Bindings

Reactive bindings such as:

```js
el.setText(({ state }) => `Count: ${state.count}`);
```

are **not part of the core DOM module**.

They are provided by the `stateful` addon, which layers reactive behavior on top of these primitives without modifying their responsibilities.

This keeps the core mutation engine small and stable while allowing optional higher-level capabilities.

---

## When to Use This Module

Use the DOM module when you want:

* Direct control over rendering
* Zero framework overhead
* Predictable mutation behavior
* A highly inspectable UI architecture
* A solid foundation for building reactive layers

Avoid it if you need:

* Template compilation
* SSR abstractions
* Large ecosystem tooling
* Opinionated state orchestration

DOMPP intentionally stays small.

---

## Contributor Guidelines

### Keep it minimal

Do not add helpers for convenience alone.

---

### Avoid policy

Prefer primitives over abstractions that enforce usage patterns.

---

### Preserve native behavior

Extensions must never break expected DOM semantics.

---

### Optimize for clarity

A contributor should understand the implementation in minutes, not hours.

---

### Be cautious with prototypes

Prototype changes affect every element in the document.

Additions must be:

* Safe
* Collision-resistant
* Broadly applicable

---

## Non-Goals

This module does **not** aim to:

* Replace modern frameworks
* Provide a templating system
* Hide the DOM behind abstractions
* Perform reactive tracking

Its only purpose is to make native DOM mutation slightly more ergonomic while remaining fully transparent.

---

## Summary

The DOM module represents the **mutation foundation** of DOMPP.

By separating mutation from scheduling and state tracking, the engine remains:

* Predictable
* Extremely small
* Easy to reason about
* Friendly to performance tuning

Think of it as a precision tool — not a framework.
