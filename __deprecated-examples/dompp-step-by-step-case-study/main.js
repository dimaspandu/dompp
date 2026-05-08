import "../../src/index.js";
import { installDomppStateful } from "../../src/reactive/stateful.js";
import { installDomppReconcile } from "../../src/addons/reconcile.addon.js";

// Install reconcile first so the stateful wrappers bind to the patched setters.
installDomppReconcile({ overrideSetters: true });
installDomppStateful();

const el = (tag) => document.createElement(tag);
const app = document.getElementById("app");

// Helper to render a consistent demo card layout.
function card(title, description, content) {
  return el("section").setAttributes({ class: "card" }).setChildren(
    el("h2").setText(title),
    el("small").setText(description),
    content
  );
}

function demoBasicUsage() {
  // Basic DOM++ chaining: attributes + children.
  const content = el("div").setChildren(
    el("h3").setText("Hello DOM++"),
    el("p").setText("This is a DOM++ element with chained mutations.")
  );

  return card(
    "Basic Usage",
    "DOM++ extends real DOM nodes with chainable helpers.",
    content
  );
}

function demoStatefulPanel() {
  // A stateful element that owns `total` and re-renders on setState.
  const panel = el("section")
    .setAttributes({ class: "panel" })
    .setState({ total: 0 });

  // The callback is re-run whenever the panel state changes.
  panel.setChildren(({ state, setState }) => [
    el("h3").setText(`Total: ${state.total}`),
    el("button").setText("Donate 10k").setEvents({
      click: () => setState(({ state }) => {
        state.total += 10000;
      })
    })
  ]);

  return card(
    "Stateful Panel",
    "State lives on the element; setChildren re-runs when state changes.",
    panel
  );
}

function demoCrossElement() {
  // Summary owns its own state, other elements can update it explicitly.
  const summary = el("div").setState({ total: 0 });
  summary.setChildren(({ state }) => [
    el("strong").setText(`Total: ${state.total}`)
  ]);

  const content = el("div").setChildren(
    summary,
    el("div").setAttributes({ class: "actions" }).setChildren(
      el("button").setText("Donate 10k").setEvents({
        click: () => {
          summary.setState(({ state }) => {
            state.total += 10000;
          });
        }
      }),
      el("button").setAttributes({ class: "secondary" }).setText("Donate 25k").setEvents({
        click: () => {
          summary.setState(({ state }) => {
            state.total += 25000;
          });
        }
      })
    )
  );

  return card(
    "Cross-Element Updates",
    "Buttons update the summary element via its setState prototype method.",
    content
  );
}

function demoMatchById() {
  // matchById preserves DOM identity for these children across updates.
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

  const note = el("div").setAttributes({ class: "note" }).setText(
    "Stable ids + matchById preserve DOM nodes across updates."
  );

  const content = el("div").setChildren(counter, note);

  return card(
    "matchById Preservation",
    "Reconcile keeps DOM identity stable while setChildren reruns.",
    content
  );
}

// Mount the four demos in order.
app.setChildren(
  demoBasicUsage(),
  demoStatefulPanel(),
  demoCrossElement(),
  demoMatchById()
);
