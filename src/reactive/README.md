# Reactive Module

The `src/reactive` directory contains the core primitives responsible for state propagation and update scheduling in DOMPP.

This module is intentionally small and focuses on two responsibilities only:

* Scheduling reactive work
* Broadcasting state changes

There is no hidden dependency tracking, proxy magic, or lifecycle system. Every update path is explicit and traceable.

---

## Scope of This Module

```
reactive/
 ├── scheduler.js   Microtask job scheduler
 └── signal.js      Reactive state primitive
```

These files form the lowest-level reactive foundation. Higher-level constructs such as computed values or effects can be built on top of them but are not required.

The goal is to keep the reactive core understandable in a single reading session.

---

## Design Principles

### Small surface area

Each primitive should solve exactly one problem.

* The scheduler controls *when* work runs.
* Signals control *what* work runs.

Avoid merging responsibilities unless it significantly improves predictability.

---

### Explicit execution

Subscriptions are created manually.
Updates are scheduled intentionally.
Disposal is deterministic.

Nothing happens implicitly.

This makes debugging significantly easier compared to systems with automatic dependency graphs.

---

### Batched by default

Signal updates are never executed immediately.

Instead, subscribers are scheduled into a microtask queue. This ensures that multiple synchronous writes collapse into a single flush cycle.

Benefits:

* Prevents update storms
* Reduces redundant work
* Maintains predictable ordering

---

## scheduler.js

The scheduler is a minimal microtask-based job queue.

### Responsibilities

* Deduplicate jobs using a `Set`
* Batch execution into a single microtask
* Prevent recursive flush behavior
* Stay extremely lightweight

### Execution Model

When `schedule(job)` is called:

1. The job is inserted into the queue.
2. If no flush is pending, a microtask is registered.
3. The queue is snapshotted during flush to prevent mutation issues.
4. Every job runs exactly once per cycle.

This model favors predictability over advanced features such as priority lanes or time slicing.

---

### `batch(fn)`

`batch` currently acts as a passthrough but exists to stabilize the public API.

It allows future expansion without breaking consumers.

Possible future capabilities include:

* Nested batching
* Forced synchronous flushes
* Priority scheduling

Until then, it serves as a semantic boundary indicating grouped mutations.

---

## signal.js

Signals represent reactive state.

A signal consists of:

* A stored value
* A set of subscribers
* A setter that schedules subscribers

### Read

```js
const value = get();
```

Reads are synchronous and side-effect free.

---

### Write

```js
set(nextValue);
```

Writes use `Object.is` to prevent unnecessary scheduling.

If the value has not changed, no subscribers are notified.

---

### Subscribe

```js
const dispose = get.subscribe(handler);
```

Behavior:

* The handler runs immediately once.
* Future updates are scheduled through the scheduler.
* A dispose function is returned for deterministic cleanup.

This avoids relying on garbage collection for correctness.

---

## Execution Flow

A typical update looks like this:

1. `set()` updates the internal value.
2. Subscribers are queued via `schedule`.
3. The scheduler flushes in a microtask.
4. Subscribers receive the latest value.

There is no tree diffing and no component rerender cycle.

Only the subscribed work executes.

---

## What This Module Intentionally Avoids

To preserve clarity and size, the reactive core does **not** include:

* Proxy-based tracking
* Automatic dependency graphs
* Component lifecycles
* Async orchestration
* Rendering logic

These features can be layered on top if needed, but they are not part of the foundation.

---

## Contributor Guidelines

When working inside this module, prioritize architectural discipline.

### Do not inflate the scheduler

Schedulers tend to accumulate complexity quickly. Favor simple, predictable behavior over feature richness.

---

### Protect batching guarantees

Changes to flush timing or ordering can introduce subtle bugs. Always evaluate how modifications affect execution determinism.

---

### Keep signals boring

Signals should remain straightforward containers with a broadcast mechanism.

Avoid turning them into mini frameworks.

---

### Prefer explicitness over convenience

Hidden behavior increases cognitive load for future contributors.

If something cannot be easily explained, it likely does not belong in the core.

---

## When to Use This Module

Use these primitives when you want:

* Fine-grained updates
* Direct mutation workflows
* Minimal abstraction
* Full control over scheduling

Avoid them if your project requires a fully featured reactive ecosystem.

---

## Summary

The reactive module provides the minimal machinery required to propagate state changes safely and predictably.

By separating scheduling from state, DOMPP keeps the runtime small while leaving room for future experimentation without destabilizing the foundation.
