# Reconcile Match By Id Ordered List

This demo uses stateful callback rendering and `setChildren(..., { matchById: true })` on an ordered list.

## Behavior

- The refresh action prepends a new item to the list
- The render callback recreates fresh `<li>` templates on each update
- `matchById` maps new templates to existing list nodes by unique `id`
- Existing row text stays stable on prepend (numbering comes from native `<ol>`)
- `"(UPDATED!)"` is applied only when total items are more than 5
- The marker is always placed on the topmost even position (list item #2)

## Run

```bash
node examples/serve.js
```

Open:

`http://localhost:3000/examples/reconcile-match-by-id-ordered-list/`
