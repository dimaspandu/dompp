# Changelog

All notable changes to this project will be documented in this file.

This project follows semantic versioning principles.

---

## [0.1.11] - 2026-02-28

### Changed
- Updated DOMPP CDN app demo Todo List to use reconcile + `matchById` (keyed identity) on add:
  - `benchmarks/apps-cdn/dompp/app.html`
- Revised and refocused preprint outline:
  - simplified structure and evaluation framing
  - expanded Related Work with clearer citations to local reference PDFs
  - `docs/preprints/OUTLINE.md`

### Notes
- This release updates paper-facing documentation and aligns the DOMPP CDN demo with keyed reconciliation semantics.

---

## [0.1.10] - 2026-02-23

### Added
- Automated CDN benchmark runner and summarizer scripts:
  - `benchmarks/scripts/run-cdn-benchmark.mjs`
  - `benchmarks/scripts/summarize-runtime.mjs`
- Runtime benchmark outputs:
  - `benchmarks/results/runtime_raw.csv`
  - `benchmarks/results/runtime_summary.json`

### Changed
- Updated DOMPP stateful counter demo formatting consistency:
  - `benchmarks/apps-cdn/dompp/counter-stateful.html`
- Added runtime benchmark results table and analysis to paper outline:
  - `docs/preprints/OUTLINE.md`

### Notes
- Benchmark results reflect CDN-only track runs on local environment; DOMPP remains a runtime library in this setup.

---

## [0.1.9] - 2026-02-21

### Added
- Runnable CDN-only benchmark harness apps:
  - `benchmarks/apps-cdn/` with `dompp`, `react`, `vue`, and `solid` workloads.
- DOMPP reconcile benchmark variants for counter:
  - `counter-reconcile` (with `matchById`)
  - `counter-reconcile-no-match-by-id` (stable references without `matchById`)
- Build-required benchmark track guidance:
  - `benchmarks/apps-build-required/README.md` for `svelte` and `angular`.

### Changed
- Benchmark documentation and protocol now define two fairness tracks:
  - `cdn_only`
  - `build_required`
- Experimental paper outline updated to reflect keyed ordered-list workload and track-based reporting:
  - `benchmarks/PAPER_OUTLINE_EXPERIMENT.md`
- Proposal document strengthened with:
  - additional scientific references for comprehension/cognitive-load arguments
  - non-normative optimization expectations for setter semantics (`setChildren`, `setStyles`, `setAttributes`, `setEvents`)
  - performance-oriented expectation that implementations minimize unnecessary DOM mutations.

### Notes
- This release expands benchmark reproducibility artifacts and clarifies the proposal direction toward semantics-preserving, engine-level DOM mutation optimization.

---

## [0.1.8] - 2026-02-21

### Added
- New ordered-list reconcile demo with id-based matching:
  - `examples/reconcile-match-by-id-ordered-list/`
  - Stateful callback rendering with `setChildren(..., { matchById: true })`
  - Prepend-focused refresh flow and conditional `"(UPDATED!)"` marker behavior.

### Changed
- Reconcile stateful counter refactored to stable node references (no per-element `id` requirement):
  - `examples/reconcile-stateful-counter/counter.js`
- Reconcile stateful counter docs expanded with coding-style comparison and reconcile mechanics:
  - `examples/reconcile-stateful-counter/README.md`
- Reconcile match-by-id counter aligned to stateful callback style:
  - `examples/reconcile-match-by-id/counter.js`
  - `examples/reconcile-match-by-id/README.md`
- Root ideation script rewritten with runnable ordered-list flow and explanatory comments:
  - `ideation.js`
- Root README example index/structure/snippets updated for new ordered-list example:
  - `README.md`

### Removed
- Deprecated list-pattern demo:
  - `examples/reconcile-list-patterns/`

### Notes
- This release focuses on clarify-and-demonstrate reconcile behavior under two rendering styles:
  1. Fresh templates with `matchById`
  2. Stable node references without `matchById`

---

## [0.1.7] - 2026-02-20

### Changed
- Documentation language normalized to English (no emoji/emoticon style) across updated root/docs/benchmark markdown files.
- Root README updated with:
  - explicit project identity note: `DOMPP = DOM++`
  - MDN-style native Web API proposal snippet aligned with the paper direction.
- Proposal document refined with repository-aligned implementation status and standardization pathway notes:
  - `docs/ECMASCRIPT_DOM_EXTENSION_PROPOSAL.md`
- Benchmark docs clarified to reflect current repository state:
  - protocol/templates/scripts are available now
  - cross-framework runnable harness apps are still planned.

### Notes
- This release is documentation-focused and introduces no runtime API changes.

---

## [0.1.6] - 2026-02-20

### Added
- New stateful + reconcile example:
  - `examples/reconcile-stateful-counter/`

### Changed
- Stateful callback context now exposes `setState` directly (while keeping `el`):
  - `src/reactive/stateful.js`
- Root ideation demo updated to local-state usage with callback context:
  - `ideation.js`
- Root README rewritten for current project scope and examples:
  - updated structure and addon overview
  - added concise code snippets for all examples under `examples/`.

### Notes
- This release improves API ergonomics for local state updates in callback render patterns.

---

## [0.1.5] - 2026-02-20

### Added
- New reconcile addon:
  - `src/addons/reconcile.addon.js`
  - opt-in patch APIs (`patchText`, `patchChildren`, `patchStyles`, `patchAttributes`, `patchEvents`)
  - optional setter override mode via `installDomppReconcile({ overrideSetters: true })`.
- `setChildren(..., { matchById: true })` support in reconcile mode for id-based child reuse.
- New examples:
  - `examples/reconcile-counter/`
  - `examples/reconcile-list-patterns/`
  - `examples/reconcile-match-by-id/`
- Root-level ideation demo script:
  - `ideation.js`

### Changed
- Root README now includes reconcile examples in the documentation index and examples list.
- Addons README now documents reconcile addon usage and `matchById` behavior.

### Notes
- Core DOMPP implementation in `src/dom/dompp.js` remains unchanged.
- Reconcile behavior is isolated in addons as an opt-in simulation/proposal layer.

---

## [0.1.4] - 2026-02-19

### Added
- Experimental benchmark suite scaffold under `benchmarks/`:
  - paper outline for evidence-driven evaluation
  - cross-framework harness design
  - reproducibility protocol
  - CSV templates for runtime/authoring/readability studies
  - table/plot templates for paper reporting
  - Node scripts for runtime CSV validation and aggregation.
- Benchmark artifacts workspace:
  - `benchmarks/results/.gitkeep`

### Changed
- Root README documentation index now includes benchmark suite docs.

### Notes
- This release focuses on research methodology and measurement tooling.
- No runtime API changes.

---

## [0.1.3] - 2026-02-19

### Added
- Documentation index in root README linking to module/example docs.
- New proposal document:
  - `docs/ECMASCRIPT_DOM_EXTENSION_PROPOSAL.md`
  - scientific-style structure with references to DOM standards and related research.

### Changed
- Root README expanded with:
  - "Proposed Advantages" section
  - consistent setter model explanation for initial and update phases
  - declarative tree authoring example.
- `src/addons/README.md` rewritten into full module documentation:
  - philosophy
  - API (`$`, `v`)
  - usage guidance
  - non-goals.
- `src/dom/README.md` clarified `DocumentFragment` support and limitations.

### Notes
- This release is documentation-focused and introduces no runtime API breakage.

---

## [0.1.2] - 2026-02-17

### Added
- DocumentFragment support for core mutation helpers:
  - setText
  - setChildren

### Changed
- Refactored DOM installer to support prototype-targeted definitions.
- Shared method implementations between Element and DocumentFragment to prevent behavioral drift.

### Design Notes
- Fragment intentionally supports only mutation primitives.
- Styling, attributes, and events remain Element-only to preserve platform semantics.

---

## [0.1.1] - 2026-02-17

First stabilization patch after the foundation release.

Focused on improving the stateful DOM addon, update scheduling behavior, and internal safety without introducing breaking API changes.

### Added

- Setter-level memoization to prevent unnecessary DOM mutations when computed values have not changed.
- Microtask-based batched flushing for stateful bindings, aligning DOM updates with modern reactive scheduling patterns.

### Improved

- Safer setter wrapping to avoid prototype reassignment errors.
- More predictable binding execution through snapshot-safe flushing.
- Internal guards to prevent double wrapping of DOM setters.
- Documentation clarity for the DOM module and stateful architecture.

### Fixed

- Resolved read-only prototype mutation error when enhancing setters.
- Eliminated redundant DOM writes caused by unchanged state values.

### Stability Notes

This release strengthens the internal mutation pipeline and prepares the engine for more advanced reactive features while keeping the runtime extremely small and deterministic.

No breaking changes were introduced.

---

## [0.1.0] - 2026-02-16

Initial public foundation of DOMPP.

### Added

- Core DOM prototype extensions
  - setText
  - setChildren
  - setStyles
  - setAttributes
  - setEvents

- Stateful DOM addon
  - setState
  - callback-based setters
  - element-local bindings
  - microtask-ready architecture

- Reactive primitives
  - scheduler
  - signal

- VQuery addon for optional ergonomic querying

- Example projects:
  - minimal counter
  - vquery counter
  - stateful counter

- Contributor-oriented documentation
  - root README
  - DOM module README
  - reactive module README

### Design Principles

- Zero virtual DOM
- No proxies
- Retained DOM architecture
- Fine-grained mutation model
- Extremely small runtime
- Explicit over magical behavior
