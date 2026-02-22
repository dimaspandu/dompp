# Proposed DOM++ (DOMPP): We Might Just Need an API Like This

**Dimas Pratama**
GitHub Repository: [https://github.com/dimaspandu/dompp](https://github.com/dimaspandu/dompp)

---

## Abstract

Modern web development is increasingly dominated by declarative UI frameworks that introduce runtime reconciliation layers to manage state transitions. While these abstractions simplify development, empirical evidence suggests that rendering strategies exhibit substantial differences in performance scaling. Concurrently, large-scale studies of real-world web pages indicate steady growth in DOM size and structural complexity over the past decades. This paper proposes DOM++ (DOMPP), a minimal extension to the native DOM API that introduces deterministic, chainable mutation setters without adding intermediate rendering abstractions. Unlike Virtual DOM or reactive runtime systems, DOMPP delegates reconciliation and rendering optimization to the browser engine rather than implementing them in userland memory structures. Furthermore, DOMPP proposes an explicitly configurable reconciliation model, enabling developers to determine when reconciliation is necessary and when deterministic mutation renders it redundant. We position DOMPP as a systems-level alternative to framework-centric rendering models and discuss its implications for performance, AI-assisted code generation, and potential standardization.

**Keywords**: DOM, Rendering Performance, Reconciliation, Deterministic Mutation, Engine-Level Optimization, Vanilla JavaScript

---

## I. Introduction

Modern web frameworks define declarative models in which state transitions are abstracted away from direct DOM mutation. While this approach simplifies application development, it introduces reconciliation strategies that translate state changes into DOM updates. Recent empirical work has demonstrated that such rendering strategies differ significantly in scaling behavior and runtime cost [1]. In parallel, structural analyses of real-world websites show a continuous increase in DOM size and JavaScript usage, transforming web pages into increasingly programmatic containers [2].

This paper argues that instead of introducing increasingly complex abstraction layers, improving the ergonomics of the native DOM may provide a more predictable and scalable alternative. DOMPP (DOM++) proposes a deterministic, chainable mutation interface over native DOM operations. Crucially, DOMPP rejects runtime-level reconciliation as a mandatory abstraction and instead repositions rendering optimization as an engine-level responsibility.

---

## II. Related Work

### A. Rendering Strategies in Modern Frameworks

The comparative study of Angular, React, Vue, Svelte, and Blazor demonstrates that rendering strategies exhibit significant differences in scaling behavior [1]. Performance variations can span orders of magnitude depending on how effectively a framework minimizes render-loop input size. Compile-time optimizations and fine-grained reactivity models are shown to reduce overhead by limiting the scope of updates.

These frameworks typically implement reconciliation through Virtual DOM diffing, template re-evaluation, dependency tracking graphs, and compiler-assisted static optimization. While effective under certain conditions, these strategies introduce additional memory structures and execution passes whose cost scales with application complexity.

DOMPP differs fundamentally: it introduces no intermediate representation, no virtual tree, and no runtime dependency graph. Instead, it relies exclusively on native DOM mutation semantics.

### B. Structural Properties of Web Pages

A large-scale empirical study of 708 websites reveals that most pages contain fewer than 2000 DOM nodes, have tree depth below 22, and exhibit increasing structural and scripting complexity over time [2]. The proportion of layout and presentation elements steadily increases, and JavaScript usage continues to grow.

These findings suggest that DOM mutation cost increasingly depends on structural size and layout invalidation behavior. If reconciliation cost scales with tree size, abstraction overhead becomes more significant as web applications grow.

DOMPP responds by minimizing runtime-level structural traversal and delegating layout optimization to the browser engine, which already maintains global knowledge of style recalculation, paint scheduling, and compositing.

---

## III. DOMPP Conceptual Design and API Model

### A. Baseline DOM Mutation Model

The Web Platform exposes DOM mutation through heterogeneous primitives including property assignment, setAttribute/removeAttribute, textContent updates, appendChild/replaceChildren, and addEventListener [1]–[7]. While expressive, these APIs employ fragmented mutation vocabularies.

A representative construction example:

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

DOMPP hypothesizes that a minimal chainable mutation surface can reduce representational heterogeneity while preserving native semantics.

### B. Minimal Chainable Mutation Surface

DOMPP introduces:

* setText(text)
* setChildren(...children)
* setStyles(styles)
* setAttributes(attrs)
* setEvents(events)
* setState(state)

Each method mutates the native node directly, returns the same instance, introduces no wrapper abstraction, and preserves DOM standard semantics [2].

Structure-preserving construction:

```js
const html = document.createElement("html").setChildren(
  document.createElement("head").setChildren(
    document.createElement("title").setText("My Document")
  ),
  document.createElement("body").setChildren(
    document.createElement("h1").setText("Header"),
    document.createElement("p").setText("Paragraph")
  )
);
```

### C. Deterministic Retained-DOM Philosophy

DOMPP adopts a retained-DOM model: elements are constructed once and mutated in place.

```js
let count = 0;
const titleEl = document.createElement("h2").setText("Count: 0");
function update() {
  titleEl.setText(`Count: ${count}`);
}
```

No diffing stage, no virtual tree allocation, and stable node identity are maintained.

### D. Unified State Composition via setState

```js
element.setState({ text, children, styles, attributes, events });
```

Functional form:

```js
element.setState(prev => { prev.count += 1; });
```

Unlike reactive graph systems [8]–[11], no dependency graph or implicit reconciliation cycle is required.

### E. Explicit and Configurable Reconciliation

Reconciliation is optional and explicit.

```js
installDomppReconcile({ overrideSetters: true });
orderedList.setChildren(...templates, { matchById: true });
```

Deterministic mutations such as numeric counters do not require reconciliation.

### F. Engine-Level Optimization Hypothesis

Differential mutation optimization is hypothesized to be more appropriately implemented at the browser engine level rather than runtime JavaScript memory.

Expected optimization domains include subtree diffing, id-aware matching, style diffing, event identity short-circuiting, and mutation batching.

### G. Determinism and Developer Control

DOMPP allows developers to explicitly determine when reconciliation is semantically necessary, preserving transparency and execution traceability.

---

## IV. Empirical Implications

Given that rendering cost scales with input size [1] and DOM size grows over time [2], minimizing reconciliation overhead becomes increasingly important. DOMPP reduces virtual tree construction, diff traversal overhead, dependency graph maintenance, and memory duplication while preserving native browser optimization.

---

## V. Discussion

DOMPP reframes reconciliation as either an engine-level optimization problem or a developer-controlled optional mechanism. This repositioning reduces abstraction layering while maintaining expressive power and auditability.

---

## VI. Implications for Standardization

Potential standardization directions include mutation-intent signaling APIs, engine-hinted bulk insertion methods, and explicit subtree batching semantics.

---

## VII. Conclusion

Empirical evidence shows that rendering strategies significantly influence performance scaling and that DOM structures steadily grow in complexity. DOMPP proposes enhancing native DOM ergonomics and delegating reconciliation to the browser engine. By enabling deterministic mutation and configurable reconciliation, DOMPP offers a minimal yet scalable alternative.

---

## REFERENCES

[1] MDN Web Docs, "Document Object Model (DOM)."

[2] WHATWG, "DOM Standard."

[3] MDN Web Docs, "EventTarget: addEventListener() method."

[4] MDN Web Docs, "Node: textContent property."

[5] MDN Web Docs, "Element: replaceChildren() method."

[6] MDN Web Docs, "Element: setAttribute() method."

[7] MDN Web Docs, "Element: removeAttribute() method."

[8] E. Bainomugisha et al., "A Survey on Reactive Programming," ACM Computing Surveys, 2013.

[9] U. A. Acar et al., "Adaptive Functional Programming," ACM TOPLAS, 2006.

[10] U. A. Acar et al., "Adaptive Functional Programming," POPL, 2002.

[11] M. A. Hammer et al., "Incremental Computation with Names," OOPSLA, 2015.

[12] TC39, "The TC39 Process."

[13] M.-A. D. Storey, "Program Comprehension," Software Quality Journal, 2006.

[14] J. Sweller, "Cognitive Load Theory," Cognitive Science, 1988.
