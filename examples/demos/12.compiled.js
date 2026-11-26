

let countA = 0;
let countB = 0;

const componentA = document.createComponent((rerender) => (
  document.createElement("section", { "className": "cross-card" }, document.createElement("h4", null, "Component A"), document.createElement("p", { "className": "cross-count" }, "Count:", countA), document.createElement("div", { "className": "cross-actions" }, document.createElement("button", { "class": "action-button", "type": "button", "onClick": () => rerender(() => countA++) }, "+1 A (self)"), document.createElement("button", { "class": "action-button", "type": "button", "onClick": () => { countB++; componentB.rerender(); } }, "+1 B (from A)")))
));

const componentB = document.createComponent((rerender) => (
  document.createElement("section", { "className": "cross-card" }, document.createElement("h4", null, "Component B"), document.createElement("p", { "className": "cross-count" }, "Count:", countB), document.createElement("div", { "className": "cross-actions" }, document.createElement("button", { "class": "action-button", "type": "button", "onClick": () => rerender(() => countB++) }, "+1 B (self)"), document.createElement("button", { "class": "action-button", "type": "button", "onClick": () => { countA++; componentA.rerender(); } }, "+1 A (from B)")))
));

document.getElementById("cross-update-app").setChildren([componentA, componentB]);
