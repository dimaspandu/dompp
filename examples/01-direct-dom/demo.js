const app = document.getElementById("app");

const count = document.createElement("strong").setText(0);
const button = document.createElement("button")
  .setText("Like")
  .setAttributes({ type: "button" })
  .setStyles({ padding: "6px 12px" })
  .setEvents({
    click() {
      const next = Number(count.textContent) + 1;
      count.setText(next);
      if (next === 10) {
        button.setAttributes({ disabled: true });
      }
    },
  });

app.setChildren(
  document.createElement("div").setChildren(count, document.createElement("span").setText(" likes")),
  button
);
