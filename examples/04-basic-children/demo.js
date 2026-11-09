const card =
  document.createElement("div")
    .setAttributes({ class: "card" })
    .setChildren(
      document.createElement("h2").setText("DOM++"),
      document.createElement("p").setText("Children are declarative."),
      document.createElement("button").setText("Learn More")
    );

app.setChildren(card);