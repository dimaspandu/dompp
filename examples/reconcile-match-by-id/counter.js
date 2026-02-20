/**
 * DOM++ Reconcile Match By Id
 *
 * This example recreates list item templates on every render.
 * The matchById option keeps existing DOM nodes by unique id.
 */

import "../../src/index.js";
import { installDomppReconcile } from "../../src/addons/reconcile.addon.js";

installDomppReconcile({ overrideSetters: true });

const app = document.getElementById("app");
const info = document.createElement("div").setAttributes({ class: "meta" });
const list = document.createElement("ul");
const identity = document.createElement("div").setAttributes({ class: "meta" });

app.setChildren(info, list, identity);

let tick = 0;
let order = ["alpha", "beta", "gamma", "delta"];
let tokenSeq = 0;

const tokenByNode = new WeakMap();

const buildTemplateNode = (id, position) =>
  document.createElement("li")
    .setAttributes({ id: `row-${id}` })
    .setChildren(`id=${id} | position=${position} | tick=${tick}`);

const buildTemplateNodes = () =>
  order.map((id, index) => buildTemplateNode(id, index + 1));

const collectIdentityLine = () => {
  const lines = [];

  for (const node of Array.from(list.children)) {
    if (!tokenByNode.has(node)) {
      tokenSeq += 1;
      tokenByNode.set(node, tokenSeq);
    }
    lines.push(`${node.id}->node#${tokenByNode.get(node)}`);
  }

  return lines.join(" | ");
};

const render = () => {
  const templates = buildTemplateNodes();

  list.setChildren(...templates, { matchById: true });

  info.setText(`tick=${tick} | order=${order.join(" -> ")}`);
  identity.setText(`identity: ${collectIdentityLine()}`);
};

const nextFrame = () => {
  tick += 1;

  // Rotate order to force frequent reordering.
  order.push(order.shift());

  // Reverse occasionally to stress id-based matching.
  if (tick % 4 === 0) {
    order = order.slice().reverse();
  }

  render();
};

render();
setInterval(nextFrame, 1000);
