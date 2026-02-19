# DOMPP

DOMPP is a lightweight experimental UI engine built directly on top of the browser DOM without relying on a virtual DOM or heavyweight frameworks.

The project focuses on understanding and implementing the fundamental primitives required to build modern user interfaces while maintaining full control over performance, memory usage, and update behavior.

DOMPP is intentionally minimal and designed as a foundation for exploring fine-grained reactivity and low-level rendering strategies.

---

## Documentation Index

Use this index to jump directly to module and example docs:

* [Root Overview](./README.md)
* [DOM Module](./src/dom/README.md)
* [Reactive Module](./src/reactive/README.md)
* [Addons](./src/addons/README.md)
* [Example: Minimal Counter](./examples/minimal-counter/README.md)
* [Example: Mini Post](./examples/mini-post/README.md)
* [Example: Reactive Counter](./examples/reactive-counter/README.md)
* [Example: Stateful Counter](./examples/stateful-counter/README.md)
* [Example: VQuery Counter](./examples/vquery-counter/README.md)
* [Proposal: DOM Extension for ECMAScript](./docs/ECMASCRIPT_DOM_EXTENSION_PROPOSAL.md)

---

## Goals

The primary goals of this project are:

* Explore reactive architecture from first principles
* Reduce abstraction while improving developer control
* Encourage predictable rendering behavior
* Minimize unnecessary DOM work
* Promote memory-aware patterns
* Serve as a learning platform for engine-level design

This repository is not intended to compete with production frameworks. Instead, it exists to understand how such systems can be built.

---

## Proposed Advantages

DOM++ proposes a mutation model that stays consistent between initial render and updates.

### Consistent Setter API (Initial and Update)

The same setter methods are used in both phases:

* `setText(...)`
* `setChildren(...)`
* `setStyles(...)`
* `setAttributes(...)`
* `setEvents(...)`

This means you do not switch mental models between "first render" and "next update".  
For attributes specifically, you keep using `setAttributes(...)` in both cases.

### Simpler, More Declarative Tree Authoring

You can express DOM tree structure as chained mutations, making hierarchy easier to read.

Instead of:

```js
const root = document.createElement("html");
root.lang = "en";

const head = document.createElement("head");
const title = document.createElement("title");
title.appendChild(document.createTextNode("My Document"));
head.appendChild(title);

const body = document.createElement("body");
const header = document.createElement("h1");
header.appendChild(document.createTextNode("Header"));
const paragraph = document.createElement("p");
paragraph.appendChild(document.createTextNode("Paragraph"));
body.appendChild(header);
body.appendChild(paragraph);

root.appendChild(head);
root.appendChild(body);
```

Use:

```js
const HTML = document.createElement("html").setChildren(
  document.createElement("head").setChildren(
    document.createElement("title").setText("My Document")
  ),
  document.createElement("body").setChildren(
    document.createElement("h1").setText("Header"),
    document.createElement("p").setText("Paragraph")
  )
);
```

This keeps mutations explicit while reducing boilerplate.

---

## Project Structure

```
src/
 ├── dom/        Core DOM primitives and prototype extensions
 │    └── dompp.js
 │
 ├── reactive/   Reactive primitives (signals, stateful, scheduler)
 │    ├── signal.js
 │    ├── stateful.js
 │    └── scheduler.js
 │
 ├── addons/     Optional ergonomics
 │    └── vquery.addon.js
 │
 └── index.js    Entry point

examples/
 ├── serve.js           Dev server for running examples
 ├── mini-post/         Retained DOM post list with signals
 ├── minimal-counter/
 ├── reactive-counter/
 ├── stateful-counter/
 └── vquery-counter/
```

### Architecture Overview

DOMPP is intentionally layered to keep the core extremely small while allowing experimentation at higher levels.

**dom/**
Provides direct prototype extensions for deterministic DOM mutation.

**reactive/**
Contains signal-based primitives, element-local stateful bindings, and a scheduler for fine‑grained updates.

**addons/**
Optional helpers that improve developer ergonomics without polluting the core engine.

---

## Quick Start

DOMPP has zero dependencies and requires no build step. Serve the project root with any static HTTP server that supports ES modules.

A built-in dev server is included:

```bash
node examples/serve.js
```

Then open `http://localhost:3000` to browse the example index.

### Basic Usage

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

For reactive state, import the stateful addon:

```js
import { installDomppStateful } from "./src/reactive/stateful.js";

installDomppStateful();

const counter = document.createElement("span");
counter.setState({ count: 0 });
counter.setText(({ state }) => `Count: ${state.count}`);
```

---

## Examples

The examples directory demonstrates progressively more advanced usage:

* **minimal-counter**
  Direct DOM manipulation without reactive state.

* **reactive-counter**
  Demonstrates fine-grained updates powered by signals.

* **stateful-counter**
  Shows element-local state with automatic binding re-execution.

* **vquery-counter**
  Experiments with a query-style DOM helper API.

* **mini-post**
  A retained DOM post list combining signals with stateful bindings.

---

## Design Principles

DOMPP follows a small set of guiding principles:

### Explicit over magical

Behavior should be easy to trace and debug.

### Minimal surface area

Every primitive should justify its existence.

### Fine-grained updates

Update only what actually changes.

### Framework independence

The engine should not rely on compilers, proxies, or build steps.

### Deterministic rendering

Updates should execute in a predictable order with minimal hidden work.

### Performance awareness

Avoid unnecessary allocations, subscriptions, and rerenders.

---

## Status

DOMPP is experimental and under active exploration.

Breaking changes are expected as the architecture evolves.

The codebase favors clarity over completeness and is optimized for learning rather than production readiness.

---

## Contributing

Contributions are welcome, especially from developers interested in:

* Reactive systems
* Rendering strategies
* Scheduling models
* Memory management
* Engine architecture

Before submitting large changes, consider opening a discussion to align on direction.

When contributing:

* Prefer small, focused pull requests
* Keep primitives minimal
* Avoid adding abstraction without clear benefit
* Document non-obvious decisions
* Maintain readability

---

## Suggested Areas for Contribution

* Reactive dependency tracking improvements
* Smarter scheduling strategies
* Automatic resource cleanup
* Developer ergonomics
* Benchmarking
* Documentation

---

## Vision

Modern UI frameworks are powerful but often hide meaningful complexity behind layers of abstraction.

DOMPP asks a simple question:

**What is the minimum engine required to support modern UI patterns?**

By rebuilding these primitives from scratch, we gain a deeper understanding of how reactive interfaces truly work.

---

## License

[MIT](LICENSE.md) © Dimas Pandu Pratama
