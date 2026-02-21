/**
 * DOM++ Reconcile Match By Id Ordered List
 *
 * This example recreates <li> template nodes on each refresh.
 * The list uses matchById to retain existing DOM nodes by id.
 */

import "../../src/index.js";
import { installDomppReconcile } from "../../src/addons/reconcile.addon.js";
import { installDomppStateful } from "../../src/reactive/stateful.js";

installDomppReconcile({ overrideSetters: true });
installDomppStateful();

const greetingByHour = (date = new Date()) => {
  const hour = date.getHours();

  if (hour < 10) return "Good morning";
  if (hour < 15) return "Good day";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const createItem = () => ({
  id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  message: `${greetingByHour()}, World!`
});

const handleRefresh = ({ state }) => {
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
};

const app = document.getElementById("app");

const timeline = document.createElement("section")
  .setAttributes({ class: "timeline" })
  .setState({
    items: []
  });

const meta = document.createElement("p")
  .setAttributes({ class: "meta" });
const orderedList = document.createElement("ol")
  .setAttributes({ class: "timeline__list" });

timeline.setChildren(({ state: { items } }) => {
  const templates = items.map((item) =>
    document.createElement("li")
      .setAttributes({
        id: item.id,
        class: "timeline__row"
      })
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

timeline.setState(handleRefresh);
timeline.setState(handleRefresh);
