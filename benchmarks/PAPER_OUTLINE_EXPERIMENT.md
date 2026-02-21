# Paper Outline (Evidence-Driven Version)

## 1. Title

Proposed DOM++ (DOMPP): We Might Just Need an API Like This  
Subtitle: An Empirical Study of Chainable DOM Mutation Against Modern UI Abstractions

## 2. Abstract

* Problem: inconsistent mutation patterns and abstraction overhead.
* Ecosystem context: many frameworks with overlapping goals can increase decision churn and onboarding cost.
* Practitioner context: fullstack teams often need a lower-abstraction, easier-to-trace frontend model.
* AI context: with AI-assisted coding, the bottleneck shifts toward runtime clarity and maintainability.
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
  * `RQ4`: Does DOMPP improve debugging traceability versus higher-abstraction implementations?
  * `RQ5`: For backend-primary developers, does DOMPP reduce onboarding friction for frontend tasks?
  * `RQ6`: Under AI-assisted authoring, does a DOM-first model improve verification/maintenance outcomes?
* Contributions list.

## 4. Background and Related Work

* DOM and Web platform mutation model.
* Reactive/incremental computation literature.
* Prior UI framework benchmark limitations and caveats.
* Ecosystem fragmentation and framework-selection churn (industry/practitioner perspective).
* Human factors in abstraction-heavy UI systems (debugging and cognitive overhead) [R6][R7].
* AI-assisted software authoring implications for API design.

## 5. API and System Description

* DOMPP method semantics.
* Determinism and non-goals.
* Compatibility notes.

## 6. Methodology

### 6.1 Experimental Subjects

* Track A (`cdn_only`): `dompp`, `react`, `vue`, `solid`.
* Track B (`build_required`): `svelte`, `angular` (and optionally others).
* Same workload specs across frameworks; report results by track.

### 6.2 Workloads

* `counter_burst`: rapid update loop.
* `ordered_list_keyed`: prepend-heavy keyed list updates.
* `filter_sort`: list filtering and sorting updates.
* `event_rebind`: frequent handler replacement stress.

### 6.3 Metrics

* Runtime: initial render, update latency (`p50`, `p95`), memory delta, long-task count.
* Build: bundle size (raw and gzip).
* Authoring: implementation time, defect rate.
* Readability: comprehension accuracy and completion time.
* Traceability: time-to-root-cause, stack-depth-to-cause, mutation-path identification accuracy.
* Fullstack onboarding: completion success and time for backend-primary participants.
* AI-maintainability: fix-time and defect-introduction rate when editing AI-generated code.

### 6.4 Fairness Controls

* Production build for all frameworks.
* Same browser/hardware.
* Warm-up rounds.
* Repeated runs and confidence intervals.
* Standardized AI prompting protocol for AI-assisted conditions.
* Blind scoring rubric for readability/traceability tasks.

## 7. Results

* Runtime aggregate tables (per scenario, per framework).
* Plots (latency, memory, bundle size).
* Authoring and readability tables.

## 8. Discussion

* Interpret where DOMPP wins/loses.
* Cost-benefit tradeoff: performance vs ecosystem/productivity.
* When framework abstraction helps (large app architecture) versus when it harms (small/medium traceability-critical flows).
* Implications for "engine-first" improvement strategy in an AI-assisted development era.
* External validity limits.

## 9. Threats to Validity

* Selection bias, implementation bias, benchmark confounds, environment sensitivity.
* AI model drift and prompt variance across experiment windows.
* Participant skill distribution (frontend-heavy vs backend-heavy backgrounds).

## 10. Conclusion

* Constrained claims based on measured evidence.
* Explicitly separate:
  * "framework replacement" claims (out of scope)
  * "engine-level API improvement" claims (in scope)

## 11. Artifacts and Reproducibility

* Repository structure.
* Raw CSV + scripts + protocol (currently implemented).
* Versioned environment details.
* Note current scope: this repository already includes data templates and runtime aggregation scripts, while cross-framework harness apps are planned work.

## 12. Supporting Scientific References

* [R1] E. Bainomugisha, A. L. Carreton, T. van Cutsem, S. Mostinckx, and W. De Meuter.  
  "A Survey on Reactive Programming." ACM Computing Surveys, 2013.  
  https://doi.org/10.1145/2501654.2501666
* [R2] U. A. Acar, G. E. Blelloch, and R. Harper.  
  "Adaptive Functional Programming." ACM TOPLAS, 2006.  
  https://doi.org/10.1145/1119479.1119480
* [R3] M. A. Hammer, J. Dunfield, K. Headley, N. Labich, J. S. Foster, M. W. Hicks, and D. Van Horn.  
  "Incremental Computation with Names." OOPSLA, 2015.  
  https://doi.org/10.1145/2814270.2814305
* [R4] WHATWG. "DOM Standard."  
  https://dom.spec.whatwg.org/
* [R5] MDN Web Docs. "Document Object Model (DOM)."  
  https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
* [R6] M.-A. D. Storey.  
  "Theories, tools and research methods in program comprehension: past, present and future."  
  Software Quality Journal, 14(3):187-208, 2006.  
  https://doi.org/10.1007/s11219-006-9216-4
* [R7] J. Sweller.  
  "Cognitive load during problem solving: Effects on learning."  
  Cognitive Science, 12(2):257-285, 1988.  
  https://doi.org/10.1016/0364-0213(88)90023-7
