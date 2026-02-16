# DOMPP

DOMPP is a lightweight experimental UI engine built directly on top of the browser DOM without relying on a virtual DOM or heavyweight frameworks.

The project focuses on understanding and implementing the fundamental primitives required to build modern user interfaces while maintaining full control over performance, memory usage, and update behavior.

DOMPP is intentionally minimal and designed as a foundation for exploring fine-grained reactivity and low-level rendering strategies.

---

## Goals

The primary goals of this project are:

* Explore reactive architecture from first principles
* Reduce abstraction while improving developer control
* Encourage predictable rendering behavior
* Minimize unnecessary DOM work
* Promote memory-aware patterns
* Serve as a learning platform for engine-level design

This repository is not intended to compete with production frameworks. Instead, it exists to understand how such systems can be built.

---

## Project Structure

```
src/
 ├── dom/        DOM utilities and rendering helpers
 └── reactive/   Reactive primitives (signals, effects, scheduler)

examples/
 ├── minimal-counter
 ├── reactive-counter
 └── vquery-counter
```

### Examples

The examples directory demonstrates progressively more advanced usage:

* **minimal-counter**
  Direct DOM manipulation without reactive state.

* **reactive-counter**
  Demonstrates fine-grained updates powered by signals.

* **vquery-counter**
  Experiments with a query-style DOM helper API.

---

## Design Principles

DOMPP follows a small set of guiding principles:

### Explicit over magical

Behavior should be easy to trace and debug.

### Minimal surface area

Every primitive should justify its existence.

### Fine-grained updates

Update only what actually changes.

### Framework independence

The engine should not rely on compilers, proxies, or build steps.

### Performance awareness

Avoid unnecessary allocations, subscriptions, and rerenders.

---

## Status

DOMPP is experimental and under active exploration.

Breaking changes are expected as the architecture evolves.

The codebase favors clarity over completeness and is optimized for learning rather than production readiness.

---

## Contributing

Contributions are welcome, especially from developers interested in:

* Reactive systems
* Rendering strategies
* Scheduling models
* Memory management
* Engine architecture

Before submitting large changes, consider opening a discussion to align on direction.

When contributing:

* Prefer small, focused pull requests
* Keep primitives minimal
* Avoid adding abstraction without clear benefit
* Document non-obvious decisions
* Maintain readability

---

## Suggested Areas for Contribution

* Reactive dependency tracking improvements
* Smarter scheduling strategies
* Automatic resource cleanup
* Developer ergonomics
* Benchmarking
* Documentation

---

## Vision

Modern UI frameworks are powerful but often hide meaningful complexity behind layers of abstraction.

DOMPP asks a simple question:

**What is the minimum engine required to support modern UI patterns?**

By rebuilding these primitives from scratch, we gain a deeper understanding of how reactive interfaces truly work.
