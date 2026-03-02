# Proposed DOM++ (DOMPP): We Might Just Need an API Like This

**Dimas Pandu Pratama**

Independent Researcher

Correspondence: dimas.pandu@example.com

**Version:** February 22, 2026

---

## Abstract

This paper proposes DOM++ (DOMPP), a minimal set of chainable DOM mutation helpers (`setText`, `setChildren`, `setStyles`, `setAttributes`, `setEvents`, and `setState`) designed to improve consistency between initial render and incremental updates in retained-DOM architectures. The proposal is motivated by three observations: (1) low-level DOM mutation remains central to browser UI systems, (2) reactive and incremental systems benefit from explicit, deterministic update primitives, and (3) many real UI updates are small, localized, and intentful, but are often expressed through heterogeneous mutation idioms. The core claim is not that this API replaces existing Web APIs or framework ecosystems, but that a narrow, semantics-preserving layer can reduce authoring complexity without introducing virtual DOM or wrapper objects. We present the API design, implementation rationale, and a demonstration-driven evaluation based on time/space complexity and mutation-intent analysis (treating the JavaScript prototype as an executable specification rather than a performance claim).

**Keywords:** DOM; retained mode UI; incremental updates; reactive programming; API design; complexity analysis; setState

---

## 1. Introduction

### 1.1. Motivation

Frontend development has experienced significant framework proliferation over the past decade. Teams face practical decisions between React's virtual DOM, Solid's fine-grained reactivity, Vue's proxy-based system, Svelte's compile-time approach, and Angular's comprehensive framework. While each solution addresses legitimate concerns, the ecosystem fragmentation creates several practical challenges:

- **Framework-selection churn** driven by perceived complexity and performance tradeoffs
- **Abstraction traceability cost** where debugging requires navigating multiple layers
- **Onboarding friction** for fullstack developers whose primary expertise is backend systems
- **Portability loss** when UI logic is tightly coupled to one framework runtime

As UI stacks become more toolchain-heavy and rendering strategies diversify, the bottleneck increasingly shifts from writing DOM code to reasoning about when and why mutations occur, and to ensuring that update behavior remains explicit and debuggable.

### 1.2. Problem Statement

In imperative UI code, initial construction and later updates often use different idioms:

- Property assignment (`el.id = ...`)
- Attribute APIs (`setAttribute`, `removeAttribute`)
- Direct text mutation (`textContent`)
- Event subscription (`addEventListener`, manual replacement)

This heterogeneity increases cognitive load and creates avoidable inconsistency in mutation code paths. The hypothesis is that a stable setter-shaped interface can reduce these inconsistencies while preserving platform semantics.

### 1.3. Contributions

This paper presents:

1. A minimal chainable DOM mutation API proposal with six core methods
2. Implementation rationale aligned with incremental computation principles
3. A demonstration-driven evaluation framing based on time/space complexity and explicit mutation boundaries
4. Discussion of standardization pathways and practical adoption scenarios

### 1.4. Paper Organization

Section 2 reviews related work in DOM manipulation, reactive programming, and rendering architectures. Section 3 presents the DOMPP API design and semantics. Section 4 details the implementation. Section 5 presents demonstrations and complexity analysis. Section 6 discusses expected outcomes and limitations. Section 7 concludes.

---

## 2. Background and Related Work

### 2.1. DOM and Web Platform Mutation Model

The Document Object Model (DOM) provides the foundational API for web UI manipulation [1,2]. Core mutation operations include:

- `textContent` for text content [4]
- `appendChild`, `insertBefore`, `replaceChildren` for child manipulation [5]
- `setAttribute`, `removeAttribute` for attributes [6,7]
- `addEventListener`, `removeEventListener` for events [3]

These primitives are intentionally low-level, enabling frameworks to build diverse abstractions atop them.

### 2.2. Reactive and Incremental Computation Foundations

Reactive programming emphasizes explicit update propagation and minimized recomputation [8]. Key principles include:

- **Explicit dependencies** between computed values
- **Incremental updates** rather than full recomputation
- **Deterministic propagation** order

Adaptive functional programming [9,10] demonstrates how dependency tracking enables efficient incremental updates. The DOMPP helpers are compatible with this direction because they expose deterministic mutation boundaries rather than hidden rendering passes.

Incremental computation with names [11] shows how stable identifiers enable efficient reconciliation—principles reflected in DOMPP's `setChildren` optimization expectations.

### 2.3. Program Comprehension and Cognitive Load

Program comprehension research highlights how representational complexity affects understanding effort [13]. Sweller's cognitive load theory [14] distinguishes:

- **Intrinsic load**: inherent complexity of the task
- **Extraneous load**: complexity from poor representation
- **Germane load**: effort toward schema construction

DOMPP targets extraneous load reduction by providing a uniform mutation vocabulary.

### 2.4. Evaluation Caveats (Prototype vs. Engine)

DOMPP in this repository is a JavaScript prototype. Direct performance measurement of the prototype primarily reflects userland overhead (allocations, callback dispatch, bookkeeping) rather than the proposed end state where the setters are native engine primitives. Therefore, this paper treats the prototype as an executable specification and focuses evaluation on:

- explicit mutation intent and boundaries (what is mutated, when, and why),
- time and space complexity arguments under a DOM-level cost model,
- and limitations that must be addressed by future engine-integrated validation.

---

## 3. Proposal: Chainable DOM Mutation API

### 3.1. Core API Surface

The proposal defines six chainable methods on `Element.prototype`:

```javascript
Element.prototype.setText(text): this
Element.prototype.setChildren(...children): this
Element.prototype.setStyles(styles): this
Element.prototype.setAttributes(attrs): this
Element.prototype.setEvents(events): this
Element.prototype.setState(state): this
```

`DocumentFragment.prototype` receives only `setText` and `setChildren`, reflecting its role as a lightweight container.

### 3.2. Semantic Baseline

#### 3.2.1. `setText(text)`

Equivalent to setting `textContent`; returns `this` for chaining [4].

```javascript
el.setText("Hello"); // equivalent to el.textContent = "Hello"
```

#### 3.2.2. `setChildren(...children)`

Semantic baseline: equivalent final DOM result to subtree replacement via `replaceChildren`. String arguments are converted to `Text` nodes [5].

```javascript
el.setChildren("Hello", document.createElement("span"));
```

**Optimization expectation (non-normative):** Implementations should avoid full child replacement when possible, mutating only the minimum necessary DOM nodes (insert/move/update/remove), similar to keyed/id-aware reconciliation strategies.

#### 3.2.3. `setStyles(styles)`

Applies key-value style mutations onto `element.style`; returns `this`.

```javascript
el.setStyles({ color: "red", display: "flex" });
```

**Optimization expectation (non-normative):** Only changed style properties should be written, and removed properties should be cleared without rewriting unaffected properties.

#### 3.2.4. `setAttributes(attrs)`

Boolean/null handling:

- `true`: set empty attribute
- `false`/`null`/`undefined`: remove attribute
- other: set attribute value (string-coercible) [6,7]

```javascript
el.setAttributes({ disabled: true, "data-id": "123", hidden: null });
```

**Optimization expectation (non-normative):** Perform differential attribute sync (set/remove only when value presence or content actually differs).

#### 3.2.5. `setEvents(events)`

Attaches handlers with replacement semantics per event key to avoid duplicate listener accumulation [3].

```javascript
el.setEvents({ click: handleClick, mouseover: handleHover });
```

In the current implementation, this uses per-element handler storage (`__dompp_handlers`) and remove-then-add replacement.

**Optimization expectation (non-normative):** If handler identity is unchanged for an event key, skip detach/attach.

#### 3.2.6. `setState(state)`

Composes multiple state updates into a single call. The `state` argument is an object with optional keys:

```javascript
el.setState({
  text: "Updated",
  attributes: { disabled: false },
  styles: { opacity: 1 },
  events: { click: newHandler }
});
```

Returns `this` for chaining.

**Optimization expectation (non-normative):** Implementations may batch or coalesce mutations across state keys to minimize layout thrashing and redundant DOM writes.

### 3.3. Non-Goals

This proposal does not introduce:

- Virtual DOM
- Template compilation
- Dependency tracking
- Component lifecycle model

These are explicitly out of scope to maintain minimal surface area.

### 3.4. Design Rationale

#### 3.4.1. Consistency Across Initial and Incremental Mutation

A setter-first interface provides one mutation vocabulary for both initial render and updates. For example, attributes are always updated through `setAttributes(...)`, not split across assignment styles.

#### 3.4.2. Declarative-Style Tree Construction Without Abstraction Wrappers

Fluent chaining enables readable tree construction while remaining in native DOM objects:

```javascript
const HTML = document.createElement("html").setChildren(
  document.createElement("head").setChildren(
    document.createElement("title").setText("My Document")
  ),
  document.createElement("body").setChildren(
    document.createElement("h1").setText("Header"),
    document.createElement("p").setText("Paragraph")
  )
);
```

#### 3.4.3. State Composition Benefits

The `setState` method provides:

- **Atomic updates**: Multiple mutations expressed as one operation
- **Batching opportunities**: Implementation can optimize across mutation types
- **Framework compatibility**: Similar mental model to React's `setState`, Solid's stores

---

## 4. Implementation

### 4.1. Installation Pattern

```javascript
function installDompp() {
  if (!Element.prototype.setText) {
    Element.prototype.setText = function(text) {
      this.textContent = text;
      return this;
    };
  }
  // ... other methods
}
```

Methods are installed only when absent (idempotent/non-destructive).

### 4.2. Current Implementation Status

DOMPP implements all proposed helpers as userland prototype extensions in `src/dom/dompp.js`, plus optional addons:

- `stateful`: Stateful signal-based reactivity
- `reconcile`: ID-based reconciliation for lists
- `vquery`: Virtual query optimization

These addons are explicitly out of standardization scope but demonstrate extensibility.

### 4.3. `setState` Implementation Strategy

```javascript
Element.prototype.setState = function(state) {
  if (state.text !== undefined) this.setText(state.text);
  if (state.children) this.setChildren(...state.children);
  if (state.styles) this.setStyles(state.styles);
  if (state.attributes) this.setAttributes(state.attributes);
  if (state.events) this.setEvents(state.events);
  return this;
};
```

Future optimization: batch DOM reads/writes to minimize layout thrashing.

---

## 5. Demonstrations and Complexity Analysis

### 5.1. Research Questions

- **RQ1**: What mutation patterns does DOMPP make explicit and uniform compared to baseline DOM idioms?
- **RQ2**: Under a DOM-level cost model, what are the time and space complexity characteristics of these patterns?
- **RQ3**: Which categories of overhead are prototype-specific (userland) vs plausibly engine-integratable if the setters were native?
- **RQ4**: When is optional reconciliation (`matchById`) semantically justified, and what is its asymptotic cost envelope?

### 5.2. Demonstration Use Cases

The repository implementation is used as an executable specification for demonstrations, including:

- structure-preserving construction
- localized retained updates (text/attributes/styles)
- explicit event binding patterns
- element-local state composition via `setState`
- regenerated list templates with explicit id-based reconciliation (`matchById`)

### 5.3. Complexity Model

Let `k` be the number of fixed nodes in a widget (constant) and `n` be the number of children in a list region.

Key claims are stated in terms of time/space complexity and mutation-intent transparency:

- localized retained updates on stable node references are **O(1)** time and **O(1)** additional space (ignoring value allocations),
- structural list updates are generally **O(n)**, and explicit id-based matching can reduce DOM churn while preserving identity,
- intermediate representation construction and implicit reconciliation are avoidable categories of work for many localized updates.

The paper deliberately avoids treating runtime benchmark measurements of the JavaScript prototype as primary evidence, because such measurements predominantly capture userland overhead rather than the intended end state (native engine primitives).

---

## 6. Discussion

### 6.1. Expected Strengths

DOMPP is expected to excel in:

- **Traceability**: Direct DOM mapping simplifies debugging
- **Bundle size**: Minimal runtime footprint
- **Learning curve**: Familiar setter pattern for backend developers

### 6.2. Expected Limitations

DOMPP is not expected to outperform:

- **High-frequency updates**: Specialized frameworks may optimize better
- **Large-scale applications**: Component ecosystems provide structure DOMPP doesn't address

### 6.3. When Abstraction Helps vs. Hurts

Abstraction helps when:
- Component reuse is high
- Team coordination requires conventions
- Complex state management is needed

Abstraction hurts when:
- Simple mutations dominate
- Debugging requires tracing through layers
- Bundle size is critical

### 6.4. Implications for Engine-Level API Evolution

If evidence supports DOMPP's benefits, browser vendors could consider:

- Native implementation of chainable setters
- Optimization hooks for batched mutations
- Standardized reconciliation primitives

---

## 7. Threats to Validity

### 7.1. Internal Validity

- **API preference bias**: Developers accustomed to existing styles may rate DOMPP lower
- **Implementation bias**: DOMPP implementation quality may differ from framework optimizations

### 7.2. External Validity

- **Generalizability**: Results from small demos may not generalize to large applications
- **Browser variance**: Results may differ across browser engines

### 7.3. Construct Validity

- **Semantics debates**: Event replacement policy may not match all use cases

---

## 8. Conclusions

A minimal, chainable mutation API with `setState` composition is a plausible middle ground between raw DOM calls and heavyweight abstractions. The contribution is primarily consistency and readability, with compatibility for retained-DOM and fine-grained reactive execution models.

Key claims are intentionally constrained:

- **In scope**: Engine-level API improvement for mutation consistency
- **Out of scope**: Universal framework replacement

Future work includes engine-integrated validation (to evaluate constant factors without userland overhead), formalization of optional reconciliation semantics, and a standards-oriented explainer that maps mutation intent to engine optimization opportunities.

---

## Declarations

### Funding

This research received no external funding.

### Conflicts of Interest

The author declares no conflicts of interest.

### Data Availability Statement

Implementation code and demonstrations are available in the repository.

### Acknowledgments

The author thanks the open-source community for maintaining the reference implementations used in this work.

---

## References

1. MDN Web Docs. Document Object Model (DOM). Available online: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model (accessed on 21 February 2026).

2. WHATWG. DOM Standard. Available online: https://dom.spec.whatwg.org/ (accessed on 21 February 2026).

3. MDN Web Docs. EventTarget: addEventListener() method. Available online: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener (accessed on 21 February 2026).

4. MDN Web Docs. Node: textContent property. Available online: https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent (accessed on 21 February 2026).

5. MDN Web Docs. Element: replaceChildren() method. Available online: https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren (accessed on 21 February 2026).

6. MDN Web Docs. Element: setAttribute() method. Available online: https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute (accessed on 21 February 2026).

7. MDN Web Docs. Element: removeAttribute() method. Available online: https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute (accessed on 21 February 2026).

8. Bainomugisha, E.; Carreton, A.L.; Van Cutsem, T.; Mostinckx, S.; De Meuter, W. A Survey on Reactive Programming. *ACM Computing Surveys* **2013**, *45*(4), 1–34. https://doi.org/10.1145/2501654.2501666

9. Acar, U.A.; Blelloch, G.E.; Harper, R. Adaptive Functional Programming. *ACM Transactions on Programming Languages and Systems* **2006**, *28*(6), 990–1034. https://doi.org/10.1145/1119479.1119480

10. Acar, U.A.; Blelloch, G.E.; Harper, R. Adaptive Functional Programming. In *Proceedings of POPL*; **2002**; pp. 247–259. https://doi.org/10.1145/503272.503296

11. Hammer, M.A.; Dunfield, J.; Headley, K.; Labich, N.; Foster, J.S.; Hicks, M.W.; Van Horn, D. Incremental Computation with Names. In *Proceedings of OOPSLA*; **2015**; pp. 748–766. https://doi.org/10.1145/2814270.2814305

12. TC39. The TC39 Process. Available online: https://tc39.es/process-document/ (accessed on 21 February 2026).

13. Storey, M.-A.D. Theories, Tools and Research Methods in Program Comprehension: Past, Present and Future. *Software Quality Journal* **2006**, *14*(3), 187–208. https://doi.org/10.1007/s11219-006-9216-4

14. Sweller, J. Cognitive Load During Problem Solving: Effects on Learning. *Cognitive Science* **1988**, *12*(2), 257–285. https://doi.org/10.1016/0364-0213(88)90023-7
