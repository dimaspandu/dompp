import "../../src/index.js";

const app = document.getElementById("app");

const title = document.createElement("h2")
  .setText("Core setter callback demo")
  .setStyles({
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "12px",
  });

const meta = document.createElement("p")
  .setText("Click button to update via previous setter values.");

const logs = document.createElement("ul")
  .setStyles({ marginTop: "10px" });

const button = document.createElement("button")
  .setAttributes({
    type: "button",
    "data-clicks": "0",
    "aria-pressed": "false",
  })
  .setText("Run callback setters");

function appendLog(message) {
  logs.setChildren(({ childNodes }) => [
    ...childNodes,
    document.createElement("li").setText(message),
  ]);
}

button.setEvents(({ events }) => ({
  ...events,
  click() {
    const wasPressed = button.getAttribute("aria-pressed") === "true";

    title
      .setText(({ text }) =>
        text === "Core setter callback demo"
          ? "Core setter callback demo (updated)"
          : "Core setter callback demo"
      )
      .setStyles(({ styles }) => ({
        ...styles,
        backgroundColor: wasPressed ? "#1d4ed8" : "#059669",
      }));

    button
      .setAttributes(({ attributes }) => {
        const clicks = Number.parseInt(attributes["data-clicks"] ?? "0", 10) + 1;
        return {
          ...attributes,
          "data-clicks": String(clicks),
          "aria-pressed": attributes["aria-pressed"] === "true" ? "false" : "true",
        };
      })
      .setText(({ text }) =>
        text === "Run callback setters"
          ? "Run callback setters again"
          : "Run callback setters"
      )
      .setEvents(({ events: nextEvents }) => ({
        ...nextEvents,
        mouseenter() {
          meta.setText("Hover detected via setEvents callback.");
        },
        mouseleave() {
          meta.setText("Click button to update via previous setter values.");
        },
      }));

    appendLog(`click #${button.getAttribute("data-clicks")}`);
  },
}));

app.setChildren(
  title,
  button,
  meta,
  logs
);
