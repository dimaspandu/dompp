import { createDOMPP } from "../../src/1.2.0/dompp.js";

const dompp = createDOMPP();
const app = document.getElementById("app");

const counter = document.createElement("section");
counter.setState({ count: 0 });
counter.setChildren(({ state, setState }) => {
  const heading = document.createElement("h2");
  heading.textContent = `Setter counter: ${state.count}`;

  const button = document.createElement("button");
  button.textContent = "Increment";
  button.addEventListener("click", () => setState(({ state }) => {
    state.count += 1;
  }));

  return [heading, button];
});

const card = document.createElement("section");
card.setAttributes({ class: "card" });
card.setStyles({ marginTop: "16px" });
card.setChildren(
  document.createElement("h2").setText("DOM++ setters only"),
  document.createElement("p").setText(`Installed API version: ${dompp.version}`),
  counter
);

app.setChildren(card);
