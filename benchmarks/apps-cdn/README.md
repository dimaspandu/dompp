# CDN-Only Experiment Apps

This folder provides runnable benchmark workloads without `npm install` or `node_modules`.

## Scope

CDN-only track (implemented here):

- `dompp`
- `react`
- `vue`
- `solid`

Build-required track (documented, not implemented in this folder):

- `svelte`
- `angular`

Reason: Svelte and modern Angular are compilation-first toolchains. Running them fully in-browser with runtime compilers is possible but introduces non-representative overhead and fairness issues for performance experiments.

## Workloads

- `counter.html` (DOMPP stateful baseline)
- `counter-reconcile.html` (DOMPP stateful + reconcile with `matchById`)
- `counter-reconcile-no-match-by-id.html` (DOMPP stateful + reconcile without `matchById`, stable node references/no recreate loop)
- `ordered-list-keyed.html`

Both workloads follow the same behavioral spec:

- Counter: increment/decrement/reset state updates.
- Ordered list keyed:
  - prepend a new item on refresh
  - maintain stable keyed identity
  - apply `"(UPDATED!)"` to topmost even position (item #2) only when total items > 5

For cross-framework fairness, use `counter.html` as the default Counter comparison target and report reconcile variants as additional DOMPP analysis:

- with `matchById`
- without `matchById`

## Run

Use the project static server:

```bash
node examples/serve.js
```

Then open:

- `http://localhost:3000/benchmarks/apps-cdn/`
