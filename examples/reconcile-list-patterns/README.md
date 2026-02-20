# Reconcile List Patterns

This demo extends the reconcile addon example with repeated list rendering patterns.

## Scenarios

- Auto append on each frame
- Auto prepend on each frame
- Id-based retained nodes without a separate `key` field

## Core Idea

Each render still calls `setChildren(...)`, but nodes are retained and reordered using native references.
This keeps updates explicit while avoiding full subtree replacement behavior.

## Run

```bash
node examples/serve.js
```

Open:

`http://localhost:3000/examples/reconcile-list-patterns/`
