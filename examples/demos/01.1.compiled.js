let basicLikes = 0;
let basicApp;

basicApp = document.createElement(
  document.getElementById("basic-app-01.1"),
  {
    className: "demo-surface basic-surface",
    styles: { backgroundColor: "#fffebb" },
  },
  renderChildren()
);

function renderChildren() {
  return [
    document.createElement(
      "div",
      { class: "like-row" },
      document.createElement("strong").setText(basicLikes),
      document.createElement("span").setText(" likes")
    ),
    document.createElement(
      "button",
      {
        class: "like-button",
        type: "button",
        styles: { fontStyle: basicLikes % 2 !== 0 ? "italic" : "normal" },
        disabled: basicLikes === 10,
        onClick() {
          basicLikes++;
          basicApp.setChildren(renderChildren());
        },
      },
      "♥ Like"
    ),
  ];
}
