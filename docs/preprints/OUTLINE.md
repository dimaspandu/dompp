# DOM++ (DOMPP): Deterministic, Chainable DOM Mutation with Optional Reconciliation

**Dimas Pratama**  
Repository: `dimaspandu/dompp`

---

## Abstract

Modern web UI development is dominated by declarative frameworks that translate state changes into DOM mutations via reconciliation and scheduling mechanisms. While effective, these approaches introduce intermediate representations, hidden update cycles, and additional runtime overhead that can obscure the true mutation boundary. This paper proposes DOM++ (DOMPP): a minimal, deterministic mutation vocabulary expressed as chainable setters on native DOM nodes. DOMPP preserves native node identity and makes mutation intent explicit at the call site, while optionally supporting id-based child matching (`matchById`) for workloads that intentionally regenerate template nodes. We present a JavaScript prototype as an executable specification and provide demonstration-driven analysis of API usage patterns. Rather than reporting runtime benchmark numbers from the prototype (which would primarily measure userland overhead), we evaluate the approach using time and space complexity arguments under a DOM-level cost model, and discuss how an engine-integrated implementation could further reduce constant-factor costs while preserving platform semantics.

**Keywords**: DOM, mutation, reconciliation, UI rendering, complexity analysis, web standards

---

## I. Introduction

The DOM is the platform boundary for UI on the Web: regardless of framework, user-visible changes ultimately become DOM mutations governed by standardized semantics. Existing frameworks provide strong authoring ergonomics by letting developers describe desired UI state declaratively, but they typically do so by introducing intermediate representations (virtual trees, reactive graphs, templates) and implicit update cycles. These layers can:

- obscure where and when mutations occur,
- duplicate state in memory,
- and impose reconciliation work whose cost does not always correlate with the actual update intent.

This paper explores a complementary direction: improving the ergonomics of direct DOM mutation without introducing wrapper objects or a mandatory reconciliation phase.

### Contributions

1. **A minimal chainable mutation surface** on native DOM nodes, unifying common mutation categories.
2. **A deterministic retained-mutation model**: updates occur only via explicit setters on stable node references.
3. **Optional, explicit reconciliation** via id-based matching for regenerated child templates.
4. **A complexity-based evaluation** that focuses on asymptotic behavior and memory duplication, while separating prototype overhead from the engine-level hypothesis.

---

## II. Background and Related Work

### A. Web Platform Mutation Primitives (Baseline)

DOMPP is intentionally framed as an ergonomic layer over existing DOM semantics rather than a competing rendering architecture. The relevant baseline is the platform-defined behavior of DOM mutation primitives such as:

- text mutation (`textContent`), [3]
- child replacement / subtree rewiring (`replaceChildren` and related child insertion/removal operations), [4]
- attribute mutation (`setAttribute`, `removeAttribute`), [5], [6]
- and event listener installation (`addEventListener`). [7]

Any extension to DOM ergonomics must preserve observable semantics defined by the DOM Standard and remain compatible with existing Web authoring practices. [1], [2]

### B. Imperative Mutation vs Declarative Reconciliation

UI systems commonly trade explicit, imperative DOM mutation for declarative authoring. In declarative models, updates are derived by reconciliation (diffing) and then executed as DOM operations. DOMPP targets a middle ground:

- it retains imperative control and stable node identity (retained references),
- but optionally supports explicit, opt-in structural matching (`matchById`) for list workloads where templates are regenerated.

Framework comparisons emphasize that results depend on workload equivalence, identity strategy (keyed vs positional), and measurement definition. [9], [13] This motivates DOMPP's evaluation framing: focus on a DOM-level cost model and operation categories, and treat prototype runtime timings as secondary evidence.

### C. Reactive and Incremental Computation Foundations

Although DOMPP itself is not a reactive graph system, its motivation overlaps with prior work on incremental and reactive computation: avoid recomputing or re-materializing more than necessary when inputs change. Surveys of reactive programming [14] and foundational work on adaptive functional programming [15] and incremental computation with names [16] provide conceptual grounding for why "update locality" and stable identity (naming) matter when designing update mechanisms.

DOMPP can be viewed as bringing a similar locality principle to DOM mutation: keep stable references for frequent updates, and make structural matching explicit when regeneration is intentional.

### D. Human Factors: Auditability and Cognitive Load

DOMPP's "auditability" goal (mutations are visible at the call site) is motivated by program comprehension concerns. Prior work surveys how tools and theories support comprehension tasks in evolving codebases. [17] Cognitive load research suggests that reducing hidden mechanisms and intermediate representations can aid reasoning about behavior. [18] While DOMPP does not claim to eliminate complexity, it attempts to keep the mutation boundary explicit and mechanically local.

### E. Compiler-Augmented and Hybrid Rendering Trends

Recent approaches attempt to reduce diffing and scheduling overhead through compilation or hybrid architectures. A compiler-augmented virtual DOM approach (Million.js) illustrates that compilation can narrow the gap to direct DOM updates for some workloads. [10] Broader survey-style discussions of frontend architecture describe shifts toward hybrid/server-driven rendering (e.g., server components, streaming), increasing diversity in how DOM mutations are produced and scheduled. [11], [12] This diversity strengthens the case for a stable, low-level mutation vocabulary that remains useful across architectures.

---

## III. DOMPP Conceptual Model

### A. Design Goals

- **Determinism**: updates happen only when explicitly invoked.
- **Native identity**: mutations target actual DOM nodes created by the program.
- **Minimal surface**: avoid new template languages or required build steps.
- **Auditability**: code visually expresses the mutation boundary.

### B. Non-goals

- DOMPP is not intended to replace declarative frameworks.
- DOMPP does not claim asymptotic improvements for optimal keyed updates; the aim is reduced intermediate work, reduced memory duplication, and explicitness.

### C. API Surface

DOMPP is expressed as chainable methods on native elements:

- `setText(text | (ctx) => text)`
- `setChildren(...children | (ctx) => children)`
- `setStyles(styles | (ctx) => styles)`
- `setAttributes(attrs | (ctx) => attrs)`
- `setEvents(handlers | (ctx) => handlers)`

Optional addon primitives used in demonstrations:

- `setState(initial | (ctx) => void)` for element-local state and deterministic update entry points
- `setChildren(...templates, { matchById: true })` in reconcile mode for id-aware structural matching

Each setter:

1. mutates the underlying DOM node directly,
2. returns the same element instance,
3. introduces no wrapper nodes or virtual representations,
4. preserves platform semantics.

---

## IV. Demonstrations (Use Cases)

This section functions as an executable specification: each use case is implementable with the repository prototype, and each illustrates a mutation pattern that maps directly to DOM-level operations.

### A. Structure-Preserving Construction

Goal: author DOM trees so source structure mirrors DOM structure.

Example pattern:

- build nested subtrees with `setChildren(...)`,
- apply `setText(...)`/`setAttributes(...)` close to the node they affect.

**Listing 1. Structure-preserving construction (nested `setChildren`).**

```js
import "../../src/index.js";

document.getElementById("app").setChildren(
  document.createElement("article").setChildren(
    document.createElement("h2").setText("Hello DOMPP"),
    document.createElement("p").setText("Structure in code mirrors the DOM tree."),
    document.createElement("a")
      .setAttributes({ href: "#details" })
      .setText("Details")
  )
);
```

Full examples: `examples/minimal-counter/index.html`, `README.md`.

### B. Localized Retained Updates (O(1) Target)

Goal: update a stable node without subtree regeneration.

Examples:

- counter text update via `setText(...)`,
- toggle a single attribute/class via `setAttributes(...)`,
- update a style map via `setStyles(...)`.

**Listing 2. Retained update: mutate one existing node (no re-render).**

```js
import "../../src/index.js";

let count = 0;
const titleEl = document.createElement("h2").setText("Count: 0");

function update() {
  titleEl.setText(`Count: ${count}`);
}

document.getElementById("app").setChildren(
  titleEl,
  document.createElement("button")
    .setText("Increment")
    .setEvents({ click: () => { count += 1; update(); } })
);
```

Full example: `examples/minimal-counter/counter.js`.

### C. Event Binding as Explicit Mutation

Goal: make handler installation and replacement explicit.

Example pattern:

- bind handlers with `setEvents({ click: fn, ... })`,
- update handler identity deliberately (e.g., replacing a closure) when semantics require it.

**Listing 3. Event binding is an explicit mutation (`setEvents`).**

```js
import "../../src/index.js";

const button = document.createElement("button")
  .setText("Click")
  .setEvents({
    click(event) {
      console.log("clicked", event.type);
    }
  });
```

### D. Element-Local State (Deterministic Entry Point)

Goal: unify multiple mutation categories under one explicit update entry.

Example pattern:

- attach local state with `setState({ ... })`,
- compute derived outputs via callback forms of setters,
- mutate state via `setState(updater)` to trigger only bound setters.

**Listing 4. Element-local state and deterministic updates (`setState`).**

```js
import "../../src/index.js";
import { installDomppStateful } from "../../src/reactive/stateful.js";

installDomppStateful();

const titleEl = document.createElement("h2")
  .setState({ count: 0 })
  .setText(({ state }) => `Count: ${state.count}`);

document.getElementById("app").setChildren(
  titleEl,
  document.createElement("button")
    .setText("+1")
    .setEvents({ click: () => titleEl.setState(({ state }) => { state.count += 1; }) })
);
```

Full example: `examples/stateful-counter/counter.js`.

### E. Regenerated Templates with Explicit Reconciliation

Goal: support list workloads where templates are recreated but stable DOM identity is desired.

Example pattern:

- render list item templates with stable `id` attributes,
- call `list.setChildren(...templates, { matchById: true })`.

This makes the reconciliation boundary explicit and opt-in at the mutation site.

**Listing 5. Regenerated templates with explicit id-based matching (`matchById`).**

```js
import "../../src/index.js";
import { installDomppReconcile } from "../../src/addons/reconcile.addon.js";

installDomppReconcile({ overrideSetters: true });

const list = document.createElement("ol");
const items = [{ id: "a", text: "A" }, { id: "b", text: "B" }];

const templates = items.map((item) =>
  document.createElement("li")
    .setAttributes({ id: item.id })
    .setText(item.text)
);

list.setChildren(...templates, { matchById: true });
```

Full example: `examples/reconcile-match-by-id-ordered-list/counter.js`.

---

## V. Complexity Analysis (Time and Space)

### A. Cost Model

Let:

- `n` be the number of children in a list,
- `k` be the number of fixed nodes in a small widget (constant),
- and assume DOM mutation primitives are the fundamental operations (text update, attribute update, insert/remove/move child, install/remove event).

DOMPP does not change the theoretical lower bound of DOM operations needed for a given visible outcome. Its claim is about reducing intermediate work and making the mutation boundary explicit.

### B. Evaluation Method: DOM Operation Counts (Non-timing)

Because the current implementation is a JavaScript prototype, end-to-end script timings primarily measure userland overhead (allocations, callback dispatch, bookkeeping) rather than the long-term "engine-integrated primitive" hypothesis. Therefore, the primary empirical signal used in this paper is operation counting under a DOM-level cost model:

1. instrument a run of each demonstration to count DOM mutations by category (text changes, attribute changes, child inserts/removes/moves, event listener add/remove),
2. compare counts between usage patterns (retained reference update vs regenerated template + `matchById`),
3. and interpret results alongside asymptotic bounds (O(1) localized update vs O(n) list traversal).

This avoids overstating prototype timing results while still providing an experiment grounded in observable DOM work.

### C. Localized Updates

For retained updates that target a known node:

- `setText` on a single node: **time O(1)**, **space O(1)** (ignoring string allocation).
- `setAttributes` on a small attribute map: **time O(1)** (bounded by attribute keys), **space O(1)**.
- `setStyles` on a bounded style map: **time O(1)**, **space O(1)**.
- `setEvents` on a bounded handler map: **time O(1)**, **space O(1)**.

### D. List Updates and Identity

For a list of `n` items:

- replacing all children by position (no keyed reuse) implies **time O(n)** and can imply **space O(n)** if new nodes are allocated.
- keyed reconciliation (id-based matching) still requires **time O(n)** to traverse templates, but can reduce DOM churn by reusing existing nodes, reducing allocations and preserving identity for event handlers and state associated with nodes.

DOMPP makes the identity strategy explicit:

- retained references (no template recreation) avoid reconciliation entirely for many updates,
- regenerated templates can opt into `matchById` when structural matching is intended.

### E. Prototype vs Engine-Integrated Interpretation

The current repository implementation is a JavaScript prototype. Any measurement of script execution time on this prototype would largely capture userland overhead (JS allocations, callback dispatch, bookkeeping). Because the long-term hypothesis is that these setters could be native engine primitives, prototype benchmark numbers are not used as primary evidence. Instead, this paper uses complexity analysis plus demonstrations to argue about:

- which categories of work are necessary (DOM operations), and
- which categories are avoidable or relocatable (intermediate representations and reconciliation bookkeeping).

---

## VI. Discussion and Limitations

- **Where DOMPP helps**: localized updates with stable references; explicit mutation boundaries; reduced representational duplication.
- **Where DOMPP does not help**: workloads that inherently require O(n) structural work; complex coordination problems that frameworks solve via scheduling and dependency graphs.
- **Limitations of complexity-only evaluation**: constant factors matter in practice, and engine behavior is nuanced (layout, style, paint). Complexity arguments are necessary but not sufficient for a full performance claim; they primarily justify the design direction and shape the engine-level hypothesis.

---

## VII. Implications for Standardization

DOMPP can be reframed as a standards discussion about mutation-intent signalling and engine-hinted bulk updates:

- a small explicit mutation vocabulary that preserves existing DOM semantics,
- an opt-in id-aware structural matching mode for regenerated templates,
- and well-specified behavior for setter composition (text/children/styles/attributes/events) that remains interoperable with today's DOM.

---

## VIII. Conclusion

DOMPP proposes a deterministic, chainable mutation interface on native DOM nodes with optional explicit reconciliation for regenerated templates. The paper positions a JavaScript prototype as an executable specification and uses demonstrations plus complexity analysis to motivate an engine-oriented hypothesis: if mutation intent is expressed explicitly and uniformly, browsers can implement common update patterns with less intermediate work while preserving platform semantics.

---

## References

[1] WHATWG, "DOM Standard." https://dom.spec.whatwg.org/ (accessed 2026-02-21).

[2] MDN Web Docs, "Document Object Model (DOM)." https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model (accessed 2026-02-21).

[3] MDN Web Docs, "Node: textContent property." https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent (accessed 2026-02-21).

[4] MDN Web Docs, "Element: replaceChildren() method." https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren (accessed 2026-02-21).

[5] MDN Web Docs, "Element: setAttribute() method." https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute (accessed 2026-02-21).

[6] MDN Web Docs, "Element: removeAttribute() method." https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute (accessed 2026-02-21).

[7] MDN Web Docs, "EventTarget: addEventListener() method." https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener (accessed 2026-02-21).

[8] X. Chamberland-Thibeault and S. Halle, "An Empirical Study of Web Page Structural Properties," manuscript (PDF), n.d.

[9] R. Ollila, "Modern Web Frameworks: A Comparison of Rendering Performance," manuscript (PDF), n.d.

[10] A. Bai, "Million.js: A Fast Compiler-Augmented Virtual DOM for the Web," manuscript (PDF), n.d.

[11] M. Ajit Varma, "The Evolution of Frontend Architecture: From Virtual DOM to Server Components," manuscript (PDF), n.d.

[12] J. Vepsinen, "Emergence of hybrid rendering models in web application development," manuscript (PDF), n.d.

[13] "The Evolution of JavaScript Frameworks - Performance, Scalability, and Developers Experience," manuscript (PDF), n.d.

[14] E. Bainomugisha, A. L. Carreton, T. Van Cutsem, S. Mostinckx, and W. De Meuter, "A Survey on Reactive Programming," *ACM Computing Surveys*, vol. 45, no. 4, 2013. doi: 10.1145/2501654.2501666.

[15] U. A. Acar, G. E. Blelloch, and R. Harper, "Adaptive Functional Programming," *ACM Transactions on Programming Languages and Systems*, vol. 28, no. 6, pp. 990-1034, 2006. doi: 10.1145/1119479.1119480.

[16] M. A. Hammer, J. Dunfield, K. Headley, N. Labich, J. S. Foster, M. W. Hicks, and D. Van Horn, "Incremental Computation with Names," in *Proceedings of OOPSLA*, pp. 748-766, 2015. doi: 10.1145/2814270.2814305.

[17] M.-A. D. Storey, "Theories, Tools and Research Methods in Program Comprehension: Past, Present and Future," *Software Quality Journal*, vol. 14, no. 3, pp. 187-208, 2006. doi: 10.1007/s11219-006-9216-4.

[18] J. Sweller, "Cognitive Load During Problem Solving: Effects on Learning," *Cognitive Science*, vol. 12, no. 2, pp. 257-285, 1988. doi: 10.1016/0364-0213(88)90023-7.

[19] TC39, "The TC39 Process." https://tc39.es/process-document/ (accessed 2026-02-21).
