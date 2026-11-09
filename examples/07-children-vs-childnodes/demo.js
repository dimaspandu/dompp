const container = document.createElement("div").setAttributes({ class: "card" });

// Using children - element-only
container.setChildren(({ children }) => [
  children[0], // First element child
  document.createElement("span").setText("Inserted")
]);

// Using childNodes - raw nodes
container.setChildren(({ childNodes }) => [
  childNodes[0], // First node (could be text)
  childNodes[1],
  document.createElement("span").setText("Preserved structure")
]);

app.setChildren(container);