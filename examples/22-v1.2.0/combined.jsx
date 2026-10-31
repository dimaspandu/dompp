/** @jsx elementBuilder */
import { createDOMPP } from "../../src/1.2.0/index.js";

const dompp = createDOMPP();
const app = document.getElementById("app");
const elementBuilder = document.elementBuilder.bind(document);
const componentBuilder = document.componentBuilder.bind(document);

let total = 0;
const builderCounter = componentBuilder((rerender) => (
  <section className="card">
    <h2>componentBuilder subtree</h2>
    <p>Builder count: {total}</p>
    <button onClick={() => {
      total += 1;
      rerender();
    }}>Increment with componentBuilder</button>
  </section>
));

const setterPanel = document.createElement("section");
setterPanel.setState({ count: 0 });
setterPanel.setChildren(({ state, setState }) => {
  const heading = document.createElement("h2");
  heading.setText("Existing setter runtime");

  const count = document.createElement("p");
  count.setText(`Setter count: ${state.count}`);

  const button = document.createElement("button");
  button.setText("Increment with setState");
  button.addEventListener("click", () => setState(({ state }) => {
    state.count += 1;
  }));

  return [heading, count, button];
});

const setterCard = elementBuilder("section", {
  className: "card",
  styles: { borderColor: "#9bb8d5" },
},
  elementBuilder("p", null, `Combined entry version: ${dompp.version}`),
  setterPanel
);

document.elementBuilder(app, null, setterCard, builderCounter.render());
