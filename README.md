# DOMPP (DOM++)

**Build fast, native UIs without leaving the DOM.** DOMPP (DOM plus plus) enhances real browser nodes with chainable setters, optional reactivity, and a lightweight JSX-compatible builder engine — no virtual DOM, no compiler requirement, no wrapper objects.

> DOM extended with small, explicit, chainable methods.

If you like the simplicity of vanilla DOM but want a better developer experience, DOMPP gives you predictable, direct mutation with modern ergonomics.

## Why DOMPP

- **Native-first**: works with real `Element`, `DocumentFragment`, and existing/server-rendered HTML.
- **Deterministic updates**: you mutate exactly what you mean — no hidden diff/reconciliation layer.
- **Progressive by design**: start with setters, add state/signals/builders only where needed.
- **Tiny mental model**: chainable APIs, explicit behavior, minimal runtime surface.
- **Flexible rendering**: direct DOM enhancement, `componentBuilder` boundaries, and optional JSX syntax.
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
| `setState(obj)` | Attach local state and trigger reactive reruns |
| `setEnhancement(fn)` | Progressively enhance existing DOM |
| `setFineGrained()` | Opt-in to fine-grained signal updates |

### Local reactive state

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

State changes schedule microtask-flushed reruns for reactive setters on that element.

### Fine-grained signals

```js
const [count, setCount] = document.createSignal(0);

document
  .createElement("h1")
  .setFineGrained()
  .setText(() => count());
```

Only signal consumers rerun.

### Progressive enhancement

```js
document.getElementById("counter-app").setEnhancement(({ childNodes }) => {
  childNodes[1].setEvents({
    click() {
      childNodes[0].setText("1");
    },
  });
});
```

Attach behavior to server-rendered or static HTML without rebuilding it.

## Builder Engine (JSX-compatible)

DOMPP includes `elementBuilder` and `componentBuilder` for descriptor-based construction and local reconciliation — a small render engine on top of native DOM nodes.

```js
import { elementBuilder, componentBuilder } from "@dimpandu/domplusplus/builders";
```

### elementBuilder

```jsx
/** @jsx elementBuilder */
elementBuilder("div", { class: "card" },
  elementBuilder("h1", {}, "Title"),
  elementBuilder("button", { onClick: () => console.log("click") }, "Click")
);
```

- `elementBuilder(tag, props, ...children)` — create or adopt an element
- `elementBuilder(existingNode, props, ...children)` — adopt existing DOM
- `.reset()` — clear struct and live DOM for clean-slate updates

### componentBuilder

```jsx
/** @jsx elementBuilder */
let count = 0;

const Counter = componentBuilder((rerender) => (
  <section className="card">
    <p>Count: {count}</p>
    <button onClick={() => rerender(() => { count += 1; })}>Increment</button>
  </section>
));

elementBuilder(document.getElementById("app"), null, Counter.render());
```

- `componentBuilder((rerender) => tree)` — stateful render boundary
- `.render()` — mount and return builder/node
- `.rerender(callback)` — update state then patch from new tree

Entry points:
- `@dimpandu/domplusplus` — install DOMPP APIs + builders
- `@dimpandu/domplusplus/builders` — builders

## JSX (Optional)

Use any JSX transform that targets a custom factory (e.g. `elementBuilder` for builders, or a DOM factory for enhanced elements).

```js
/** @jsx d */
function d(tag, props, ...children) {
  const svgTags = new Set(["svg","circle","path","rect","line","polyline","polygon","ellipse","g","defs","use","symbol","text","tspan","image","foreignObject"]);
  const node = tag === "fragment" || tag === "Fragment"
    ? document.createDocumentFragment()
    : svgTags.has(tag)
      ? document.createElementNS("http://www.w3.org/2000/svg", tag)
      : document.createElement(tag);

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

## Examples (7)

The `examples/` directory contains 7 progressive, runnable examples:

1. **01-direct-dom** — native DOM nodes with chainable setters (`setText`, `setAttributes`, `setStyles`, `setEvents`, `setChildren`).
2. **02-components-mvvm** — components with explicit `.rerender()` and ViewModel-driven state.
3. **03-jsx-and-adoption** — JSX syntax and adopting existing markup in place.
4. **04-dynamic-lists** — conditional rendering and keyed lists with identity preservation.
5. **05-fragments-and-arrays** — multi-root fragments and array-returning components.
6. **06-safe-by-default** — built-in guards against dangerous attributes and protocols.
7. **07-capstone-mini-app** — combining components, state, lists, and fragments in one app.

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