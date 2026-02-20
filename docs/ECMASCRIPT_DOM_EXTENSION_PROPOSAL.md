# Toward a Minimal Standard for Chainable DOM Mutation Helpers

> Status on this repository (February 20, 2026): this document is a research proposal.
> DOMPP already implements the proposed helpers as userland prototype extensions in `src/dom/dompp.js`,
> plus optional addons (`stateful`, `reconcile`, `vquery`) that are explicitly out of standardization scope.

## Abstract

This draft proposes a small set of chainable DOM mutation helpers (`setText`, `setChildren`, `setStyles`, `setAttributes`, `setEvents`) to improve consistency between initial render and incremental updates in retained-DOM architectures. The proposal is motivated by two observations: (1) low-level DOM mutation remains central to browser UI systems [1][2], and (2) reactive or incremental systems benefit from explicit, deterministic update primitives [8][9][10][11]. The core claim is not that this API replaces existing Web APIs, but that a narrow, semantics-preserving layer can reduce authoring complexity without introducing virtual DOM or wrapper objects.

## 1. Problem Statement

In imperative UI code, initial construction and later updates often use different idioms:

* property assignment (`el.id = ...`)
* attribute APIs (`setAttribute`, `removeAttribute`)
* direct text mutation (`textContent`)
* event subscription (`addEventListener`, manual replacement)

This heterogeneity increases cognitive load and creates avoidable inconsistency in mutation code paths. The hypothesis is that a stable setter-shaped interface can reduce these inconsistencies while preserving platform semantics [1][2][3][4][5][6][7].

## 2. Scope and Non-Goals

### 2.1 Scope

The proposal targets a minimal mutation surface:

* `Element.prototype.setText(text): this`
* `Element.prototype.setChildren(...children): this`
* `Element.prototype.setStyles(styles): this`
* `Element.prototype.setAttributes(attrs): this`
* `Element.prototype.setEvents(events): this`

`DocumentFragment` support is intentionally limited to:

* `setText`
* `setChildren`

Current DOMPP implementation alignment:

* `installDompp()` defines `setText`, `setChildren`, `setStyles`, `setAttributes`, `setEvents` on `Element.prototype`.
* `DocumentFragment.prototype` only receives `setText` and `setChildren`.
* Methods are installed only when absent (idempotent/non-destructive).

### 2.2 Non-Goals

This proposal does not introduce:

* virtual DOM
* template compilation
* dependency tracking
* component lifecycle model

## 3. Proposed Semantics

### 3.1 `setText(text)`

Equivalent to setting `textContent`; returns `this` for chaining [4].

### 3.2 `setChildren(...children)`

Equivalent to subtree replacement via `replaceChildren`. String arguments are converted to `Text` nodes [5].

### 3.3 `setStyles(styles)`

Applies key-value style mutations onto `element.style`; returns `this`.

### 3.4 `setAttributes(attrs)`

Boolean/null handling:

* `true`: set empty attribute
* `false`/`null`/`undefined`: remove attribute
* other: set attribute value (string-coercible) [6][7]

### 3.5 `setEvents(events)`

Attaches handlers with replacement semantics per event key to avoid duplicate listener accumulation [3].

In the current codebase this is implemented via per-element handler storage (`__dompp_handlers`) and remove-then-add replacement.

## 4. Rationale

### 4.1 Consistency Across Initial and Incremental Mutation

A setter-first interface provides one mutation vocabulary for both initial render and updates. For example, attributes are always updated through `setAttributes(...)`, not split across assignment styles.

### 4.2 Declarative-Style Tree Construction Without Abstraction Wrappers

Fluent chaining enables readable tree construction while remaining in native DOM objects.

```js
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

### 4.3 Alignment with Incremental/Reactive Execution Models

Prior work in reactive programming and incremental computation emphasizes explicit update propagation and minimized recomputation [8][9][10][11]. The proposed helpers are compatible with that direction because they expose deterministic mutation boundaries rather than hidden rendering passes.

## 5. Standardization Considerations

Important terminology note: DOM APIs are standardized through Web platform standards processes (e.g., WHATWG DOM), not by ECMAScript language standardization alone [2][12].

Therefore, this document should be interpreted as:

* an ECMAScript-usable API design proposal
* with eventual standardization pathway through Web API venues

Practical expectation for this repo:

* short term: remain a userland experiment ("DOM++")
* medium term: gather empirical evidence via paper/benchmark artifacts
* long term: if evidence is strong, discuss candidate shape in web standards channels and MDN-style API docs

## 6. Evaluation Plan (for ePrint/Paper Version)

To move from proposal to evidence, the paper version should include:

1. Authoring study: compare implementation time and defect rate between baseline DOM API and chainable helpers.
2. Readability study: measure comprehension accuracy/time on mutation-heavy snippets.
3. Runtime study: microbenchmarks verifying no material overhead versus direct API use.
4. Case studies: counters, list updates, and event-rebinding-heavy components.

## 7. Threats to Validity

* API preference bias (developers accustomed to existing styles).
* External validity (results from small demos may not generalize to large apps).
* Benchmark confounds (JIT warmup, browser version variance, GC noise).
* Semantics debates (especially event replacement policy).

## 8. Conclusion

A minimal, chainable mutation API is a plausible middle ground between raw DOM calls and heavyweight abstractions. The contribution is primarily consistency and readability, with compatibility for retained-DOM and fine-grained reactive execution models.

## References

[1] MDN Web Docs. "Document Object Model (DOM)."  
https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model

[2] WHATWG. "DOM Standard."  
https://dom.spec.whatwg.org/

[3] MDN Web Docs. "EventTarget: addEventListener() method."  
https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener

[4] MDN Web Docs. "Node: textContent property."  
https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent

[5] MDN Web Docs. "Element: replaceChildren() method."  
https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren

[6] MDN Web Docs. "Element: setAttribute() method."  
https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute

[7] MDN Web Docs. "Element: removeAttribute() method."  
https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute

[8] E. Bainomugisha, A. L. Carreton, T. van Cutsem, S. Mostinckx, and W. De Meuter.  
"A Survey on Reactive Programming." ACM Computing Surveys, 2013.  
https://doi.org/10.1145/2501654.2501666

[9] U. A. Acar, G. E. Blelloch, and R. Harper.  
"Adaptive Functional Programming." ACM TOPLAS, 2006.  
https://doi.org/10.1145/1119479.1119480

[10] U. A. Acar, G. E. Blelloch, and R. Harper.  
"Adaptive Functional Programming." POPL, 2002.  
https://doi.org/10.1145/503272.503296

[11] M. A. Hammer, J. Dunfield, K. Headley, N. Labich, J. S. Foster, M. W. Hicks, and D. Van Horn.  
"Incremental Computation with Names." OOPSLA, 2015.  
https://doi.org/10.1145/2814270.2814305

[12] TC39. "The TC39 Process."  
https://tc39.es/process-document/
