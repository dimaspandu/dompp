const basicAttributes =
  document.createElement("div")
    .setAttributes({ class: "card" })
    .setChildren(
      document.createElement("input")
        .setAttributes({ type: "text", placeholder: "Your name", value: "DOM++", disabled: false })
    );

app.setChildren(basicAttributes);