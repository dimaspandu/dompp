# DOMPP (DOM++)

**Build fast, native UIs without leaving the DOM.**

DOMPP (DOM plus plus) is a small enhancement layer for the browser DOM. It adds chainable setters, component re-rendering, DOM-aware reconciliation, and a JSX-compatible element factory while continuing to work with real DOM nodes.

DOM++ does not require a separate virtual DOM tree. It reconciles component output against the real DOM, while keeping component boundaries and re-rendering explicit. You can use the JavaScript API directly; JSX is optional and requires a JSX transform at build time.

> DOM, extended with small, explicit, chainable methods.

## Background

DOM++ is part of a larger effort, **[the-future-of-the-browser](https://github.com/dimaspandu/the-future-of-the-browser)**: an exploration of browser runtime capabilities using technologies such as Rust and V8.

The broader idea is to explore what the DOM might look like if capabilities such as composable element creation, explicit component boundaries, and reactive updates were available closer to the platform itself.

The project is driven by two questions:

- What if working with the DOM were more composable and optionally reactive?
- What DOM APIs would make direct DOM development easier to maintain?

DOM++ is an experimental implementation of some of those ideas. It is intended as a practical exploration, not a replacement for the browser DOM or a claim that these APIs are already part of the web platform.

If you like the simplicity of vanilla DOM but want a more expressive API, DOM++ lets you build on actual DOM elements with explicit mutation and DOM-aware updates.

## Why DOM++

- **Real DOM first:** work directly with actual browser elements and existing markup. DOM++ does not require a separate virtual DOM tree.
- **DOM-aware reconciliation:** reconcile component output against existing DOM nodes, preserving node identity where possible.
- **Explicit update boundaries:** component re-rendering is explicit, while structural changes within a component can be reconciled by DOM++.
- **Progressive enhancement:** use chainable setters first, then introduce components or re-rendering where useful.
- **Composable construction:** build nested UI with `createElement`, `setChildren`, and optional JSX.
- **Incremental adoption:** enhance existing or server-rendered markup instead of rebuilding the whole page.
- **Small mental model:** keep rendering and mutation close to the browser platform.

## Installation

```bash
npm install @dimpandu/domplusplus
```

## Quick Start

In a browser, the package's default entry point installs the DOM++ APIs on the document. In environments such as Node.js tests, initialize the APIs explicitly with `createDOMPP()`.

```js
import { createDOMPP } from "@dimpandu/domplusplus";

// Explicit initialization for Node.js or test environments.
// In a browser, the default entry point installs the APIs automatically.
createDOMPP();

const card = document
  .createElement("div")
  .setStyles({
    padding: "20px",
    background: "#111",
    color: "#fff",
    borderRadius: "12px",
  })
  .setChildren(
    document.createElement("h1").setText("Hello DOM++"),
    document
      .createElement("button")
      .setText("Click me")
      .setEvents({
        click() {
          alert("Built with DOM++");
        },
      })
  );

document.body.setChildren(card);
```

## Core APIs

### Chainable setters

DOM++ adds methods to elements for composing common DOM operations. Setters return the element so calls can be chained.

| Method | Purpose |
| --- | --- |
| `setText(text \| fn)` | Set text content, with support for the API's reactive form |
| `setChildren(...nodes)` | Set children from nodes, fragments, or arrays |
| `setStyles(object)` | Apply style properties |
| `setAttributes(object)` | Set validated attributes |
| `setEvents(object)` | Attach event listeners |

Use the dedicated setters rather than passing event-handler strings or style text through attributes.

### Components and explicit re-rendering

`document.createComponent(builder)` creates a component boundary around a render function. The returned component exposes `.rerender()` so an update can be requested explicitly.

When a component re-renders, DOM++ reconciles its new output with the existing DOM structure. This is reconciliation, but it does not require maintaining a separate virtual DOM tree. The goal is to update the real DOM while preserving existing node identity where possible.

```js
let count = 0;

const counter = document.createComponent((rerender) =>
  document.createElement("section").setChildren(
    document.createElement("strong").setText(count),
    document
      .createElement("button")
      .setText("Increment")
      .setEvents({
        click() {
          rerender(() => {
            count++;
          });
        },
      })
  )
);

document.getElementById("app").setChildren(counter);
```

This keeps the update boundary visible in the code. DOM++ handles the structural reconciliation within that boundary.

### Progressive enhancement and DOM adoption

DOM++ can adopt an existing server-rendered root node inside a component. The example below reads initial messages embedded in the HTML, adopts the existing `#messenger-app` element, and updates a keyed list when the user sends a new message. The root remains the same DOM node across component updates.

The server is expected to render the `#messenger-app` container and a `<script id="messenger-data" type="application/json">` element containing a JSON array of messages. This example uses JSX, configured with DOM++ as the JSX factory (see [JSX (Optional)](#jsx-optional)).

```jsx
// Data embedded by the server alongside the rendered HTML.
const messages = JSON.parse(
  document.getElementById("messenger-data").textContent
);
let nextId = Math.max(...messages.map((m) => m.id)) + 1;

const rootNode = document.getElementById("messenger-app");

const messenger = document.createComponent((rerender) =>
  document.createElement(
    rootNode,
    { class: "demo-surface messenger-surface" },
    <h3>Reactive server messenger</h3>,
    <p>
      This component adopts the pre-rendered container (same root node) and
      rerenders a keyed message list when you send a message.
    </p>,
    <ul class="server-list">
      {[...messages].reverse().map((msg) => (
        <li key={msg.id}>{msg.text}</li>
      ))}
    </ul>,
    <div class="message-form">
      <textarea
        class="message-input"
        aria-label="New message"
        placeholder="Write a message..."
      ></textarea>
      <button
        class="action-button"
        type="button"
        onClick={() => {
          const input = rootNode.querySelector("textarea");
          const text = input.value.trim();
          if (!text) return;
          messages.push({ id: nextId++, text });
          input.value = "";
          rerender();
        }}
      >
        Send
      </button>
    </div>,
    <p id="messenger-status" class="status-note">
      {"Adopted root node · messages: " + messages.length}
    </p>
  )
);
```

Here, `document.createElement(rootNode, ...)` adopts the existing element, while `document.createComponent(...)` provides the component's `rerender` callback. Reconciliation updates the keyed message list without requiring a separate virtual DOM tree. Unlike an `ElementBuilder`, a component supports `.rerender()`.

### Fragments and arrays

DOM++ supports composing multiple children and multi-root component results. Its `createDocumentFragment(...children)` API is a DOM++ child-composition helper that returns a flat child array; it should not be confused with the browser's native `DocumentFragment`.

```js
const items = document.createComponent(() =>
  document.createDocumentFragment(
    document.createElement("strong").setText("Item A"),
    document.createElement("strong").setText("Item B")
  )
);

const labels = document.createComponent(() => [
  document.createElement("em").setText("X"),
  document.createElement("em").setText("Y"),
]);
```

`document.createElement("fragment")` is a separate wrapper-element form.

## JSX (Optional)

DOM++ supports JSX as an optional syntax for describing elements. The JSX factory can be set to `document.createElement`, allowing JSX to produce DOM++ elements and use the same enhanced DOM APIs.

JSX is not parsed natively by browsers. A JSX transform is required during development or build time. If you prefer not to add that build step, use the JavaScript API directly.

```jsx
/** @jsxRuntime classic */
/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

const card = (
  <article className="card" styles={{ color: "tomato" }}>
    <h2>DOM++</h2>
    <p>Browser-native runtime exploration</p>
  </article>
);

document.getElementById("app").setChildren(card);
```

A classic JSX transform turns the JSX expression into calls to the configured factory. Conceptually, the result is equivalent to:

```js
const card = document.createElement(
  "article",
  { className: "card", styles: { color: "tomato" } },
  document.createElement("h2", null, "DOM++"),
  document.createElement(
    "p",
    null,
    "Browser-native runtime exploration"
  )
);

document.getElementById("app").setChildren(card);
```

The exact generated output depends on the JSX transform and its configuration. See `examples/03-jsx-and-adoption/` for the project's working JSX setup.

For SVG elements, use the appropriate namespace-aware creation path. See the example implementation for the project's current approach.

## Public API and entry points

The main public API is exposed through the enhanced `document` methods:

| API | Purpose |
| --- | --- |
| `document.createElement(tag, props, ...children)` | Create an element using the DOM++ builder API; it can also be used as a JSX factory |
| `document.createElement(existingElement)` | Adopt an existing element |
| `document.createComponent(builder)` | Create a component boundary with explicit `.rerender()` and DOM-aware reconciliation |
| `document.createDocumentFragment(...children)` | Compose children into a flat array |
| `document.createElement("fragment")` | Create a wrapper fragment element |

Package entry points:

- `@dimpandu/domplusplus` — main entry point; installs the DOM++ APIs and builders.
- `@dimpandu/domplusplus/builders` — lower-level builder utilities.

The builder layer (`elementBuilder`, `componentBuilder`, and related utilities) supports the public API. Most application code should use the enhanced `document` methods rather than depend directly on builder internals.

## Examples

The `examples/` directory contains 11 progressive examples:

1. **01-direct-dom** — create and update real DOM nodes with chainable setters.
2. **02-components-mvvm** — component boundaries, explicit `.rerender()`, and ViewModel-driven state.
3. **03-jsx-and-adoption** — JSX syntax and adopting existing markup in place.
4. **04-dynamic-lists** — conditional rendering and keyed lists with identity preservation.
5. **05-fragments-and-arrays** — multi-root fragments and array-returning components.
6. **06-safe-by-default** — validation for dangerous attributes and URL protocols.
7. **07-capstone-mini-app** — combine components, state, lists, and fragments in one app.
8. **08-local-stateful-subtree** — keep a stateful component inside a larger view.
9. **09-add-remove-subtree** — dynamically mount and unmount subtrees.
10. **10-adopt-server-markup** — adopt existing server-rendered markup and update it.
11. **11-guided-tour** — a guided walkthrough from direct DOM operations to components, composition, and adoption.

Browse the `examples/` directory or run the local development server as described below.

## Experiments

`examples/_experiments/` contains experimental engine and adapter work. These experiments may explore JSX, fragments, components, adoption, or guided tours beyond the documented example set. They are not part of the stable progressive examples.

## Local Development

```bash
git clone https://github.com/dimaspandu/dompp.git
cd dompp
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The development server serves the examples and their source viewers.

## Testing

Run the available test suites:

```bash
npm test
npm run test:browser
```

## Design Principles

- Real DOM over a separate virtual DOM representation.
- Reconciliation without requiring a virtual DOM.
- Explicit component and update boundaries.
- Preserve DOM node identity where possible.
- Prefer native browser primitives.
- Make reactivity optional rather than mandatory.
- Keep the runtime surface area small.
- Support incremental adoption of existing markup.

## Documentation

- Architecture and diagrams: `docs/architecture/README.md`
- Project website: [https://dompp.digital/](https://dompp.digital/)

## Project Status

DOM++ is experimental and under active development. APIs and implementation details may change as the project evolves. Review the examples and tests for the behavior supported by the current version.

## Contributing

Contributions are welcome. Please read `CONTRIBUTING.md` before proposing or submitting substantial architectural changes.

## License

MIT License.

Copyright (c) Dimas Pandu Pratama.
