const [count, setCount] = document.createSignal(0);

const display = document.createElement("h2")
  .setAttributes({ class: "count" })
  .setFineGrained()
  .setText(() => count());

const desc = document.createElement("div")
  .setAttributes({ class: "description-box" })
  .setFineGrained()
  .setStyles(() => ({ backgroundColor: count() % 2 === 0 ? "lightblue" : "lightcoral", padding: "1em", borderRadius: "0.5em" }))
  .setText(() => "Current count: " + count());

const controls = document.createElement("div").setAttributes({ class: "row" }).setChildren(
  document.createElement("button").setText("Increment").setEvents({ click() { setCount(count() + 1); } }),
  document.createElement("button").setText("Decrement").setEvents({ click() { setCount(count() - 1); } })
);

app.setChildren(display, desc, controls);