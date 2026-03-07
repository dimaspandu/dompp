import "../../src/index.js";
import { installDomppReconcile } from "../../src/addons/reconcile.addon.js";
import { installDomppStateful } from "../../src/reactive/stateful.js";

installDomppReconcile({ overrideSetters: true });
installDomppStateful();

const counterRoot = document.getElementById("counter");
const initialCount = Number.parseInt(
  counterRoot.querySelector("#counter-value")?.textContent ?? "0",
  10
);

const counter = counterRoot.setState({
  count: Number.isNaN(initialCount) ? 0 : initialCount
});

counter.setChildren(({ children, state, setState }) => {
  const [countEl, decrementButton, incrementButton] = children;

  return [
    countEl.setText(String(state.count)),
    decrementButton
      .setAttributes({ id: "counter-decrement", type: "button" })
      .setText("-")
      .setEvents({
        click() {
          setState(({ state: current }) => {
            current.count -= 1;
          });
        }
      }),
    incrementButton
      .setAttributes({ id: "counter-increment", type: "button" })
      .setText("+")
      .setEvents({
        click() {
          setState(({ state: current }) => {
            current.count += 1;
          });
        }
      }),
    { matchById: true }
  ];
});
