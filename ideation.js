// IDEATION: Reconcile + Stateful + matchById on an ordered list
//
// Goal:
// - Keep render code declarative (create fresh template nodes each render)
// - Still preserve real DOM node identity for list rows
// - Demonstrate prepend-heavy updates (newest item at the top)
//
// Key idea:
// - We intentionally rebuild <li> templates every update.
// - Each template carries a stable id from state.
// - Reconcile with { matchById: true } maps new templates to existing nodes.
// - Result: rows are patched/reordered instead of full remount behavior.

// Load DOM++ core extensions first.
import "./src/index.js";
// Reconcile enables patch-style setters.
import { installDomppReconcile } from "./src/addons/reconcile.addon.js";
// Stateful enables callback-based bindings + local element state.
import { installDomppStateful } from "./src/reactive/stateful.js";

installDomppReconcile({ overrideSetters: true });
installDomppStateful();

// Time-aware greeting to make inserted messages slightly contextual.
function greetingByHour(date = new Date()) {
  const hour = date.getHours();

  if (hour < 10) return "Good morning";
  if (hour < 15) return "Good day";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// Create a unique, stable identity for each timeline item.
function createItem() {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message: `${greetingByHour()}, World!`
  };
}

// State transition for the "Refresh" action.
//
// Flow:
// 1) Clone current items (immutability-friendly update shape).
// 2) Prepend a brand-new item to the front of the list.
// 3) If total items are more than 5, mark the topmost even position as UPDATED.
function handleRefresh({ state }) {
  const nextItems = state.items.map((item) => ({
    ...item,
    message: item.message.replace(" (UPDATED!)", "")
  }));

  nextItems.unshift(createItem());

  // Topmost even list position is #2 (0-based index: 1).
  if (nextItems.length > 5 && nextItems[1]) {
    nextItems[1].message = `${nextItems[1].message} (UPDATED!)`;
  }

  state.items = nextItems;
}

const app = document.getElementById("app");

// Timeline owns local state and drives render output.
const timeline = document.createElement("section")
  .setAttributes({ class: "timeline" })
  .setState({
    items: []
  });

// Keep container nodes stable. Only their content changes.
const meta = document.createElement("p")
  .setAttributes({ class: "meta" });
const orderedList = document.createElement("ol")
  .setAttributes({ class: "timeline__list" });

// Reactive render function.
//
// Important:
// - We recreate <li> templates on every update.
// - Each <li> has id=item.id from state.
// - matchById reuses existing real nodes by id and patches content/order.
timeline.setChildren(({ state: { items } }) => {
  const templates = items.map((item) =>
    document.createElement("li")
      .setAttributes({
        id: item.id,
        class: "timeline__row"
      })
      // Keep row text stable across prepend operations.
      // Ordered list numbering is handled natively by <ol>.
      .setChildren(item.message)
  );

  orderedList.setChildren(...templates, { matchById: true });
  meta.setText(`Items: ${items.length}. Newest item is prepended on refresh.`);

  return [meta, orderedList];
});

const refreshButton = document.createElement("button")
  .setAttributes({ type: "button" })
  .setChildren("Refresh")
  .setEvents({ click: () => timeline.setState(handleRefresh) });

app.setChildren(timeline, refreshButton);

// Seed initial state for demo visibility.
timeline.setState(handleRefresh);
timeline.setState(handleRefresh);
