const eb = document.elementBuilder;

let count = 0;
let countEl;
let buttonEl;

eb(document.getElementById("app-js")).setChildren([
  eb("div", { class: "card" },
    eb("h3").setText("Direct element updates"),
    eb("p").setText("Update a node with ElementBuilder setters without rerendering its parent."),
    countEl = eb("p", {
      className: "counter-value",
      style: {
        backgroundColor: count % 2 === 0 ? "purple" : "fuchsia",
        color: "white",
      }
    }, count),
    buttonEl = eb("button", {
      class: "secondary",
      onClick: () => {
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
      }
    }, "UPDATE"),
    eb("hr"),
    eb.fragment("Hello, I'm just a Fragment!")
  )
]);