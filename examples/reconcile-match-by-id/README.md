# Reconcile Match By Id

This demo shows `setChildren(..., { matchById: true })` on repeated renders.

## Behavior

- Recreate item templates every render
- Reorder items every tick
- Reuse existing DOM nodes by unique `id`

The identity line displays stable node instance tokens for each id.

## Run

```bash
node examples/serve.js
```

Open:

`http://localhost:3000/examples/reconcile-match-by-id/`
