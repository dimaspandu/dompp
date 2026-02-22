# Proposed DOM++ (DOMPP): We Might Just Need an API Like This

**Dimas Pratama**
GitHub Repository: [https://github.com/dimaspandu/dompp](https://github.com/dimaspandu/dompp)

---

## Abstract

Modern web development is increasingly dominated by declarative UI frameworks that introduce runtime reconciliation layers to manage state transitions. While these abstractions simplify development, empirical evidence suggests that rendering strategies exhibit substantial differences in performance scaling. Concurrently, large-scale studies of real-world web pages indicate steady growth in DOM size and structural complexity over the past decades. This paper proposes DOM++ (DOMPP), a minimal extension to the native DOM API that introduces deterministic, chainable mutation setters without adding intermediate rendering abstractions. Unlike Virtual DOM or reactive runtime systems, DOMPP delegates reconciliation and rendering optimization to the browser engine rather than implementing them in userland memory structures. Furthermore, DOMPP proposes an explicitly configurable reconciliation model, enabling developers to determine when reconciliation is necessary and when deterministic mutation renders it redundant. We position DOMPP as a systems-level alternative to framework-centric rendering models and discuss its implications for performance, AI-assisted code generation, and potential standardization.

**Keywords**: DOM, Rendering Performance, Reconciliation, Deterministic Mutation, Engine-Level Optimization, Vanilla JavaScript

---

## 1. Introduction

Modern web frameworks define declarative models in which state transitions are abstracted away from direct DOM mutation. While this approach simplifies application development, it introduces reconciliation strategies that translate state changes into DOM updates. Recent empirical work has demonstrated that such rendering strategies differ significantly in scaling behavior and runtime cost [1]. In parallel, structural analyses of real-world websites show a continuous increase in DOM size and JavaScript usage, transforming web pages into increasingly programmatic containers [2].

This paper argues that instead of introducing increasingly complex abstraction layers, improving the ergonomics of the native DOM may provide a more predictable and scalable alternative. DOMPP (DOM++) proposes a deterministic, chainable mutation interface over native DOM operations. Crucially, DOMPP rejects runtime-level reconciliation as a mandatory abstraction and instead repositions rendering optimization as an engine-level responsibility.

---

## 2. Related Work

### 2.1 Rendering Strategies in Modern Frameworks

The comparative study of Angular, React, Vue, Svelte, and Blazor demonstrates that rendering strategies exhibit significant differences in scaling behavior [1]. Performance variations can span orders of magnitude depending on how effectively a framework minimizes render-loop input size. Compile-time optimizations and fine-grained reactivity models are shown to reduce overhead by limiting the scope of updates.

These frameworks typically implement reconciliation through:

* Virtual DOM diffing
* Template re-evaluation
* Dependency tracking graphs
* Compiler-assisted static optimization

While effective under certain conditions, these strategies introduce additional memory structures and execution passes whose cost scales with application complexity.

DOMPP differs fundamentally: it introduces no intermediate representation, no virtual tree, and no runtime dependency graph. Instead, it relies exclusively on native DOM mutation semantics.

### 2.2 Structural Properties of Web Pages

A large-scale empirical study of 708 websites reveals that most pages contain fewer than 2000 DOM nodes, have tree depth below 22, and exhibit increasing structural and scripting complexity over time [2]. The proportion of layout and presentation elements steadily increases, and JavaScript usage continues to grow.

These findings suggest that DOM mutation cost increasingly depends on structural size and layout invalidation behavior. If reconciliation cost scales with tree size, abstraction overhead becomes more significant as web applications grow.

DOMPP responds by minimizing runtime-level structural traversal and delegating layout optimization to the browser engine, which already maintains global knowledge of style recalculation, paint scheduling, and compositing.

---

## 3. Design Principles of DOMPP

DOMPP is guided by four principles:

1. Deterministic execution semantics
2. Traceable and explicit state transitions
3. Minimal abstraction over native APIs
4. Compatibility with AI-assisted code generation workflows

DOMPP introduces chainable setters such as `setAttributes`, `setText`, `setChildren`, and event-binding utilities that operate directly on native elements.

### Example (Listing 1)

```
const button = document.createElement('button')
  .setAttributes({ id: 'counter' })
  .setText('0')
  .on('click', () => increment());
```

This model preserves imperative determinism while improving ergonomics.

---

## 4. Engine-Level Reconciliation

### 4.1 Runtime Reconciliation vs Engine Optimization

Conventional frameworks implement reconciliation within runtime memory. Application state is transformed into an intermediate structure, diffed, and subsequently translated into DOM mutations.

DOMPP proposes that reconciliation, where necessary, should occur at the browser engine level. The rendering engine already performs:

* Style recalculation batching
* Layout invalidation tracking
* Paint coalescing
* Compositor scheduling

Reimplementing these mechanisms in JavaScript duplicates effort and may introduce scaling overhead proportional to tree size.

### 4.2 Explicit and Configurable Reconciliation

A key extension of DOMPP is the proposal that reconciliation be explicitly configurable rather than implicitly enforced.

Certain mutations are inherently deterministic. For example, repeated `setText()` updates of a numeric counter do not require structural diffing:

```
element.setText(String(counter++));
```

In such cases, reconciliation is redundant because the mutation is explicit and bounded.

DOMPP therefore proposes:

* Developers may opt into reconciliation where structural uncertainty exists.
* Developers may bypass reconciliation when mutations are deterministic and localized.

This shifts reconciliation from an implicit framework policy to an explicit architectural decision.

---

## 5. Empirical Implications

Given that rendering cost scales with input size [1] and DOM size grows over time [2], minimizing reconciliation overhead becomes increasingly important. DOMPP reduces:

* Virtual tree construction cost
* Diff traversal overhead
* Dependency graph maintenance
* Memory duplication

Instead, it preserves:

* Native browser optimization
* Predictable execution order
* Minimal mutation footprint

Future benchmarking should replicate the methodology of [1], comparing DOMPP directly with framework rendering strategies under controlled complexity scaling.

---

## 6. Discussion

DOMPP does not deny the necessity of reconciliation in all cases. Rather, it reframes reconciliation as either:

1. An engine-level optimization problem, or
2. A developer-controlled optional mechanism

This systems-level repositioning reduces abstraction layering while maintaining expressive power. It is particularly relevant in AI-generated code contexts, where minimizing hidden abstraction improves auditability, traceability, and predictability.

---

## 7. Implications for Standardization

DOMPP suggests potential future standardization efforts, including:

* Mutation intent signaling APIs
* Engine-hinted bulk insertion methods
* Explicit subtree batching semantics

Such proposals may be relevant to WHATWG or ECMAScript discussions concerning DOM ergonomics and performance predictability.

---

## 8. Conclusion

Empirical evidence shows that rendering strategies significantly influence application performance scaling and that DOM structures steadily grow in complexity. Instead of introducing additional abstraction layers to manage this complexity, DOMPP proposes enhancing native DOM ergonomics and delegating reconciliation to the browser engine. By enabling deterministic mutation and configurable reconciliation, DOMPP offers a minimal yet scalable alternative to abstraction-heavy frameworks.

---

## 9. Future Work

Future research directions include:

* Controlled benchmarking aligned with [1]
* Mutation-cost modeling based on structural metrics in [2]
* Usability studies comparing framework and DOMPP development workflows
* Exploration of engine-level reconciliation hooks

---

## References

[1] M. Authors, "Modern Web Frameworks: A Comparison of Rendering Performance," IEEE, 2023.

[2] P. Authors, "An Empirical Study of Web Page Structural Properties," IEEE, 2023.
