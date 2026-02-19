# Changelog

All notable changes to this project will be documented in this file.

This project follows semantic versioning principles.

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

