# Paper Outline (Evidence-Driven Version)

## 1. Title

Proposed DOM++ (DOMPP): We Might Just Need an API Like This  
Subtitle: An Empirical Study of Chainable DOM Mutation Against Modern UI Abstractions

## 2. Abstract

* Problem: inconsistent mutation patterns and abstraction overhead.
* Approach: minimal chainable mutation API (DOMPP).
* Method: authoring study, readability study, runtime benchmarks, case studies.
* Result summary: fill with measured outcomes only.
* Claim boundary: where DOMPP helps and where frameworks remain superior.

## 3. Introduction

* Motivation and practical gap.
* Research questions:
  * `RQ1`: Does DOMPP reduce runtime overhead in simple-to-medium interactive UIs?
  * `RQ2`: Does a consistent setter model improve authoring efficiency?
  * `RQ3`: Does DOMPP improve code comprehension/readability?
* Contributions list.

## 4. Background and Related Work

* DOM and Web platform mutation model.
* Reactive/incremental computation literature.
* Prior UI framework benchmark limitations and caveats.

## 5. API and System Description

* DOMPP method semantics.
* Determinism and non-goals.
* Compatibility notes.

## 6. Methodology

### 6.1 Experimental Subjects

* Frameworks: `dompp`, `react`, `vue`, `solid`, `svelte`.
* Same workload specs across frameworks.

### 6.2 Workloads

* `counter_burst`: rapid update loop.
* `editable_list`: add/edit/delete with retained references.
* `filter_sort`: list filtering and sorting updates.
* `event_rebind`: frequent handler replacement stress.

### 6.3 Metrics

* Runtime: initial render, update latency (`p50`, `p95`), memory delta, long-task count.
* Build: bundle size (raw and gzip).
* Authoring: implementation time, defect rate.
* Readability: comprehension accuracy and completion time.

### 6.4 Fairness Controls

* Production build for all frameworks.
* Same browser/hardware.
* Warm-up rounds.
* Repeated runs and confidence intervals.

## 7. Results

* Runtime aggregate tables (per scenario, per framework).
* Plots (latency, memory, bundle size).
* Authoring and readability tables.

## 8. Discussion

* Interpret where DOMPP wins/loses.
* Cost-benefit tradeoff: performance vs ecosystem/productivity.
* External validity limits.

## 9. Threats to Validity

* Selection bias, implementation bias, benchmark confounds, environment sensitivity.

## 10. Conclusion

* Constrained claims based on measured evidence.

## 11. Artifacts and Reproducibility

* Repository structure.
* Raw CSV + scripts + protocol (currently implemented).
* Versioned environment details.
* Note current scope: this repository already includes data templates and runtime aggregation scripts, while cross-framework harness apps are planned work.
