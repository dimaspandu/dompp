# DOM++ (DOM Plus Plus): A Step-by-Step Study Case for Building Interactive UI

DOM++ (DOM Plus Plus) allows you to create interactive UI on web pages, but how does it work under the hood? This article explains what DOM++ is, what the basic usage looks like, how to build user interfaces in a study case, and how the browser applies DOM++ to HTML to make it more interactive.

The goal here is simple: walk through DOM++ usage step by step, using a small but realistic case study you can follow and reproduce.

---

## 1) What Is DOM++?

DOM++ is a tiny utility layer that **extends native DOM elements** with chainable helpers. Instead of wrapping elements in a framework, DOM++ adds methods directly onto `Element.prototype` so you can write UI mutations clearly and explicitly.

Core ideas:
- You still work with real DOM nodes.
- DOM++ only makes mutation more ergonomic.
- Optional add-ons can add stateful behavior or reconcile.

In short: **DOM++ is not a framework—it's a mutation layer.**

---

## 2) Basic Usage in One Minute

To use DOM++ you install it once, then create elements normally:

```js
import "../../src/index.js";

const el = (tag) => document.createElement(tag);

const card = el("div")
  .setAttributes({ class: "card" })
  .setChildren(
    el("h2").setText("Hello DOM++"),
    el("p").setText("This is a DOM++ element.")
  );

document.body.appendChild(card);
```

What you just did:
- Created normal DOM nodes (`div`, `h2`, `p`)
- Used DOM++ helpers: `.setAttributes`, `.setText`, `.setChildren`
- Mounted everything to the DOM

No virtual DOM. No template compiler. Just real DOM with fluent mutations.

---

## 3) Step-by-Step Study Case: A Simple Donation Panel

We’ll build a tiny “donation panel” that shows a total and lets a user donate. This mimics a small piece of a crowdfunding UI.

### Step 1 — Create the structure

```js
import "../../src/index.js";
import { installDomppStateful } from "../../src/reactive/stateful.js";

installDomppStateful();

const el = (tag) => document.createElement(tag);

const panel = el("section")
  .setAttributes({ class: "panel" })
  .setState({ total: 0 });

const root = document.getElementById("app");
root.setChildren(panel);
```

Now we have a container with state (`total: 0`).

**Important detail about stateful elements:**
- An element becomes *stateful* only after you call `setState` on it.
- Once state exists, any *structure* you build that reads `state` (attributes, styles, events, or children) becomes reactive.
- This is why the next step uses `setChildren` with a callback: it reads `state.total` and will be re-run when state changes.

### Step 2 — Render UI from state

```js
panel.setChildren(({ state }) => [
  el("h3").setText(`Total: ${state.total}`),
  el("button").setText("Donate 10k")
]);
```

This uses the stateful addon: whenever `state.total` changes, DOM++ re-runs the callback and updates the children. In this example, clicking the Donate button calls `setState` on the panel, which triggers the panel to run `setChildren` again with the latest state.

**What happens when `setState` mutates?**
- DOM++ compares the new state to the old state (shallow check).
- If something changed, it schedules a microtask to re-run all bound setters.
- Each bound setter (like `setChildren`, `setText`, `setAttributes`, `setStyles`, `setEvents`) is re-evaluated using the latest `state`.
- DOM updates are then applied, keeping the UI in sync with the element’s state.

### Step 3 — Add interaction

```js
panel.setChildren(({ state, setState }) => [
  el("h3").setText(`Total: ${state.total}`),
  el("button").setText("Donate 10k").setEvents({
    click: () => setState(({ state }) => {
      state.total += 10000;
    })
  })
]);
```

Now the button updates the panel state. DOM++ re-renders the children, and the UI stays in sync.

That is the DOM++ mental model in its simplest form:

**State lives on the element, and UI is re-generated from that state.**

---

## 4) Adding Cross-Element Updates

Next, we add a second element that changes the first element’s state. This is common in real apps (e.g. a donate button updates a summary panel).

```js
const summary = el("div").setState({ total: 0 });
summary.setChildren(({ state }) => [
  el("strong").setText(`Total: ${state.total}`)
]);

const section = el("section").setChildren(
  summary,
  el("button").setText("Donate 10k").setEvents({
    click: () => {
      summary.setState(({ state }) => {
        state.total += 10000;
      });
    }
  })
);
```

This is explicit and easy to trace: the donate button calls summary.setState(...), which is a DOMPP method added to the element prototype. Because summary is a stored element reference, its prototype chaining gives you direct access to setState, and the summary re-renders when that state mutates. No global store is required.

---

## 5) Keeping DOM Identity Stable with `matchById`

When `setChildren` is called repeatedly, DOM++ can optionally preserve DOM nodes if you add stable ids and use `matchById`.

```js
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

With this pattern:
- The same `h3` and `button` nodes stay alive across updates
- DOM identity is preserved while still using a re-render callback

---

## 6) Putting It All Together

A full UI is just composition of these pieces:

- Small stateful panels
- Explicit cross-element updates
- Optional reconcile when you need stable identity

This is how DOM++ scales without turning into a framework. You keep control, but avoid the usual DOM boilerplate.

---

---

## 7) The Same Case Study in JSX (Babel CDN)

If you prefer JSX syntax, you can author the same DOMPP UI declaratively and let Babel transform it in the browser. The key is a small JSX factory function that maps JSX into DOMPP mutations.

### JSX Factory (`d`)

```js
function d(tag, props, ...children) {
  const node = document.createElement(tag);

  if (props) {
    const { style, className, class: classAttr, on, ...attrs } = props;

    if (className || classAttr) {
      node.setAttributes({ class: className || classAttr });
    }

    if (style) {
      node.setStyles(style);
    }

    if (on) {
      node.setEvents(on);
    }

    if (Object.keys(attrs).length) {
      node.setAttributes(attrs);
    }
  }

  if (children.length) {
    node.setChildren(...children.flat());
  }

  return node;
}
```

With the pragma below, Babel routes JSX to `d(...)` instead of React:

```js
/** @jsx d */
```

### JSX Version of the Stateful Panel

```jsx
const panel = <section className="panel" />;
panel
  .setState({ total: 0 })
  .setChildren(({ state, setState }) => [
    <h3>{`Total: ${state.total}`}</h3>,
    <button on={{
      click: () => setState(({ state }) => {
        state.total += 10000;
      })
    }}>Donate 10k</button>
  ]);
```

### JSX Version of Cross-Element Updates

```jsx
const summary = <div />;
summary
  .setState({ total: 0 })
  .setChildren(({ state }) => [
    <strong>{`Total: ${state.total}`}</strong>
  ]);

const view = (
  <section>
    {summary}
    <div className="actions">
      <button on={{
        click: () => summary.setState(({ state }) => {
          state.total += 10000;
        })
      }}>Donate 10k</button>
      <button className="secondary" on={{
        click: () => summary.setState(({ state }) => {
          state.total += 25000;
        })
      }}>Donate 25k</button>
    </div>
  </section>
);
```

### Why This Works Well

- JSX is only syntax sugar; DOMPP still works on real DOM nodes.
- `d(...)` maps JSX props to DOMPP helpers (`setAttributes`, `setStyles`, `setEvents`).
- You keep DOMPP’s explicit state model, but author UI in a more declarative style.

### Live Demo

A JSX version of the demo is included here:

- `examples/dompp-step-by-step-case-study-jsx/`

You can run it via `node examples/serve.js` and open:

- `http://localhost:3000/examples/dompp-step-by-step-case-study-jsx/`

## Final Notes

DOM++ is a great fit when:
- You want full control of DOM behavior
- You value explicit state and mutation
- You want UI logic that stays close to the platform

If you want to explore further, build a larger example like a campaign list or a donation ledger. The patterns above scale directly to that case.

---

Thanks for reading. If you want a longer case study version or a walkthrough with a full project, just let me know.




