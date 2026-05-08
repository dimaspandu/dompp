# Hydration Assimilation Counter

This example shows how an existing DOM tree (for example, SSR/static HTML output) can be assimilated without recreating the subtree.

## What It Demonstrates

- `setChildren(({ children }) => ...)` on already-existing nodes
- Reuse existing elements (`h2`, buttons)
- Attach events after hydration
- Update only the text that changes

## Run

```bash
node examples/serve.js
```

Then open:

`http://localhost:3000/examples/hydration-assimilation-counter/`
