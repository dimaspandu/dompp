# DOMPP (DOM++): A Minimalist, Deterministic DOM Mutation Layer for Experimental UI Architecture

## Abstract
DOMPP (DOM++) is a small experimental library that extends native DOM nodes with chainable mutation helpers while keeping behavior explicit and predictable. It is intentionally non-framework: no virtual DOM, no component system, no hidden dependency graphs. Instead, it offers a thin mutation layer, optional reactive bindings, reconciliation helpers, and hydration utilities that can be composed to study UI architecture from first principles. This article introduces the design goals, the core API, a narrative motivation, and a hands-on demo, alongside references that ground the ideas in established work.

## A Short Story About Why DOMPP Exists
Most front-end projects do not start with a framework. They start with a page, a few DOM nodes, and a little interactivity. Then the code grows. Someone adds a counter, a form, a list. The first version is clear, but the next update requires a slightly different mutation, and soon the code splits across several styles: `textContent` here, `setAttribute` there, and `addEventListener` in a different shape. The DOM is still the engine underneath, but the mutation vocabulary becomes scattered.

DOMPP begins from that frustration. It asks: what if we had a consistent, setter-shaped language for mutation that still speaks in native DOM, without wrapper objects or virtual DOM? What if the difference between initial render and incremental update was not a set of new abstractions, but the same handful of explicit, deterministic primitives?

This is not a claim that frameworks are unnecessary. It is a proposal for a smaller tool: a precise and inspectable mutation layer for engineers who want to understand the mechanics of UI updates, or who want to teach them to others.

## Core Mutation API
DOMPP enhances native elements with chainable methods:

- `setText(...)`
- `setChildren(...)`
- `setStyles(...)`
- `setAttributes(...)`
- `setEvents(...)`

Example:

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

These methods directly mutate the DOM and return the same element for chaining. There is no wrapper object, and the underlying DOM semantics remain intact [1,2].

## Setter Callback Mode (Core)
DOMPP also supports callback updaters without enabling any reactive system. The callback receives the previous value plus DOM context:

```js
const title = document.createElement("h2").setText("Count: 0");

// Update using previous value
title.setText(({ text }) => text.replace("0", "1"));
```

This is especially useful for hydration and assimilation workflows where existing DOM nodes should be reused instead of recreated. Supported callback forms include:

- `setText(({ text }) => ...)`
- `setStyles(({ styles }) => ...)`
- `setAttributes(({ attributes }) => ...)`
- `setEvents(({ events }) => ...)`
- `setChildren(({ childNodes }) => ...)`

## Reactive Layer (Stateful Addon)
The optional `stateful` addon adds element-local state and reactive setter bindings. It keeps updates deterministic and avoids hidden dependency graphs, aligning with principles from reactive and incremental computation research [8,9,10].

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

Setter callbacks now receive both previous values and the stateful context (`state`, `setState`).

## Reconciliation and Hydration Addons
DOMPP includes optional addons to explore more advanced rendering strategies:

- `reconcile`: patch-style updates and id-based node reuse.
- `hydration`: reuses SSR or pre-rendered DOM without rebuilding the subtree.
- `vquery`: minimal helpers for querying and element creation.

These addons are opt-in and do not change the core mutation semantics. They are experimental tools to explore ideas like stable identity reuse for lists, which aligns with incremental computation with names [11].

## Demo: Hydration Assimilation Counter
This demo shows how to reuse existing DOM nodes and attach interactivity without recreating the subtree.

### Steps
1. Run the example server:
   ```bash
   node examples/serve.js
   ```
2. Open the hydration assimilation counter example from the repository demo index.

### Key Code (Simplified)

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

This demonstrates DOM reuse plus event binding, with no template compilation or virtual DOM diffing.

## Demo and Repository
The canonical demo and source for DOMPP live here:

```
https://github.com/dimaspandu/dompp
```

## Limitations and Non-Goals
DOMPP is intentionally minimal. It does not include:

- Component abstraction
- Template compilation
- Dependency graph reactivity
- SSR framework integration

Its purpose is architectural clarity, not full-stack convenience.

## Why This Matters (A Cognitive Framing)
Uniform mutation primitives reduce extraneous cognitive load by offering one consistent language for both initial render and incremental updates [13,14]. This helps engineers reason about what changes, when, and why, without crossing multiple abstraction layers.

## Future Work
DOMPP can serve as a controlled environment for exploring:

- Scheduling strategies
- Diff heuristics vs. explicit mutation
- Native API proposals for DOM ergonomics [12]
- Standardized hydration semantics

## Conclusion
DOMPP (DOM++) is a small but focused experiment in DOM ergonomics. By isolating mutation, reactivity, reconciliation, and hydration into explicit layers, it provides a clear lens into UI architecture decisions. It is best viewed not as a framework, but as a research tool and a platform for disciplined experimentation with rendering behavior.

---

## References
1. MDN Web Docs. Document Object Model (DOM). Available online: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model (accessed on 21 February 2026).
2. WHATWG. DOM Standard. Available online: https://dom.spec.whatwg.org/ (accessed on 21 February 2026).
3. MDN Web Docs. EventTarget: addEventListener() method. Available online: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener (accessed on 21 February 2026).
4. MDN Web Docs. Node: textContent property. Available online: https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent (accessed on 21 February 2026).
5. MDN Web Docs. Element: replaceChildren() method. Available online: https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren (accessed on 21 February 2026).
6. MDN Web Docs. Element: setAttribute() method. Available online: https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute (accessed on 21 February 2026).
7. MDN Web Docs. Element: removeAttribute() method. Available online: https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute (accessed on 21 February 2026).
8. Bainomugisha, E.; Carreton, A.L.; Van Cutsem, T.; Mostinckx, S.; De Meuter, W. A Survey on Reactive Programming. ACM Computing Surveys 2013, 45(4), 1-34. https://doi.org/10.1145/2501654.2501666
9. Acar, U.A.; Blelloch, G.E.; Harper, R. Adaptive Functional Programming. ACM Transactions on Programming Languages and Systems 2006, 28(6), 990-1034. https://doi.org/10.1145/1119479.1119480
10. Acar, U.A.; Blelloch, G.E.; Harper, R. Adaptive Functional Programming. In Proceedings of POPL; 2002; pp. 247-259. https://doi.org/10.1145/503272.503296
11. Hammer, M.A.; Dunfield, J.; Headley, K.; Labich, N.; Foster, J.S.; Hicks, M.W.; Van Horn, D. Incremental Computation with Names. In Proceedings of OOPSLA; 2015; pp. 748-766. https://doi.org/10.1145/2814270.2814305
12. TC39. The TC39 Process. Available online: https://tc39.es/process-document/ (accessed on 21 February 2026).
13. Storey, M.-A.D. Theories, Tools and Research Methods in Program Comprehension: Past, Present and Future. Software Quality Journal 2006, 14(3), 187-208. https://doi.org/10.1007/s11219-006-9216-4
14. Sweller, J. Cognitive Load During Problem Solving: Effects on Learning. Cognitive Science 1988, 12(2), 257-285. https://doi.org/10.1016/0364-0213(88)90023-7