

let basicLikes = 0;
let basicCount;

function BasicApp(_props, ...children) {
  return document.createElement(
    document.getElementById("basic-jsx-app"),
    _props,
    ...children
  );
}

document.createElement(BasicApp, { "className": "demo-surface jsx-surface", "styles": {
    backgroundColor: "#fffebb",
  } }, document.createElement("div", { "class": "like-row" }, basicCount = document.createElement("strong", null, basicLikes), document.createElement("span", null, "likes")), document.createElement("button", { "class": "like-button", "type": "button", "onClick": () => {
      basicLikes++;
      basicCount.setText(basicLikes);
    } }, "♥ Like"))
