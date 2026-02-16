# DOM Module

The `src/dom` directory provides the **mutation layer** of DOMPP.

These utilities extend native browser elements with a small set of chainable methods designed to make DOM mutations more expressive while preserving the performance and semantics of the underlying platform.

This module does **not** implement reactivity.

Instead, it focuses purely on **deterministic DOM mutation** — making it the ideal companion to the reactive primitives found in `src/reactive`.

---

## Architectural Role

DOMPP is intentionally split into clear layers:

```
Reactive → decides WHEN updates happen
DOM → decides HOW mutations occur
```

The DOM module never schedules work and never tracks dependencies.

It simply performs fast, explicit mutations.

This separation keeps the engine predictable and prevents hidden behavior.

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

## Using DOM with Reactivity

A recommended pattern is to let signals trigger mutations:

```js
const [count, setCount] = createSignal(0);

const label = document.createElement("span");

count.subscribe(v => {
  label.setText(v);
});
```

The reactive layer schedules updates.
The DOM layer performs them.

No hidden coupling.

No magic bindings.

---

## When to Use This Module

Use the DOM module when you want:

* Direct control over rendering
* Zero framework overhead
* Predictable mutation behavior
* A highly inspectable UI architecture

Avoid it if you need:

* Template compilation
* SSR abstractions
* Large ecosystem tooling
* Built-in state orchestration

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
