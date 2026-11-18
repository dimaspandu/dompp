let showPanel = false;

const appComponent = document.createComponent((rerender) => (
  document.createElement("div").setChildren(
    document.createElement("button")
      .setText(showPanel ? "Remove subtree" : "Add subtree")
      .setAttributes({ type: "button" })
      .setEvents({ click() { showPanel = !showPanel; rerender(); } }),
    showPanel
      ? document.createElement("div")
          .setAttributes({ class: "panel-box" })
          .setStyles({ padding: "12px", background: "#eef", borderRadius: "8px", marginTop: "8px" })
          .setChildren(
            document.createElement("p").setText("This subtree was added dynamically."),
            document.createElement("button")
              .setText("Remove")
              .setAttributes({ type: "button" })
              .setEvents({ click() { showPanel = false; rerender(); } })
          )
      : null
  )
));

const app = document.getElementById("app");
app.setChildren(appComponent);
