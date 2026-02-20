/**
 * DOM++ Reconcile List Patterns
 *
 * Demonstrates three repeated render strategies:
 * 1) Auto append
 * 2) Auto prepend
 * 3) Id-based retained nodes without key
 */

import "../../src/index.js";
import { installDomppReconcile } from "../../src/addons/reconcile.addon.js";

installDomppReconcile({ overrideSetters: true });

const app = document.getElementById("app");

const appendPanel = document.createElement("section").setAttributes({ class: "panel" });
const prependPanel = document.createElement("section").setAttributes({ class: "panel" });
const idPanel = document.createElement("section").setAttributes({ class: "panel" });

const appendInfo = document.createElement("div").setAttributes({ class: "meta" });
const prependInfo = document.createElement("div").setAttributes({ class: "meta" });
const idInfo = document.createElement("div").setAttributes({ class: "meta" });

const appendList = document.createElement("ul");
const prependList = document.createElement("ul");
const idList = document.createElement("ul");

appendPanel.setChildren(
  document.createElement("h2").setText("Auto Append"),
  appendInfo,
  appendList
);

prependPanel.setChildren(
  document.createElement("h2").setText("Auto Prepend"),
  prependInfo,
  prependList
);

idPanel.setChildren(
  document.createElement("h2").setText("Id-Based Retention"),
  idInfo,
  idList
);

app.setChildren(appendPanel, prependPanel, idPanel);

let tick = 0;
let sequence = 0;

const appendNodes = [];
const prependNodes = [];

const idOrder = ["a", "b", "c"];
const idNodeMap = new Map();
const idRenderCount = new Map();

const createListItem = (label, id = null) => {
  const li = document.createElement("li");
  if (id) {
    li.setAttributes({ id });
  }
  li.setText(label);
  return li;
};

const getOrCreateIdNode = (id) => {
  if (!idNodeMap.has(id)) {
    idNodeMap.set(id, createListItem("", `item-${id}`));
    idRenderCount.set(id, 0);
  }
  return idNodeMap.get(id);
};

const render = () => {
  appendInfo.setText(`Items: ${appendNodes.length} | Last tick: ${tick}`);
  prependInfo.setText(`Items: ${prependNodes.length} | Last tick: ${tick}`);
  idInfo.setText(`Order: ${idOrder.join(" -> ")} | Tick: ${tick}`);

  appendList.setChildren(...appendNodes);
  prependList.setChildren(...prependNodes);

  const idNodes = idOrder.map((id) => {
    const node = getOrCreateIdNode(id);
    const nextCount = (idRenderCount.get(id) || 0) + 1;
    idRenderCount.set(id, nextCount);
    node.setText(`id=${id} | renders=${nextCount}`);
    return node;
  });

  // Render order changes, but each node identity is retained by unique id.
  idList.setChildren(...idNodes);
};

const nextFrame = () => {
  tick += 1;
  sequence += 1;

  appendNodes.push(createListItem(`append #${sequence}`));

  sequence += 1;
  prependNodes.unshift(createListItem(`prepend #${sequence}`));

  // Rotate order to show stable node retention by id across renders.
  idOrder.push(idOrder.shift());

  if (appendNodes.length > 8) {
    appendNodes.shift();
  }
  if (prependNodes.length > 8) {
    prependNodes.pop();
  }

  render();
};

render();
setInterval(nextFrame, 900);
