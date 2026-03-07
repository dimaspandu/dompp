# Hydration + Stateful Counter

This example demonstrates a combination of:

- Hydration/assimilation from SSR markup
- Reactive updates via the `stateful` addon
- Reconcile patching with `matchById`

## Why It Matters

`setChildren(({ state, setState }) => ...)` can rebuild template nodes each update while preserving real DOM identity:

- `children` destructuring reuses existing SSR nodes directly
- `matchById` reuses existing DOM nodes instead of replacing them
- `setState` still drives reactive updates

## Run

```bash
node examples/serve.js
```

Open:

`http://localhost:3000/examples/hydration-stateful-counter/`
