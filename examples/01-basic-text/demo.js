const basicText =
  document.createElement("div")
    .setAttributes({ class: "card" })
    .setText("Hello DOM++");

app.setChildren(basicText);