

let confirming = false;

const validator = document.createComponent((rerender) => (
  document.createElement("section", { "className": "demo-surface conditional-surface" }, document.createElement("h3", null, "Conditional child reconciliation"), document.createElement("p", null, "The panel is added or removed by rerendering only this component. A", document.createElement("code", null, "null"), "branch leaves no node in the virtual tree."), document.createElement("button", { "class": "action-button", "type": "button", "onClick": () => {
        if (!confirming) {
          confirming = true;
          rerender();
        }
      } }, "OPEN"), confirming ? (
      document.createElement("div", { "className": "conditional-panel", "role": "dialog", "aria-label": "Confirm" }, document.createElement("h4", null, "Are you sure?"), document.createElement("button", { "class": "action-button", "type": "button", "onClick": () => {
            confirming = false;
            rerender();
          } }, "CLOSE"))
    ) : null)
));

document.getElementById("conditional-app").setChildren(
  validator,
);
