const basicStyles =
  document.createElement("div")
    .setAttributes({ class: "card" })
    .setStyles({ background: "#111", color: "white", border: "2px solid #333" })
    .setText("Styled Element");

app.setChildren(basicStyles);