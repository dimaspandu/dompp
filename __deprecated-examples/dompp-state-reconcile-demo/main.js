import "../../src/index.js";
import { installDomppReconcile } from "../../src/addons/reconcile.addon.js";
import { installDomppStateful } from "../../src/reactive/stateful.js";

installDomppReconcile({ overrideSetters: true });
installDomppStateful();

const el = (tag) => document.createElement(tag);
const app = document.getElementById("app");

function demoLocalState() {
  const card = el("section").setAttributes({ class: "card" });
  const title = el("h2").setText("1) Local State: The Element Owns It");
  const desc = el("small").setText("setState lives on the element; setChildren re-runs on updates.");

  const counter = el("div").setState({ count: 0 });
  counter.setChildren(({ state, setState }) => [
    el("h3").setText(`Count: ${state.count}`),
    el("button").setText("Increment").setEvents({
      click: () => setState(({ state }) => {
        state.count += 1;
      })
    })
  ]);

  const note = el("div").setAttributes({ class: "note" }).setText(
    "Every update recreates h3/button because they are built inside the callback."
  );

  card.setChildren(title, desc, counter, note);
  return card;
}

function demoLocalStateMatchById() {
  const card = el("section").setAttributes({ class: "card" });
  const title = el("h2").setText("2) Local State: With reconcile matchById");
  const desc = el("small").setText("matchById preserves DOM nodes across setChildren runs.");

  const counter = el("div").setState({ count: 0 });
  counter.setChildren(({ state, setState }) => [
    el("h3").setAttributes({ id: "counter-title" }).setText(`Count: ${state.count}`),
    el("button").setAttributes({ id: "counter-btn" }).setText("Increment").setEvents({
      click: () => setState(({ state }) => {
        state.count += 1;
      })
    }),
    { matchById: true }
  ]);

  const note = el("div").setAttributes({ class: "note" }).setText(
    "Stable ids + matchById keep the same h3/button nodes alive between updates."
  );

  card.setChildren(title, desc, counter, note);
  return card;
}

function demoCrossElement() {
  const card = el("section").setAttributes({ class: "card" });
  const title = el("h2").setText("3) Cross-Element Updates: The Most Honest Pattern");
  const desc = el("small").setText("One element updates the state of another element directly.");

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

  const note = el("div").setAttributes({ class: "note" }).setText(
    "The button does not own the total; it mutates summary state explicitly."
  );

  card.setChildren(title, desc, summary, donateButton, note);
  return card;
}

function demoReconcilePositionWins() {
  const card = el("section").setAttributes({ class: "card" });
  const title = el("h2").setText("4) Reconcile + matchById: Position Wins");
  const desc = el("small").setText("Prepend/append shows DOM reuse by position when ids are absent.");

  const list = el("ul").setState({
    items: [
      { id: 1, label: "Alpha" },
      { id: 2, label: "Bravo" },
      { id: 3, label: "Charlie" },
    ],
    nextId: 4,
  });

  list.setChildren(({ state }) =>
    state.items.map((item) =>
      el("li").setChildren(
        el("span").setText(item.label),
        el("em").setText(" (node-by-position)")
      )
    )
  );

  const actions = el("div").setAttributes({ class: "actions" });
  const prependBtn = el("button").setText("Prepend").setEvents({
    click: () => {
      list.setState(({ state }) => {
        const next = { id: state.nextId, label: `Item ${state.nextId}` };
        state.nextId += 1;
        state.items = [next, ...state.items];
      });
    }
  });
  const appendBtn = el("button").setAttributes({ class: "secondary" }).setText("Append").setEvents({
    click: () => {
      list.setState(({ state }) => {
        const next = { id: state.nextId, label: `Item ${state.nextId}` };
        state.nextId += 1;
        state.items = [...state.items, next];
      });
    }
  });

  actions.setChildren(prependBtn, appendBtn);

  const note = el("div").setAttributes({ class: "note" }).setText(
    "Because list items have no ids, DOMPP reuses nodes by index when the list grows."
  );

  card.setChildren(title, desc, list, actions, note);
  return card;
}

app.setChildren(
  demoLocalState(),
  demoLocalStateMatchById(),
  demoCrossElement(),
  demoReconcilePositionWins()
);
