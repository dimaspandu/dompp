const fragment = document.createDocumentFragment();
fragment.setChildren(
  document.createElement("h2").setText("Title"),
  document.createElement("p").setText("Paragraph 1"),
  document.createElement("p").setText("Paragraph 2")
);

const container = document.createElement("div").setAttributes({ class: "card" });
container.setChildren(fragment);

app.setChildren(container);