# DOMPP (DOM++)

DOMPP (DOM plus plus) is a lightweight native DOM enhancement library focused on deterministic mutation, chainable APIs, optional reactivity, and JSX-compatible builders.

The name "DOM++" is inspired by C++ naming style:

> DOM extended with small, explicit, chainable methods.

DOMPP does not use a virtual DOM. It does not wrap elements in custom objects and does not require a compiler. It extends native DOM APIs with ergonomic setters while preserving direct access to the browser platform.

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
  .setStyles({ padding: "20px", background: "black", color: "white" })
  .setChildren(
    document.createElement("h1").setText("Hello DOM++"),
    document.createElement("button").setText("Click Me").setEvents({
      click() {
        alert("DOM++");
      },
    })
  );

document.body.append(card);
```

## Features Overview

### Chainable DOM Setters

All setters return the element for chaining:

| Method | Purpose |
|--------|---------|
| `setText(text \| fn)` | Set text content, optionally reactive |
| `setChildren(...nodes)` | Replace children with elements, fragments, arrays |
| `setStyles(obj)` | Apply CSS styles object |
| `setAttributes(obj)` | Set HTML attributes |
| `setEvents(obj)` | Attach event listeners |
| `setState(obj)` | Local reactive state, triggers reruns |
| `setEnhancement(fn)` | Progressive enhancement on existing DOM |
| `setFineGrained()` | Opt-in to fine-grained signal reactivity |

### Reactive State Runtime

```js
const counter = document
  .createElement("button")
  .setState({ count: 0 })
  .setText(({ state }) => `Count: ${state.count}`)
  .setEvents(({ state, setState }) => ({
    click() {
      setState({ count: state.count + 1 });
    },
  }));
```

State changes trigger microtask-flushed reruns of all reactive setters on that element.

### Fine-Grained Signals

```js
const [count, setCount] = document.createSignal(0);

const title = document
  .createElement("h1")
  .setFineGrained()
  .setText(() => count());
```

Only consumers of `count()` rerun. No global flush.

### Existing DOM Enhancement

```js
document.getElementById("counter-app").setEnhancement(({ childNodes }) => {
  childNodes[1].setEvents({
    click() {
      childNodes[0].setText("1");
    },
  });
});
```

Attaches behavior to server-rendered or static HTML without recreation.

### JSX Integration

DOMPP works with JSX via a custom factory. Use Babel Standalone with `/** @jsx d */` pragma:

```js
/** @jsx d */
function d(tag, props, ...children) {
  const svgTags = new Set([
    "svg", "circle", "path", "rect", "line", "polyline", "polygon", "ellipse",
    "g", "defs", "use", "symbol", "text", "tspan", "image", "foreignObject",
  ]);

  let node;
  if (tag === "fragment" || tag === "Fragment") {
    node = document.createDocumentFragment();
  } else if (svgTags.has(tag)) {
    node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  } else {
    node = document.createElement(tag);
  }

  if (props) {
    const { style, className, class: classAttr, on, ...attrs } = props;
    if (className || classAttr) node.setAttributes({ class: className || classAttr });
    if (style) node.setStyles(style);
    if (on) node.setEvents(on);
    if (Object.keys(attrs).length) node.setAttributes(attrs);
  }
  if (children.length) node.setChildren(...children.flat());
  return node;
}
```

See `examples/21-jsx-integration/` for a live JSX demo.

### Element & Component Builders (1.2.0)

Descriptor-based builders for direct, local DOM reconciliation. No virtual DOM diff engine, no separate renderer runtime.

```js
import { elementBuilder, componentBuilder } from "@dimpandu/domplusplus/builders";
```

#### elementBuilder

```jsx
/** @jsx elementBuilder */
elementBuilder("div", { class: "card" },
  elementBuilder("h1", {}, "Title"),
  elementBuilder("button", { onClick: () => console.log("click") }, "Click")
);
```

* `elementBuilder(tag, props, ...children)` — creates or adopts element
* `elementBuilder(existingNode, props, ...children)` — adopts existing DOM node
* `.reset()` — clears styles, attributes, children, events on struct and live node

#### componentBuilder

```jsx
/** @jsx elementBuilder */
const Counter = componentBuilder((rerender) => (
  <section className="card">
    <p>Count: {count}</p>
    <button onClick={() => rerender(() => { count += 1; })}>
      Increment
    </button>
  </section>
));

elementBuilder(document.getElementById("app"), null, Counter.render());
```

* `componentBuilder((rerender) => tree)` — stateful render boundary
* `.render()` — returns mounted node
* `.rerender(callback)` — runs callback, then `_patchFrom()` full replacement

Builder entry points:
* Default: `@dimpandu/domplusplus` (installs DOMPP APIs; exposes `createDOMPP`)
* Builders: `@dimpandu/domplusplus/builders`
* Builders only (no prototype/reactive wrapper installation): `@dimpandu/domplusplus/builders-minimal`

## Example Coverage

The `examples/` directory contains 35 progressive examples:

**Foundations (01-08)**
* 01 Basic Text — `setText()`
* 02 Basic Styles — `setStyles()`
* 03 Basic Attributes — `setAttributes()`
* 04 Basic Children — `setChildren()`
* 05 Basic Events — `setEvents()`
* 06 Mutation Consistency — unified setter patterns
* 07 Children vs ChildNodes — structural vs raw node access
* 08 Fragment Support — DocumentFragment usage

**Reactive Runtime (09-20)**
* 09 Reactive Counter — local `setState()` with reactive text/styles/attributes
* 10 Reactive Children — dynamic child trees from state
* 11 Reusable Stateful Elements — element reuse across parents
* 12 Cross-Element State — coordinated mutations via `setState()`
* 13 Existing DOM Enhancement — `setEnhancement()` progressive enhancement
* 14 Fine-Grained Signals — `createSignal()`, `setFineGrained()`
* 15 Enhancement + Signals — reactive progressive enhancement
* 16 State Equality Behavior — reference vs value equality
* 17 Nested Stateful Elements — independent nested state
* 18 Keyed List Behavior — stable keys for list reconciliation
* 19 DOM Identity Preservation — focus/selection preservation
* 20 Reactive Feed — prepend/append feed patterns

**JSX & Builders (21-35)**
* 21 JSX Integration — Babel Standalone, custom factory, all reactive features
* 22 Element Builder — descriptor API, direct setters, JSX factory
* 23 Component Builder — `componentBuilder`, `render()`, `rerender(callback)`
* 24 MVVM Component Builder — Model/ViewModel/View layering
* 25 Conditional Rendering — `null` children, dynamic presence
* 26 Keyed List — reconciliation with stable keys
* 27 Fragments and Arrays — fragment boundaries, array components
* 28 Server DOM Adoption — adoption of server-rendered HTML
* 29 Reactive Server Messenger — component over adopted server root
* 30 BigView Independent Updates — stable root, direct mutations, coordinated rerenders
* 31 MVVM BigView Sections — topic-based selective rerenders
* 32 Security Boundary — attribute validation, text rendering for untrusted content
* 33 elementBuilder Outlet with reset() — clean slate route transitions
* 34 componentBuilder Outlet with rerender() — `_patchFrom` route transitions
* 35 Local Stateful Inside Stateless (ViewModel) — local `componentBuilder` subtree rerendered by ViewModel notifications within a stateless container

## Local Development

```bash
git clone https://github.com/dimaspandu/dompp.git
cd dompp
npm install
npm run dev
```

Open `http://localhost:5173`. All 35 examples run live with source viewer.

## Testing

```bash
npm test
```

## Design Principles

* Explicit over magical behavior
* Native platform first
* No virtual DOM
* No hidden reconciliation
* No compiler required
* Minimal runtime surface area
* Predictable mutation flow
* Optional reactivity

## Architecture Documentation

See `docs/architecture/README.md` for runtime flow diagrams, builder architecture, and design philosophy.

## Status

DOMPP is experimental and under active iteration. Breaking changes may occur while APIs and runtime architecture continue evolving.

## Contributing

Contributions are welcome. Please read `CONTRIBUTING.md` before submitting large architectural changes.

## Live Documentation

https://dompp.digital/

## License

MIT License. Copyright (c) Dimas Pandu Pratama.