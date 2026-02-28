# DOM++ (DOMPP): Deterministic Chainable DOM Mutation with Optional Reconciliation (Paper Outline)

**Dimas Pratama**  
Repository: `dimaspandu/dompp`

---

## Abstract

Modern UI frameworks improve ergonomics by abstracting DOM mutation behind declarative render functions and runtime reconciliation. This paper proposes DOM++ (DOMPP), a minimal, deterministic mutation surface built directly on native DOM nodes: small chainable setters (text, children, styles, attributes, events) plus element-local state bindings. DOMPP emphasizes retained node identity and explicit mutation, treating reconciliation as an opt-in operation rather than a mandatory render phase. We present a JavaScript prototype and a reproducible evaluation protocol, then discuss why an engine-integrated version could reduce constant-factor overheads by moving structural matching and mutation batching into the browser.

**Keywords**: DOM, UI rendering, mutation, reconciliation, performance, web standards

---

## I. Introduction

### Motivation

Client-side applications increasingly spend time in UI updates: diffing trees, allocating intermediate representations, and scheduling work. At the same time, real-world pages have grown in DOM size and structural complexity, which increases the cost of broad subtree work.

### Thesis

If most UI changes are small, localized, and semantically explicit (e.g., update one text node, toggle one attribute), then the platform should make localized mutation ergonomic and auditable, without requiring a framework-managed render cycle.

### Contributions

1. **A minimal mutation surface**: chainable setters on native elements that unify common DOM update forms.
2. **A deterministic retained-mutation model**: updates target stable node references; no implicit re-render.
3. **Optional reconciliation**: explicit `matchById` matching for intentionally regenerated child templates.
4. **An engine-oriented hypothesis**: structural matching, batching, and mutation shortcuts are better placed inside the browser than in userland runtimes.

---

## II. Background and Related Work

### A. The DOM as the Platform Boundary

The DOM is the interoperability boundary for UI on the Web: whatever the framework, the result is DOM mutation governed by platform semantics. DOMPP intentionally stays within this boundary (no wrapper nodes, no virtual tree).

### B. Empirical Context: DOM Growth and Structural Complexity

Large-scale analyses of real-world pages report growth in DOM size and structural complexity. This motivates experiments that distinguish between:

- localized updates on stable nodes (should be O(1) with small constants), and
- structural list updates (often O(n), with performance dominated by constant factors and allocation pressure).

DOMPP’s design goal is not to change asymptotic bounds, but to reduce constant overhead and make mutation scope explicit.

One longitudinal structural study (based on Internet Archive / Wayback Machine sampling) reports that web page size follows an inverse exponential distribution with “surprisingly high precision,” and that almost all surveyed pages contain fewer than 2,000 HTML tags. This reinforces the practical importance of predictable constant factors for common “small updates,” and motivates list- and tree-shaped workloads that stress identity and structural operations. [3]

### C. Rendering Architectures: Imperative, Declarative, and Reconciliation

The literature traces a progression:

- **Imperative libraries** improved DOM ergonomics without introducing a distinct reconciliation phase.
- **Declarative frameworks** introduced render functions, intermediate representations, and reconciliation strategies to map state changes to DOM mutations.
- **Keyed identity** and structural matching became central to performance for lists and repeated regions.

Comparative studies emphasize that reconciliation strategy and identity handling drive runtime behavior and memory use, even when workloads share the same high-level UI outcome.

A rendering-performance comparison of modern web frameworks frames the core tradeoff as “DOM calls directly” vs “DOM calls generated dynamically by a framework,” and argues that the scaling of costs should ideally depend only on update complexity, not on unrelated subtree size. It also emphasizes that results under simplified benchmark components should be interpreted as relative differences under specific conditions, rather than a universal ranking. [4]

An additional evolution-focused framework study reports that performance differences across frameworks can reach several orders of magnitude for the same tasks under some circumstances, and includes explicit validity/applicability caveats (hardware, environment sensitivity, and measurement definitions). It also highlights cross-runtime interop costs: for WebAssembly-based UIs, mediating access to DOM APIs through JavaScript can introduce overhead. [8]

### D. Compiler-Augmented and Hybrid Rendering Models

Recent approaches reduce runtime diffing by moving work into compilation or by mixing rendering strategies (e.g., server rendering + client hydration, island/partial hydration, or other hybrid models). This trend supports DOMPP’s framing: many optimizations are about making mutation intent more explicit and reducing redundant runtime work.

DOMPP differs by staying within native DOM objects and making reconciliation opt-in at the mutation call site, rather than introducing a new template language or a required build step.

A compiler-augmented Virtual DOM system (Million.js) presents compiler transformations and benchmark results that aim to reduce runtime diff/patch overhead, including comparisons against direct DOM updates and traditional VDOM approaches. In its reported measurements, direct DOM updates yield the lowest scripting time among tested strategies, illustrating the baseline advantage of “known target, explicit mutation,” while the compiler-augmented approach narrows the gap for declarative code paths. [5]

A recent frontend-architecture survey describes a shift from Virtual DOM-centric client rendering toward server-driven and hybrid approaches (e.g., React Server Components, streaming SSR) and situates this within tooling changes (build systems, framework meta-layers). This helps motivate DOMPP’s “engine-oriented” argument: if rendering strategies keep evolving, a stable low-level mutation vocabulary with explicit intent may reduce fragmentation at the platform boundary. [6]

An academic thesis on hybrid rendering models and edge computing discusses techniques such as islands architecture, SSR/SSG combinations, and hydration variants (including pitfalls of naïve hydration). This provides terminology and design space vocabulary that DOMPP can map to: DOMPP’s deterministic setters cover retained mutation within an island, while optional `matchById` reconciliation supports intentionally regenerated list subtrees. [7]

### E. Benchmarking Methodology and Confounds

Framework comparisons are useful but fragile. Common confounds include:

- build mode differences (dev vs prod),
- mismatched semantics (especially keyed list behavior),
- measurement point ambiguity (end of JS vs visual commit on the next frame),
- warm-up/JIT effects and run-order bias.

DOMPP’s evaluation therefore prioritizes small, specified operations and a strict protocol (record environment, warm-up, distributions, and explicit measurement definition), with results interpreted as evidence about constant factors and allocation pressure rather than a universal framework ranking.

### F. Key Sources Included in This Repository

The following PDFs in `docs/preprints/references/` are treated as the initial “state of the art” input set for this draft:

- `An_Empirical_Study_of_Web_Page_Structural_Properties.pdf` (DOM growth/complexity motivation)
- `Modern_Web_Frameworks_A_Comparison_of_Rendering_Performance.pdf` (runtime comparison + measurement considerations)
- `The Evolution of JavaScript Frameworks - Performance, Scalability, and Developers Experience.pdf` (architecture evolution)
- `The Evolution of Frontend Architecture - From Virtual DOM to Server Components.pdf` (rendering paradigms)
- `Million.js - A Fast Compiler-Augmented Virtual DOM for the Web.pdf` (compiler-augmented diff reduction)
- `Emergence of hybrid rendering models in web application development.pdf` and `A Comparative Review of Server Rendering and Client Side Rendering in Web Development.pdf` (hybrid/SSR context)

---

## III. DOMPP Conceptual Design

### A. Design Goals

- **Determinism**: updates happen only when an explicit setter is called.
- **Native identity**: the thing you mutate is the actual DOM node you created.
- **Small surface**: avoid new templating languages or intermediate representations.
- **Auditability**: code expresses the mutation boundary directly.

### B. Non-goals

- DOMPP is not a replacement for frameworks.
- DOMPP does not introduce a new reactive graph as a requirement.
- DOMPP does not claim asymptotic improvements over optimal keyed updates; the target is constant-factor reduction and predictability.

### C. Minimal Chainable Mutation Surface

DOMPP adds a small set of chainable helpers on native elements:

- `setText(text | (ctx) => text)`
- `setChildren(...children | (ctx) => children)`
- `setStyles(styles | (ctx) => styles)`
- `setAttributes(attrs | (ctx) => attrs)`
- `setEvents(handlers | (ctx) => handlers)`
- `setState(initial | (ctx) => void)` (element-local state + a deterministic update entrypoint)

These methods:

1. Mutate the underlying DOM node directly.
2. Return the same element for chaining.
3. Allocate no parallel tree representation.
4. Preserve observable platform semantics.

### D. Retained-Mutation Model

DOMPP favors constructing nodes once and mutating them in place:

```
event -> explicit setter -> direct DOM mutation -> paint
```

This makes node identity stable and keeps the mutation scope explicit.

### E. Explicit and Configurable Reconciliation

Some workloads intentionally regenerate child templates (e.g., reorder lists, rebuild rows). DOMPP supports an explicit reconcile mode where callers can opt into id-based matching:

```js
installDomppReconcile({ overrideSetters: true });
list.setChildren(...templates, { matchById: true });
```

Principle: reconciliation must be opt-in and visible at the call site.

### F. Engine-Level Optimization Hypothesis

DOMPP’s central hypothesis is that if mutation intent is made explicit and uniform, browsers can optimize common patterns more aggressively than userland frameworks can, while preserving semantics. Candidate domains:

- id-aware child matching
- differential child replacement (avoid full subtree resets)
- event-handler identity shortcuts
- batching to reduce layout invalidation

---

## IV. Prototype Implementation (JavaScript Library)

### A. Implementation Strategy

The current prototype is a JavaScript library that installs methods on native elements (via `src/` and optional addons). It demonstrates API ergonomics and enables controlled experiments, but it is not a browser-engine change.

### B. Modes

- **Base DOMPP**: chainable setters, direct mutation.
- **Stateful**: element-local state + callback-driven setters.
- **Reconcile addon**: patch-style `setChildren(..., { matchById: true })` matching.

---

## V. Evaluation Plan

### A. Research Questions

RQ1. Does deterministic retained mutation reduce constant overhead (time and heap) for localized updates compared to framework render paths?

RQ2. For list updates that require O(n) work, does explicit `matchById` matching reduce unnecessary DOM churn while preserving semantics?

RQ3. Which parts of the remaining overhead plausibly move from userland to the engine if the API were standardized?

### B. Workloads (CDN-only Track)

This repository includes no-build workloads under `benchmarks/apps-cdn/`:

- **Counter**: localized text update.
- **Ordered list (keyed)**: prepend + one targeted update, stable identity by id.
- **Big tree**: mixed localized updates + static subtree to simulate realistic DOM size.

### C. Harness, Metrics, and Protocol

Measurements follow `benchmarks/PROTOCOL.md` and the CSV schema in `benchmarks/templates/runtime_raw_template.csv`.

At minimum:

- `duration_ms` per operation
- `heap_used_mb` (when available)
- environment lock (browser/OS/commit) for reproducibility

### D. Threats to Validity (What we will control/report)

- **Measurement point**: "end of JS" vs "visual commit" (e.g., next frame). Report what is measured and avoid mixing definitions.
- **Workload equivalence**: ensure the same semantics across frameworks (especially keyed identity and update patterns).
- **Warm-up and JIT effects**: separate warm-up runs and report `n` and distributions.
- **CDN builds and versions**: record exact framework versions and build mode (prod vs dev).
- **Browser variance**: avoid over-generalization from a single browser/machine.

---

## VI. Results (To Be Filled)

- Runtime tables and plots derived from `benchmarks/results/`.
- Interpretation focuses on constant factors, allocation pressure, and update locality rather than a single overall ranking.

---

## VII. Discussion

DOMPP is intentionally narrow: it is a small, explicit mutation vocabulary plus optional reconciliation. The expected advantage is not asymptotic complexity, but reduced intermediate work and more predictable execution.

---

## VIII. Implications for Standardization

DOMPP can be reframed as a standards discussion about mutation-intent signaling and engine-hinted bulk updates rather than a new UI framework:

- an explicit API surface for common mutation forms
- an opt-in structural matching mode for regenerated child templates
- well-specified semantics that preserve existing DOM behavior

---

## IX. Conclusion

DOMPP proposes that improving native DOM ergonomics and making mutation intent explicit can reduce constant-factor overhead for common UI updates. A JavaScript prototype supports early evaluation, while the long-term hypothesis is that engine integration could further optimize structural matching and batching under unchanged platform semantics.

---

## References (Working Set)

[1] MDN Web Docs. Document Object Model (DOM).

[2] WHATWG. DOM Standard.

[3] X. Chamberland-Thibeault and S. Hallé. *An Empirical Study of Web Page Structural Properties* (longitudinal structural profiling; Wayback Machine methodology). PDF: `docs/preprints/references/An_Empirical_Study_of_Web_Page_Structural_Properties.pdf`.

[4] R. Ollila. *Modern Web Frameworks: A Comparison of Rendering Performance* (benchmarking rendering strategies; emphasizes scaling and validity caveats). PDF: `docs/preprints/references/Modern_Web_Frameworks_A_Comparison_of_Rendering_Performance.pdf`.

[5] A. Bai. *Million.js: A Fast Compiler-Augmented Virtual DOM for the Web* (compiler-augmented VDOM; benchmarks vs direct DOM updates). PDF: `docs/preprints/references/Million.js - A Fast Compiler-Augmented Virtual DOM for the Web.pdf`.

[6] M. Ajit Varma. *The Evolution of Frontend Architecture: From Virtual DOM to Server Components* (survey; server-driven/hybrid architectures and tooling). PDF: `docs/preprints/references/The Evolution of Frontend Architecture - From Virtual DOM to Server Components.pdf`.

[7] J. Vepsinen. *Emergence of hybrid rendering models in web application development* (Aalto University thesis; islands/hydration/hybrid techniques). PDF: `docs/preprints/references/Emergence of hybrid rendering models in web application development.pdf`.

[8] *The Evolution of JavaScript Frameworks - Performance, Scalability, and Developers Experience* (framework comparison with explicit validity/applicability discussion; includes WebAssembly↔DOM interop notes). PDF: `docs/preprints/references/The Evolution of JavaScript Frameworks - Performance, Scalability, and Developers Experience.pdf`.

[9] *A Comparative Review of Server Rendering and Client Side Rendering in Web Development* (SSR vs CSR overview; note: this PDF appears to be largely non-text-extractable in this repo snapshot). PDF: `docs/preprints/references/A Comparative Review of Server Rendering and Client Side Rendering in Web Development.pdf`.
