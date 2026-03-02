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

### A. The DOM as a Contract

Platform specifications define the observable semantics of DOM mutation. Any proposal that extends DOM ergonomics must preserve these semantics and interoperate with existing authoring models. [1], [2]

### B. Empirical Context: DOM Growth and Structural Complexity

Longitudinal structural profiling of real-world pages motivates paying attention to DOM size and update locality. One study reports that page size follows an inverse exponential distribution and that almost all surveyed pages contain fewer than 2,000 HTML tags, suggesting that constant factors and predictable locality matter for common interactive updates. [3]

### C. Rendering Architectures and Reconciliation

Prior work frames a key tradeoff between:

- imperative code that calls DOM APIs directly, and
- declarative frameworks that generate DOM calls dynamically based on reconciliation strategies.

The relevant cost is not only the mutation itself, but also the work required to determine which mutations to perform. Framework comparisons emphasize that results depend heavily on workload equivalence, identity handling, measurement definition, and environment control. [4], [8]

### D. Compiler-Augmented and Hybrid Models

Recent approaches reduce runtime diffing overhead via compilation or hybrid rendering strategies. A compiler-augmented virtual DOM system (Million.js) demonstrates that compiler transformations can narrow gaps to direct DOM updates in some cases, while direct DOM updates remain an important baseline for scripting-time overhead. [5] Survey work on frontend architecture further highlights the shift toward server-driven and hybrid models (e.g., streaming SSR, server components), which increases diversity in rendering strategies and strengthens the case for a stable, low-level mutation vocabulary. [6], [7]

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

### B. Localized Updates

For retained updates that target a known node:

- `setText` on a single node: **time O(1)**, **space O(1)** (ignoring string allocation).
- `setAttributes` on a small attribute map: **time O(1)** (bounded by attribute keys), **space O(1)**.
- `setStyles` on a bounded style map: **time O(1)**, **space O(1)**.
- `setEvents` on a bounded handler map: **time O(1)**, **space O(1)**.

### C. List Updates and Identity

For a list of `n` items:

- replacing all children by position (no keyed reuse) implies **time O(n)** and can imply **space O(n)** if new nodes are allocated.
- keyed reconciliation (id-based matching) still requires **time O(n)** to traverse templates, but can reduce DOM churn by reusing existing nodes, reducing allocations and preserving identity for event handlers and state associated with nodes.

DOMPP makes the identity strategy explicit:

- retained references (no template recreation) avoid reconciliation entirely for many updates,
- regenerated templates can opt into `matchById` when structural matching is intended.

### D. Prototype vs Engine-Integrated Interpretation

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
- and well-specified behavior for setter composition (text/children/styles/attributes/events) that remains interoperable with today’s DOM.

---

## VIII. Conclusion

DOMPP proposes a deterministic, chainable mutation interface on native DOM nodes with optional explicit reconciliation for regenerated templates. The paper positions a JavaScript prototype as an executable specification and uses demonstrations plus complexity analysis to motivate an engine-oriented hypothesis: if mutation intent is expressed explicitly and uniformly, browsers can implement common update patterns with less intermediate work while preserving platform semantics.

---

## References (Working Set)

[1] MDN Web Docs. Document Object Model (DOM).

[2] WHATWG. DOM Standard.

[3] X. Chamberland-Thibeault and S. Hallé. *An Empirical Study of Web Page Structural Properties*. PDF: `docs/preprints/references/An_Empirical_Study_of_Web_Page_Structural_Properties.pdf`.

[4] R. Ollila. *Modern Web Frameworks: A Comparison of Rendering Performance*. PDF: `docs/preprints/references/Modern_Web_Frameworks_A_Comparison_of_Rendering_Performance.pdf`.

[5] A. Bai. *Million.js: A Fast Compiler-Augmented Virtual DOM for the Web*. PDF: `docs/preprints/references/Million.js - A Fast Compiler-Augmented Virtual DOM for the Web.pdf`.

[6] M. Ajit Varma. *The Evolution of Frontend Architecture: From Virtual DOM to Server Components*. PDF: `docs/preprints/references/The Evolution of Frontend Architecture - From Virtual DOM to Server Components.pdf`.

[7] J. Vepsinen. *Emergence of hybrid rendering models in web application development*. PDF: `docs/preprints/references/Emergence of hybrid rendering models in web application development.pdf`.

[8] *The Evolution of JavaScript Frameworks - Performance, Scalability, and Developers Experience*. PDF: `docs/preprints/references/The Evolution of JavaScript Frameworks - Performance, Scalability, and Developers Experience.pdf`.
