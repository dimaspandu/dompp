# Cross-Framework Harness Design

Implementation status in this repository: contract design only (`benchmarks/apps/*` does not exist yet).

## Objective

Provide one benchmark contract so every framework implementation executes identical logical workloads.

## Contract

Each framework app exposes the same global interface in browser runtime:

```js
window.__bench = {
  mount(root, initialData) {},
  runOperation(name, payload) {},
  readMetrics() { return {}; },
  unmount() {}
};
```

## Required Operations

* `init_render`
* `counter_burst`
* `list_add`
* `list_edit`
* `list_delete`
* `filter_sort`
* `event_rebind`

## Runtime Measurement Model

For each operation:

1. mark start (`performance.now`)
2. execute operation
3. wait for visual commit (`requestAnimationFrame` or framework flush)
4. mark end
5. capture:
   * `duration_ms`
   * `heap_used_mb` (if `performance.memory` available)
   * `long_tasks_count` (optional via `PerformanceObserver`)

## Directory Recommendation

```text
benchmarks/
  apps/
    dompp/
    react/
    vue/
    solid/
    svelte/
```

Note: the structure above is a target architecture, not the current folder contents.

Each app should include:

* `index.html`
* framework entry file
* `bench-adapter.js` implementing `window.__bench`

## Rules for Fair Comparison

* Same DOM shape and CSS complexity.
* Same data sizes per scenario.
* Same operation counts and order.
* Avoid framework-specific optimization that changes semantics.

## Workload Defaults

* Counter burst: `10_000` increments in batches.
* Editable list size: start `1_000` rows.
* Filter/sort dataset: `5_000` rows.
* Event rebind cycles: `1_000` replacements per target group.

## Output Schema (runtime raw)

See `benchmarks/templates/runtime_raw_template.csv`.
