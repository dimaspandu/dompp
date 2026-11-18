let showExtra = false;

const fragmentComponent = document.createComponent((rerender) => {
  const children = [
    document.createElement("strong").setText("Item A"),
    document.createElement("strong").setText("Item B"),
  ];
  if (showExtra) {
    children.push(document.createElement("strong").setText("Item C"));
  }
  return document.createDocumentFragment(...children);
});

const arrayComponent = document.createComponent((rerender) => [
  document.createElement("em").setText("X"),
  document.createElement("em").setText("Y"),
]);

const app = document.getElementById("app");
app.setChildren(
  document.createElement("button")
    .setText("Toggle extra")
    .setAttributes({ type: "button" })
    .setEvents({ click() { showExtra = !showExtra; fragmentComponent.rerender(); } }),
  fragmentComponent,
  arrayComponent
);
