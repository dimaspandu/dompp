# Hydration Assimilation List

This example assimilates a pre-rendered HTML list and adds interactive behavior without rebuilding the list structure from scratch.

## What It Demonstrates

- Optional `installDomppHydration()` addon
- `hydrateChildren(...)` to access existing child nodes
- Attach events to existing nodes (`input`, `button`)
- Filter the list by mutating style (`display`)
- Toggle selected state per item and update the summary

## Run

```bash
node examples/serve.js
```

Then open:

`http://localhost:3000/examples/hydration-assimilation-list/`
