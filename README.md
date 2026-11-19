# DOMPP (DOM++)

**Build fast, native UIs without leaving the DOM.** DOMPP (DOM plus plus) enhances real browser nodes with chainable setters, optional reactivity, and a lightweight JSX-compatible builder engine — no virtual DOM, no compiler requirement, no wrapper objects.

> DOM extended with small, explicit, chainable methods.

## Background

DOM++ is a slice of a larger effort: **the-future-of-the-browser**, a browser runtime exploration (Rust, V8, and more) that aims to enhance the DOM itself so capabilities like reactive components, chainable setters, and fragments become native. It is meant to answer two questions:

- What if the DOM was already reactive?
- What DOM API do we actually need?

The hope is that this work can also serve as a proposal to MDN and the web platform. DOM++ itself is a preview of how those new APIs might be used.
If you like the simplicity of vanilla DOM but want a better developer experience, DOMPP gives you predictable, direct mutation with modern ergonomics.

## Why DOMPP

- **Native-first**: works with real `Element`, `DocumentFragment`, and existing/server-rendered HTML.
- **Deterministic updates**: you mutate exactly what you mean — no hidden diff/reconciliation layer.
- **Progressive by design**: start with setters, add state/signals/builders only where needed.
- **Tiny mental model**: chainable APIs, explicit behavior, minimal runtime surface.
- **Flexible rendering**: direct DOM enhancement, component boundaries via `createComponent`, and optional JSX syntax.
- **Adoption-friendly**: enhance existing markup, integrate incrementally, or build from scratch.

## Install

```bash
npm install @dimpandu/domplusplus
```

## Quick Start

```js
import { createDOMPP } from "@dimpandu/domplusplus";

createDOMPP(); // Node/tests; in browsers the default entry also installs globals

const card = document
  .createElement("div")
  .setStyles({ padding: "20px", background: "#111", color: "#fff", borderRadius: "12px" })
  .setChildren(
    document.createElement("h1").setText("Hello DOM++"),
    document.createElement("button").setText("Click me").setEvents({
      click() {
        alert("Built with DOM++");
      },
    })
  );

document.body.append(card);
```

## Core APIs

### Chainable DOM setters

All setters return the element for fluent composition:

| Method | Purpose |
|--------|---------|
| `setText(text \| fn)` | Set text content (static or reactive) |
| `setChildren(...nodes)` | Replace children with nodes, fragments, or arrays |
| `setStyles(obj)` | Apply inline style updates |
| `setAttributes(obj)` | Set attributes on the element |
| `setEvents(obj)` | Attach/replace event listeners |

### Progressive enhancement

Adopt and enhance existing (server-rendered or static) markup in place:

```js
const card = document.createElement(document.getElementById("server-card"));
card.setChildren(
  document.createElement("h3").setText("Adopted title"),
  document.createElement("button")
    .setText("Increment")
    .setEvents({ click() { count++; card.rerender(); } })
);
```

Attach behavior to server-rendered or static HTML without rebuilding it.

## Builder Layer (Infrastructure)

DOM++ is built on top of a small builder layer (`elementBuilder`, `componentBuilder`) that handles descriptor-based construction and local reconciliation. This layer is infrastructure used internally by the enhanced `document` APIs — it is not the primary public API.

```js
import { createBuilders } from "@dimpandu/domplusplus/builders";
const builders = createBuilders(document);
```

The public API surface is the enhanced `document`:

- `document.createElement(tag, props, ...children)` — create or adopt an element (with builders under the hood)
- `document.createComponent((rerender) => tree)` — stateful component boundary with `.rerender()`
- `document.createDocumentFragment(...children)` — flat child array (fragment)
- `document.createElement("fragment")` — wrapper fragment element

Entry points:

- `@dimpandu/domplusplus` — installs DOM++ APIs + builders (browser auto-installs `window.DOMPP`)
- `@dimpandu/domplusplus/builders` — builders only

Entry points:
- `@dimpandu/domplusplus` — install DOMPP APIs + builders
- `@dimpandu/domplusplus/builders` — builders

## JSX (Optional)

DOM++ enhances `document.createElement` and `document.createDocumentFragment`, so they can be used directly as JSX factories. No custom factory function is needed.

```jsx
/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

const card = (
  <div class="card" style={{ color: "tomato" }}>
    <h2>DOMPP</h2>
    <p>Browser-native runtime exploration</p>
  </div>
);
```

For SVG elements, use `document.createElementNS` via a thin wrapper or set the namespace in the factory. See `examples/03-jsx-and-adoption/` for a working example.

## Examples (11)

The `examples/` directory contains 7 progressive, runnable examples:

1. **01-direct-dom** — native DOM nodes with chainable setters (`setText`, `setAttributes`, `setStyles`, `setEvents`, `setChildren`).
2. **02-components-mvvm** — components with explicit `.rerender()` and ViewModel-driven state.
3. **03-jsx-and-adoption** — JSX syntax and adopting existing markup in place.
4. **04-dynamic-lists** — conditional rendering and keyed lists with identity preservation.
5. **05-fragments-and-arrays** — multi-root fragments and array-returning components.
6. **06-safe-by-default** — built-in guards against dangerous attributes and protocols.
7. **07-capstone-mini-app** — combining components, state, lists, and fragments in one app.\n8. **08-local-stateful-subtree** — a stateless outer view with an embedded stateful component.\n9. **09-add-remove-subtree** — dynamically mount and unmount subtrees.\n10. **10-adopt-server-markup** — adopt existing server-rendered markup, then rerender reactively.
11. **11-guided-tour** — a guided tour from direct DOM control to reactive components, dynamic structure, composition, and adoption.

Browse: `examples/` or run locally and open `http://localhost:5173`.

## Experiments

`examples/_experiments/` contains experimental engine and adapter work (JSX, fragments, components, adoption, and guided tours). It is not part of the stable example set.

## Local Development

```bash
git clone https://github.com/dimaspandu/dompp.git
cd dompp
npm install
npm run dev
```

Open `http://localhost:5173`. Examples run live with source viewers.

## Testing

```bash
npm test
npm run test:browser
```

## Design Principles

- Explicit over magical behavior
- Native platform first
- No virtual DOM
- No hidden reconciliation
- No compiler required
- Minimal runtime surface area
- Predictable mutation flow
- Optional reactivity

## Documentation

- Architecture and diagrams: `docs/architecture/README.md`
- Live docs: https://dompp.digital/

## Status

DOMPP is experimental and under active iteration. APIs may evolve.

## Contributing

Contributions are welcome. Please read `CONTRIBUTING.md` before submitting large architectural changes.

## License

MIT License. Copyright (c) Dimas Pandu Pratama.