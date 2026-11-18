let count = 0;

const serverNode = document.getElementById("server-card");
const adopted = document.createElement(serverNode);

const card = document.createComponent((rerender) => (
  adopted.setChildren(
    document.createElement("h3").setText("Adopted title: " + count),
    document.createElement("p").setText("Adopted text"),
    document.createElement("button")
      .setText("Increment")
      .setAttributes({ type: "button" })
      .setEvents({ click() { count++; rerender(); } })
  )
));

const app = document.getElementById("app");
app.setChildren(card);
