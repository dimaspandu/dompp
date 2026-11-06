
function App(props, ...children) {
  return elementBuilder(
    document.getElementById("app-jsx"),
    props,
    ...children
  );
}

let count = 0;
let countEl;
let buttonEl;

elementBuilder(App, null, elementBuilder("div", { "className": "card" }, elementBuilder("h3", null, "Direct element updates"), elementBuilder("p", null, "Update a node with ElementBuilder setters without rerendering its parent."), countEl = elementBuilder("p", { "className": "counter-value", "style": {
      backgroundColor: count % 2 === 0 ? "purple" : "fuchsia",
      color: "white",
    } }, count), buttonEl = elementBuilder("button", { "class": "secondary", "onClick": () => {
        count += 1;
        countEl
          .setStyles({
            backgroundColor: count % 2 === 0 ? "purple" : "fuchsia",
            color: "white",
          })
          .setText(count);
        if (count === 10) {
          buttonEl.setAttributes({ disabled: true });
        }
      } }, "UPDATE"), elementBuilder("hr", null), elementBuilder.fragment("Hello, I'm just a Fragment!")))
