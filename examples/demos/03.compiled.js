

let componentLikes = 0;

const likeComponent = document.createComponent((rerender) => (
  document.createElement("section", { "class": "demo-surface component-surface" }, document.createElement("div", { "class": "like-row" }, document.createElement("strong", null, componentLikes), document.createElement("span", null, "likes")), document.createElement("button", { "class": "like-button", "type": "button", "onClick": () => rerender(() => componentLikes++) }, "♥ Like"))
));

document.getElementById("component-app").setChildren(
  likeComponent
);
