# DOMPP State in the Wild: A Tiny Story About Local State, Cross-Element Updates, and Reconcile

I started with a tiny UI: a counter, a list, and a button. It sounds trivial, but these three pieces expose almost everything you need to understand DOMPP’s mental model.

This is a short, Medium-style walkthrough. We will move fast, focus on the feel, and keep each example small and real.

---

## 1) Local State: The Element Owns It

DOMPP lets an element own its own state. No global store, no magic. The element updates itself and re-renders its children when the state changes.

```js
const el = (tag) => document.createElement(tag);

const counter = el("div")
  .setState({ count: 0 })
  .setChildren(({ state, setState }) => [
    el("h3").setText(`Count: ${state.count}`),
    el("button").setText("Increment").setEvents({
      click: () => setState(({ state }) => {
        state.count += 1;
      })
    })
  ]);
```

**What this code does, explicitly:**
- `el` is a shorthand for `document.createElement` to keep the code readable.
- `.setState({ count: 0 })` attaches local state directly to the `div` element.
- `.setChildren(...)` receives a callback; DOMPP re-runs this callback whenever the element’s state changes.
- Clicking the button calls `setState`, which mutates `state.count` and triggers a re-render of the children.
- The `h3` text is recalculated on each state update, so the number stays in sync.

**Important detail:** in the snippet above, `setChildren` creates a fresh `h3` and a fresh `button` on every update because those nodes are constructed inside the callback. That means the whole children list is rebuilt each time.

If you want DOMPP to preserve existing child nodes, you can enable reconcile and match by id:

```js
const el = (tag) => document.createElement(tag);

const counter = el("div")
  .setState({ count: 0 })
  .setChildren(({ state, setState }) => [
    el("h3").setAttributes({ id: "counter-title" }).setText(`Count: ${state.count}`),
    el("button").setAttributes({ id: "counter-btn" }).setText("Increment").setEvents({
      click: () => setState(({ state }) => {
        state.count += 1;
      })
    }),
    { matchById: true }
  ]);
```

**What changes here, explicitly:**
- Each child has a stable `id`.
- `{ matchById: true }` tells DOMPP to reconcile children by `id`.
- The `h3` and `button` nodes are preserved across updates instead of recreated.

---

## 2) Cross-Element Updates: The Most Honest Pattern

Now let a second element update that state. No context, no stores—just one element reaching another and mutating state directly.

```js
const el = (tag) => document.createElement(tag);

const summary = el("div").setState({ total: 0 });
summary.setChildren(({ state }) => [
  el("strong").setText(`Total: ${state.total}`)
]);

const donateButton = el("button").setText("Donate 10k");

donateButton.setEvents({
  click: () => {
    summary.setState(({ state }) => {
      state.total += 10000;
    });
  }
});

const section = el("section").setChildren(summary, donateButton);
```

**What this code does, explicitly:**
- `summary` owns its own state (`total`). It renders that number in a `strong` element.
- `donateButton` is a separate element with a click handler.
- The click handler calls `summary.setState(...)`, which mutates `summary`’s local state.
- DOMPP re-runs `summary.setChildren` after the state changes, so the total updates on screen.
- This is “cross-element” because one element updates another element’s state directly.

---

## 3) Reconcile Without `matchById`: Position Wins

DOMPP reconciles children by position by default. This means if you **prepend** or **append** items, DOM identity follows the index, not the item itself.

```js
const el = (tag) => document.createElement(tag);

const list = el("ul").setState({
  items: [
    { id: 1, label: "Alpha" },
    { id: 2, label: "Bravo" },
    { id: 3, label: "Charlie" },
  ],
  openId: 2,
});

list.setChildren(({ state }) =>
  state.items.map((item) =>
    el("li").setChildren(
      el("span").setText(item.label),
      el("em").setText(state.openId === item.id ? "(open)" : "")
    )
  )
);

// Example update: prepend a new item
list.setState(({ state }) => {
  state.items = [
    { id: 99, label: "New First" },
    ...state.items,
  ];
});
```

**What this code does, explicitly:**
- The list (`ul`) owns the state, not each `li`.
- `items` defines the data, and `openId` marks which item is “open.”
- `setChildren` re-runs whenever list state changes, rebuilding children from the data.
- With default reconcile, DOM identity is matched by position. When you prepend/append, existing nodes shift by index.
- Because state is on the list, the visual state still renders correctly—but DOM identity is not preserved.

---

## 4) Local State + `matchById`: Preserve Nodes Across Updates

If you want DOMPP to preserve existing child nodes across state updates, you can enable reconcile and match by id. This keeps DOM identity stable even though `setChildren` is called again.

```js
const el = (tag) => document.createElement(tag);

const counter = el("div")
  .setState({ count: 0 })
  .setChildren(({ state, setState }) => [
    el("h3").setAttributes({ id: "counter-title" }).setText(`Count: ${state.count}`),
    el("button").setAttributes({ id: "counter-btn" }).setText("Increment").setEvents({
      click: () => setState(({ state }) => {
        state.count += 1;
      })
    }),
    { matchById: true }
  ]);
```

**What this code does, explicitly:**
- Each child has a stable `id`.
- `{ matchById: true }` tells DOMPP to reconcile children by `id`.
- The `h3` and `button` nodes are preserved across updates instead of recreated.
- This keeps DOM identity stable while still letting you re-run `setChildren` on every update.

---

## The Mental Model in One Line

DOMPP is not trying to hide the DOM—it is trying to make it comfortable. State lives on the element, updates are explicit, and reconcile is opt-in when you need it.

If you can hold those three ideas, you can scale from a toy counter to a full UI without losing clarity.
