# Reconcile Stateful Counter

This example applies local state to the parent element and rebuilds children through callback-based `setChildren`.

## What It Demonstrates

- Local state with `setState`
- Callback-based rendering with `setChildren(({ state, setState }) => ...)`
- Id-based node reuse with `setChildren(..., { matchById: true })`
- Reconcile patch behavior without virtual DOM

## Run

```bash
node examples/serve.js
```

Open:

`http://localhost:3000/examples/reconcile-stateful-counter/`
