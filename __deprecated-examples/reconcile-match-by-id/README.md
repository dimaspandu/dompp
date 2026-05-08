# Reconcile Match By Id

This demo shows `setChildren(..., { matchById: true })` with stateful callback rendering.

## Behavior

- Recreate title and button templates on each render callback
- Preserve node identity by matching template ids to existing DOM nodes
- Keep event behavior stable while text/style values update from local state

## Run

```bash
node examples/serve.js
```

Open:

`http://localhost:3000/examples/reconcile-match-by-id/`
