# Reconcile Stateful Counter

This example uses local state on the parent element and updates a stable set of child nodes through callback-based `setChildren`.

## What It Demonstrates

- Local state with `setState`
- Callback-based rendering with `setChildren(({ state }) => ...)`
- Reconcile patch behavior without virtual DOM
- Positional child matching without per-element `id`
- Stable node references: elements are created once and then mutated

## Run

```bash
node examples/serve.js
```

Open:

`http://localhost:3000/examples/reconcile-stateful-counter/`

## Two Coding Styles That Affect Reconcile Behavior

Style A: recreate nodes inside each render callback:

```js
app.setChildren(({ state, setState }) => [
  document.createElement("h2").setChildren(`Count: ${state.count}`),
  document.createElement("button")
    .setChildren("+")
    .setEvents({ click: () => setState(increment) })
]);
```

Style B: keep stable node references and mutate values:

```js
const title = document.createElement("h2");
const incrementBtn = document.createElement("button")
  .setChildren("+")
  .setEvents({ click: () => app.setState(increment) });

app.setChildren(({ state }) => {
  title.setChildren(`Count: ${state.count}`);
  return [title, incrementBtn];
});
```

## How Reconcile Works in These Two Styles

For both styles, `setChildren` runs on every state update and produces the next child list.

With Style A:

- Fresh node instances are created each time
- Without `matchById`, reconcile matches by position and inserts/replaces nodes
- With `matchById`, reconcile can map new templates to existing nodes by `id` and patch them

With Style B:

- The same node instances are returned each time
- Reconcile sees stable references and keeps nodes in place
- Only explicit mutations (`setText`, `setStyles`, `setAttributes`) apply DOM changes

## Relationship to `matchById`

`matchById` is still useful when you intentionally recreate template nodes on each render and want to match them back to existing DOM nodes by `id`, especially for dynamic or reordered lists.

For this example, stable references are enough, so `matchById` is not necessary.

See dedicated `matchById` examples:

`http://localhost:3000/examples/reconcile-match-by-id/`
`http://localhost:3000/examples/reconcile-match-by-id-ordered-list/`
