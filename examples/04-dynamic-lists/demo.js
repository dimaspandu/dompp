let items = [
  { id: 1, text: "Alpha" },
  { id: 2, text: "Beta" },
  { id: 3, text: "Gamma" },
];
let showList = true;

const listComponent = document.createComponent((rerender) => (
  document.createElement("div").setChildren(
    document.createElement("button")
      .setText(showList ? "Hide" : "Show")
      .setAttributes({ type: "button" })
      .setEvents({ click() { showList = !showList; rerender(); } }),
    showList
      ? items.map((item) =>
          document.createElement("div")
            .setAttributes({ key: item.id })
            .setStyles({ padding: "4px 0" })
            .setText(item.text)
        )
      : null
  )
));

const app = document.getElementById("app");
app.setChildren(listComponent);
