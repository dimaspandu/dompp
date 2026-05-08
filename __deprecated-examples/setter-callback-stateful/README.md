# Stateful Setter Callback

This example shows setter callbacks when the `stateful` addon is enabled.

In this mode, callbacks receive:

- previous values from each setter (`text`, `styles`, `attributes`, `events`, `childNodes`, etc.)
- plus stateful context (`state`, `setState`)

Examples used:

- `setStyles(({ state, styles }) => ...)`
- `setChildren(({ state, childNodes }) => ...)`
- `setText(({ state, text }) => ...)`
- `setAttributes(({ state, attributes }) => ...)`
- `setEvents(({ state, events, setState }) => ...)`

## Run

```bash
node examples/serve.js
```

Open:

`http://localhost:3000/examples/setter-callback-stateful/`
