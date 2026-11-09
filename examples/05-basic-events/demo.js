const result = document.createElement("p").setText("Waiting for interaction...");

const button = document.createElement("button")
  .setText("Click Me")
  .setEvents({ click() { result.setText("Button clicked."); } });

const card = document.createElement("div")
  .setAttributes({ class: "card" })
  .setChildren(button, result);

app.setChildren(card);