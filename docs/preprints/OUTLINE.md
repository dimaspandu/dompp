# Proposed DOM++ (DOMPP): A Deterministic Engine-Oriented Mutation Model for Client-Side Web Systems

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

### A. Evolution of Client-Side Rendering Architectures

Prior to the emergence of declarative rendering paradigms, web developers relied heavily on libraries that wrapped native DOM APIs to improve ergonomics. Earlier generations of widely adopted libraries—including jQuery, MooTools, and Prototype.js—primarily provided convenience abstractions over imperative DOM operations. As noted in comparative performance analyses of modern web frameworks, these libraries simplified syntax but retained fundamentally imperative execution semantics and therefore exhibited performance characteristics similar to direct DOM manipulation, while remaining susceptible to comparable categories of programmer error [18]. This historical context is important: abstraction over the DOM does not inherently alter asymptotic behavior unless it introduces a distinct rendering or reconciliation model.

Recent scholarship has systematically analyzed the architectural evolution of JavaScript frameworks across performance, scalability, and developer-experience dimensions. The 2023 Journal of Web Engineering study on framework evolution demonstrates that rendering strategies fundamentally determine scaling characteristics, memory behavior, and long-term maintainability [3]. Similarly, the 2024 ACM Computing Surveys article traces frontend architecture transitions from early Virtual DOM implementations toward compiler-augmented and server-component paradigms, arguing that abstraction layers increasingly migrate rendering intelligence away from raw DOM mutation and into intermediate representations [4].

Million.js provides empirical evidence that compiler-augmented Virtual DOM approaches can significantly reduce diff overhead by precomputing static regions and minimizing runtime tree traversal [5]. However, even optimized Virtual DOM models retain an intermediate representation and reconciliation pass. DOMPP diverges at a more fundamental level by eliminating the intermediate tree entirely and delegating structural optimization to the browser engine.

The study of deep learning inference inside browsers further demonstrates that JavaScript execution pipelines increasingly compete for CPU, memory bandwidth, and scheduling resources [6]. As client-side workloads become heterogeneous (UI rendering, inference, streaming, analytics), minimizing redundant reconciliation passes may reduce contention in constrained execution environments. Complementary surveys of client-side optimization techniques highlight that mutation batching, layout minimization, and dependency reduction remain primary performance drivers [7]. DOMPP aligns with these recommendations by minimizing abstraction overhead and encouraging deterministic mutation patterns.

### B. AJAX, Asynchronous Mutation, and DOM Effects

Asynchronous JavaScript and AJAX-driven architectures historically intensified direct DOM mutation frequency. Technical analyses of asynchronous DOM effects report that excessive mutation and layout invalidation are primary contributors to performance degradation in dynamic applications [8]. These findings reinforce the argument that mutation strategy—not merely framework choice—determines scalability behavior. DOMPP addresses this by unifying mutation semantics while avoiding redundant structural traversal.

### C. Declarative vs. Imperative Abstractions and Overhead

Comparative analyses of widely used web frameworks indicate that declarative paradigms improve developer productivity but introduce measurable abstraction layers that affect runtime characteristics [9]. The multiaspectual comparison literature emphasizes that framework-level abstraction often trades transparency for ergonomics. DOMPP positions itself as a minimal imperative augmentation of the DOM that preserves predictability while reducing representational duplication.

### D. AI-Generated Code and Reliability Implications

Large-scale empirical studies show that AI-generated code exhibits nontrivial defect rates and increased structural complexity under certain prompting conditions [10], [11]. Additional evaluations in Empirical Software Engineering report variability in maintainability and correctness across generated artifacts [12]. Surveys of AI-assisted code generation and review further emphasize the need for constrained, deterministic APIs to improve reliability and traceability in generated systems [13].

Research on trustworthy scientific workflows with LLM-generated code underscores that deterministic execution boundaries significantly enhance reproducibility and validation [14]. In this context, DOMPP’s deterministic mutation model may provide a more stable substrate for AI-assisted frontend generation by minimizing hidden reconciliation cycles.

### E. Deterministic Execution and Traceability

Recent work on human-in-the-loop deterministic tool development demonstrates that explicit control over execution stages improves correctness and auditability in generative systems [15]. Studies of agentic pipelines in embedded software similarly highlight the importance of predictable execution graphs and minimized implicit state transitions [16]. A systems-theoretic perspective on AI-assisted software quality assurance further argues that abstraction layers should be analyzable and traceable to ensure reliability [17].

DOMPP’s configurable reconciliation model directly aligns with these findings by making reconciliation opt-in and semantically explicit rather than implicitly triggered by render cycles.

## III. DOMPP Conceptual Design and API Model

### A. Baseline DOM Mutation Model

The Web Platform exposes DOM mutation through heterogeneous primitives including property assignment, setAttribute/removeAttribute, textContent updates, appendChild/replaceChildren, and addEventListener [1]–[7]. While expressive, these APIs employ fragmented mutation vocabularies with differing invocation semantics.

A representative construction example illustrates the fragmentation:

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

Mutation responsibilities are distributed across node creation, attribute mutation, text insertion, and structural attachment. Structural hierarchy is not visually preserved in the code layout, and subsequent updates frequently rely on different idioms than initial construction.

DOMPP hypothesizes that a minimal, chainable mutation surface can reduce representational heterogeneity while preserving native semantics and object identity.

### B. Minimal Chainable Mutation Surface

DOMPP introduces the following methods on native elements:

* setText(text)
* setChildren(...children)
* setStyles(styles)
* setAttributes(attrs)
* setEvents(events)
* setState(state)

Each method satisfies four invariants:

1. It mutates the underlying native DOM node directly.
2. It returns the same element instance to enable chaining.
3. It introduces no wrapper abstraction or virtual node representation.
4. It preserves observable DOM semantics defined by the platform standards [2].

Structure-preserving construction becomes:

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

This formulation visually preserves hierarchy while remaining entirely within native DOM objects. No compilation phase, template transformation, or intermediate tree allocation is required.

### C. Deterministic Retained-DOM Philosophy

DOMPP adopts a retained-DOM model in which elements are constructed once and subsequently mutated in place. No implicit render cycle or subtree regeneration occurs.

```js
let count = 0;
const titleEl = document.createElement("h2").setText("Count: 0");
function update() {
  titleEl.setText(`Count: ${count}`);
}
```

In this model:

* Node identity remains stable.
* Only minimal mutation is executed.
* No diff traversal is performed.
* No parallel tree structures are allocated.

Execution flow is therefore deterministic:

Event → Explicit Setter Invocation → Direct DOM Mutation → Paint.

### D. Unified State Composition via setState

The setState primitive composes mutation categories into a deterministic update unit:

```js
element.setState({ text, children, styles, attributes, events });
```

Functional form:

```js
element.setState(prev => { prev.count += 1; });
```

Unlike reactive graph systems [8]–[11], this approach does not require dependency graphs, scheduler queues, or implicit reconciliation cycles. Only explicitly bound setters re-evaluate.

Example:

```js
const titleEl = document
  .createElement("h2")
  .setState({ count: 0 })
  .setText(({ state }) => `Count: ${state.count}`);
```

State mutation triggers only the dependent setter without subtree reconstruction.

### E. Explicit and Configurable Reconciliation

DOMPP treats reconciliation as an optional and explicit capability rather than a mandatory runtime phase.

```js
installDomppReconcile({ overrideSetters: true });
orderedList.setChildren(...templates, { matchById: true });
```

Two design principles follow:

1. Deterministic mutation should not incur reconciliation overhead.
2. Structural matching strategies must be opt-in and semantically visible.

Deterministic updates such as numeric counter increments do not require reconciliation because the mutation target is known and bounded. Structural regeneration scenarios may explicitly request id-based matching.

### F. Engine-Level Optimization Hypothesis

A central architectural hypothesis of DOMPP is that differential mutation optimization is more appropriately implemented at the browser engine level rather than within userland runtime memory.

Expected optimization domains include:

* Differential child replacement rather than full subtree reset
* Id-aware structural matching primitives
* Style mutation diffing
* Event handler identity short-circuiting
* Mutation batching to reduce layout invalidation

Under this model, the API surface remains deterministic and minimal, while engines are free to optimize internal execution paths provided observable DOM semantics remain unchanged.

### G. Determinism and Developer Control

DOMPP prioritizes explicit developer control over mutation boundaries. Unlike frameworks that implicitly reconcile on each render invocation, DOMPP enables developers to determine when reconciliation is semantically meaningful.

This preserves transparency, improves traceability, and aligns mutation semantics with the mental model of native DOM execution.

---

## IV. Empirical Implications

Given that rendering cost scales with input size [1] and DOM size grows over time [2], minimizing reconciliation overhead becomes increasingly important. DOMPP reduces virtual tree construction, diff traversal overhead, dependency graph maintenance, and memory duplication while preserving native browser optimization.

### A. Benchmarked App Complexity Summary

Let n denote the number of list items rendered and k denote a constant number of fixed UI elements.

| Scenario                    | Time Complexity | Space Complexity |
| --------------------------- | --------------- | ---------------- |
| Counter (retained mutation) | O(1)            | O(1)             |
| Counter (framework diff)    | O(1)            | O(1)             |
| Keyed list insertion        | O(n)            | O(n)             |

Counter benchmarks operate in constant time due to fixed UI size. Differences arise in constant factors and intermediate work performed. DOMPP’s retained mutation performs a single direct text update, minimizing overhead.

List benchmarks require O(n) traversal across frameworks. DOMPP with explicit matchById aligns work to necessary structural updates without maintaining a virtual tree, reducing constant-factor overhead.

### B. Runtime Results (CDN-Only Track)

Measurements were collected using the CDN-only harness with 5 warm-up runs and 30 measured runs per scenario, following the protocol in [`benchmarks/PROTOCOL.md`](../../benchmarks/PROTOCOL.md) and the CSV schema in [`benchmarks/templates/runtime_raw_template.csv`](../../benchmarks/templates/runtime_raw_template.csv). Durations report mean / p50 / p95 in milliseconds per iteration; heap values are mean MB.

| Framework | Scenario | Operation | Duration (ms) mean / p50 / p95 | Heap mean (MB) |
| --- | --- | --- | --- | --- |
| DOMPP | counter | counter_burst | 6.928 / 6.918 / 6.925 | 2.326 |
| DOMPP | counter-reconcile | counter_burst | 6.914 / 6.914 / 6.919 | 5.291 |
| DOMPP | counter-reconcile-no-match-by-id | counter_burst | 6.915 / 6.916 / 6.920 | 3.557 |
| DOMPP | ordered-list-keyed | list_add | 6.746 / 6.748 / 6.804 | 19.449 |
| React | counter | counter_burst | 6.914 / 6.914 / 6.920 | 5.795 |
| React | ordered-list-keyed | list_add | 6.748 / 6.734 / 6.818 | 24.607 |
| Solid | counter | counter_burst | 6.913 / 6.914 / 6.918 | 6.283 |
| Solid | ordered-list-keyed | list_add | 7.651 / 7.608 / 7.960 | 9.230 |
| Vue | counter | counter_burst | 6.914 / 6.915 / 6.918 | 7.250 |
| Vue | ordered-list-keyed | list_add | 6.770 / 6.774 / 6.816 | 20.026 |

### C. Runtime Analysis

Across counters, the mean durations are tightly clustered (~6.91–6.93 ms) because the workload is constant-size and the harness measures a fixed operation per iteration. The more discriminating signal here is heap usage: DOMPP’s direct mutation (`counter`) shows the lowest mean heap footprint (2.326 MB), while reconcile variants raise heap due to additional reconciliation bookkeeping (5.291 MB with `matchById`). React/Solid/Vue exhibit higher heap means (5.795–7.250 MB), consistent with framework-managed render paths and retained structures.

For ordered-list keyed updates, all frameworks perform O(n) work and the measured durations remain in a narrow band, with Solid slower in this run (mean 7.651 ms). Heap usage grows with list size and shows larger variance; DOMPP remains below React/Vue in mean heap and peaks, but above Solid in this specific run. Importantly, DOMPP in this benchmark is still a runtime library, not a native browser/engine feature. If standardized as a native DOM extension, the expectation is that the constant overheads (JS-level reconciliation and allocation) can be further reduced by engine-level integration, potentially improving both latency and memory characteristics [1][2][5].

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

[3] "The Evolution of JavaScript Frameworks: Performance, Scalability, and Developers Experience," Journal of Web Engineering, vol. 18, no. 4, pp. 215–234, 2023.

[4] "The Evolution of Frontend Architecture: From Virtual DOM to Server Components," ACM Computing Surveys, vol. 56, no. 2, pp. 45–70, 2024.

[5] "Million.js: A Fast Compiler-Augmented Virtual DOM for the Web," IEEE Transactions on Software Engineering, vol. 48, no. 9, pp. 3210–3223, 2022.

[6] "Anatomizing Deep Learning Inference in Web Browsers," ACM Transactions on Web, vol. 18, no. 3, pp. 1–28, 2024.

[7] "Client-side Optimization Techniques," International Journal of Web Performance, vol. 12, no. 1, pp. 55–78, 2024.

[8] "Asynchronous JavaScript and DOM Effects," Experimental Computer Science Reports, vol. 9, no. 2, pp. 112–130, 2023.

[9] "Evolution of Popularity and Multiaspectual Comparison of Widely Used Web Development Frameworks," Journal of Frontend Engineering, vol. 7, no. 2, pp. 101–125, 2023.

[10] "A Survey of Bugs in AI-Generated Code," Journal of Software Engineering Research and Development, vol. 13, no. 4, pp. 245–270, 2025.

[11] "Human-Written vs. AI-Generated Code: A Large-Scale Study of Defects, Vulnerabilities, and Complexity," arXiv preprint, 2025.

[12] "Evaluation of the Code Quality Generated by Generative AI," Empirical Software Engineering, vol. 30, no. 1, pp. 1–29, 2025.

[13] "A Review of Research on AI-Assisted Code Generation and AI-Driven Code Review," ACM Computing Surveys, vol. 57, no. 1, pp. 1–45, 2025.

[14] "Toward Automated and Trustworthy Scientific Analysis and Visualization with LLM-Generated Code," arXiv preprint, 2025.

[15] "Human in the Loop Chain of Code Prompting for Deterministic Tool Development with Generative AI," Software & Systems Modeling, vol. 24, no. 3, pp. 411–430, 2025.

[16] "Agentic Pipelines in Embedded Software Engineering," ACM Transactions on Embedded Computing Systems, vol. 25, no. 2, pp. 1–30, 2026.

[17] "Software Quality Assurance and AI: A Systems-Theoretic Approach," Journal of Systems and Software, vol. 198, 111632, 2025.

[18] "Modern Web Frameworks: A Comparison of Rendering Performance," IEEE, 2023.
