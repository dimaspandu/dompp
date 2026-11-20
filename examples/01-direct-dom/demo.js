const app = document.getElementById("app");

let likes = 0;
const count = document.createElement("strong").setText(likes);
const button = document.createElement("button")
  .setText("♥ Like")
  .setAttributes({ type: "button", class: "like-button" })
  .setEvents({
    click() {
      likes++;
      count.setText(likes);
      if (likes === 10) {
        button.setAttributes({ disabled: true });
      }
    },
  });

app.setChildren(
  document.createElement("div")
    .setAttributes({ class: "like-row" })
    .setChildren(count, document.createElement("span").setText(" likes")),
  button
);