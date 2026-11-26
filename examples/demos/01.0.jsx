let basicLikes = 0;
let basicCount;
let basicButton;

document.getElementById("basic-app-01.0")
  .setAttributes({ class: "demo-surface basic-surface" })
  .setStyles({ backgroundColor: "#fffebb" })
  .setChildren([
    document.createElement("div")
      .setAttributes({ class: "like-row" })
      .setChildren([
        (basicCount = document.createElement("strong").setText(basicLikes)),
        document.createElement("span").setText(" likes"),
      ]),
    (basicButton = document.createElement("button")
      .setAttributes({ class: "like-button", type: "button" })
      .setText("♥ Like")
      .setEvents({
        click() {
          basicLikes++;
          basicButton.setStyles({
            fontStyle: basicLikes % 2 !== 0 ? "italic" : "normal",
          });
          basicCount.setText(basicLikes);
          if (basicLikes === 10) {
            basicButton.setAttributes({ disabled: true });
          }
        },
      })),
  ]);
