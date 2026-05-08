# Reconcile Counter

A demo for the `reconcile` addon that enables diff/patch behavior for repeated `set*` calls.

## What It Shows

- `setChildren(...)` called on every render without full subtree replacement
- `setStyles(...)` updates changed style keys and unsets removed keys
- `setAttributes(...)` toggles boolean attributes without manual cleanup
- `setEvents(...)` keeps handlers stable when re-applied

## Why This Example Exists

This example is intended as a practical simulation for a DOM API proposal direction:

- keep direct DOM mutation
- avoid virtual DOM
- make repeated mutation APIs reconciliation-aware

## Run

```bash
node examples/serve.js
```

Then open:

`http://localhost:3000/examples/reconcile-counter/`
