# DOMPP Preprint Outline (Preprints.org-Oriented)

Last updated: 2026-02-21  
Target venue: Preprints.org (Computer Science and Mathematics / Engineering)

## 0. Title Page (Required First Page Content)

- Title
- Full author list
- Affiliations for all authors
- Corresponding author contact
- Abstract
- Keywords

Suggested title:

`Toward a Minimal Standard for Chainable DOM Mutation Helpers: DOMPP and Evidence-Driven Evaluation`

## 1. Abstract

Write a concise abstract covering:

- Problem: fragmented UI abstractions and mutation inconsistency
- Proposal: minimal chainable DOM mutation helpers
- Method: demonstrations + time/space complexity analysis (prototype as executable spec)
- Scope boundaries: not a framework replacement claim

## 2. Keywords

Suggested keywords:

- DOM
- retained mode UI
- incremental updates
- reactive programming
- API design
- complexity analysis

## 3. Introduction

- Practical motivation (framework fragmentation, abstraction traceability cost)
- Why this matters for fullstack teams
- Contributions list (bullet form)

## 4. Background and Related Work

- DOM and Web platform mutation model
- Reactive and incremental computation foundations
- Program comprehension and cognitive-load constraints
- Existing performance-comparison caveats and fairness pitfalls

## 5. Proposal: Chainable DOM Mutation API

- `setText`
- `setChildren`
- `setStyles`
- `setAttributes`
- `setEvents`
- `setState` (composite state update)

Include:

- semantic baseline (observable behavior)
- non-normative optimization expectation (minimal necessary DOM mutation)
- non-goals (no VDOM/compiler/lifecycle/dependency graph)
- `setState` composition semantics (batching text, children, styles, attributes, events in single call)

## 6. Research Questions

- RQ1: What mutation patterns does DOMPP make explicit and uniform?
- RQ2: Under a DOM-level cost model, what are the time/space complexity characteristics of these patterns?
- RQ3: Which optimizations are plausibly engine-integratable given unchanged DOM semantics?

## 7. Methodology (Demonstrations + Complexity)

- Demonstrate use cases with small, runnable code examples (construction, localized updates, events, local state, optional reconciliation).
- Analyze time and space complexity for each use case under a DOM-level cost model.
- Explicitly separate prototype overhead from the engine-level hypothesis.

## 8. Results Plan

- demonstration code listings for each use case
- time/space complexity summary tables per use case
- explicit limitations and assumptions of the cost model

## 9. Discussion

- where DOMPP is strong/weak
- when abstraction helps vs hurts traceability
- implications for engine-first API evolution

## 10. Threats to Validity

- implementation bias
- environment sensitivity
- participant skill skew

## 11. Conclusion

- constrained claims only
- clear separation:
  - in scope: engine-level API improvement
  - out of scope: universal framework replacement

## 12. Declarations and Compliance Blocks

Prepare these sections for submission:

- Funding
- Conflicts of Interest
- Data Availability Statement
- Ethics statement (if human/animal participants are involved)
- Acknowledgments

## 13. Submission Checklist (Preprints.org-Oriented)

- Manuscript in English
- First page contains title/authors/affiliations/corresponding author/abstract/keywords
- Comprehensive bibliography included
- Research paper structure includes IMRaD-style core sections
- All figures/tables/captions complete
- Data and supplementary files prepared (or repository links)
- Journal policy compatibility checked before cross-submission
