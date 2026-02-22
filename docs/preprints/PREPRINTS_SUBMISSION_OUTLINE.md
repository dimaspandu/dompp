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
- Method: benchmarks + authoring/readability/traceability design
- Scope boundaries: not a framework replacement claim

## 2. Keywords

Suggested keywords:

- DOM
- retained mode UI
- incremental updates
- reactive programming
- API design
- benchmark methodology

## 3. Introduction

- Practical motivation (framework fragmentation, abstraction traceability cost)
- Why this matters for fullstack teams
- Why AI-assisted coding shifts focus to runtime clarity and engine-level ergonomics
- Contributions list (bullet form)

## 4. Background and Related Work

- DOM and Web platform mutation model
- Reactive and incremental computation foundations
- Program comprehension and cognitive-load constraints
- Existing benchmark caveats and fairness pitfalls

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

- RQ1: Runtime overhead and update latency
- RQ2: Authoring efficiency and defect rate
- RQ3: Readability/comprehension outcomes
- RQ4: Debug traceability outcomes
- RQ5: Fullstack onboarding outcomes
- RQ6: AI-assisted maintenance outcomes
- RQ7: State composition ergonomics (`setState` vs chained setters)

## 7. Methodology

### 7.1 Tracks

- `cdn_only`: dompp, react, vue, solid
- `build_required`: svelte, angular

### 7.2 Workloads

- `counter_burst`
- `ordered_list_keyed`
- `filter_sort`
- `event_rebind`

### 7.3 Metrics

- Runtime: initial render, update latency (p50/p95), memory delta, long tasks
- Authoring: completion time, defects
- Readability: accuracy, time
- Traceability: time-to-root-cause, stack-depth-to-cause
- AI-maintainability: fix-time and defect-introduction rate
- State composition: `setState` batching efficiency, layout thrashing reduction

### 7.4 Fairness Controls

- production-equivalent mode per framework
- warm-up + repeated runs
- standardized environment recording
- no mixed ranking between `cdn_only` and `build_required`

## 8. Results Plan

- runtime summary tables
- confidence intervals
- per-track comparison
- explicit failure/anomaly notes

## 9. Discussion

- where DOMPP is strong/weak
- when abstraction helps vs hurts traceability
- implications for engine-first API evolution

## 10. Threats to Validity

- implementation bias
- environment sensitivity
- participant skill skew
- AI model/prompt variance

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
- AI Use Disclosure (methods or equivalent section)
- Ethics statement (if human/animal participants are involved)
- Acknowledgments

## 13. Submission Checklist (Preprints.org-Oriented)

- Manuscript in English
- First page contains title/authors/affiliations/corresponding author/abstract/keywords
- Comprehensive bibliography included
- Research paper structure includes IMRaD-style core sections
- All figures/tables/captions complete
- Data and supplementary files prepared (or repository links)
- AI usage disclosed (if used)
- Journal policy compatibility checked before cross-submission

