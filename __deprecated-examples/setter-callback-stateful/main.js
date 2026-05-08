import "../../src/index.js";
import { installDomppStateful } from "../../src/reactive/stateful.js";

installDomppStateful();

const app = document.getElementById("app");

const panel = document.createElement("div")
  .setAttributes({
    role: "status",
    "aria-live": "polite",
  })
  .setStyles({
    border: "2px solid #1d4ed8",
    backgroundColor: "#eff6ff",
    borderRadius: "10px",
    padding: "12px",
    marginBottom: "12px",
  })
  .setState({
    armed: false,
    count: 0,
  });

panel
  .setStyles(({ state, styles }) => ({
    ...styles,
    borderColor: state.armed ? "#059669" : "#1d4ed8",
    backgroundColor: state.armed ? "#ecfdf5" : "#eff6ff",
  }))
  .setChildren(({ state, childNodes }) => [
    document.createElement("strong").setText(
      `${state.armed ? "ARMED" : "IDLE"}`
    ),
    document.createElement("p").setText(
      `updates: ${state.count}, previous childNodes: ${childNodes.length}`
    ),
  ]);

const button = document.createElement("button")
  .setAttributes({
    type: "button",
    "aria-pressed": "false",
  })
  .setState({
    armed: false,
    count: 0,
  });

button
  .setText(({ state, text }) => {
    const previousLabel = text || "none";
    return `Toggle (${state.count}) - prev label: ${previousLabel}`;
  })
  .setAttributes(({ state, attributes }) => ({
    ...attributes,
    "aria-pressed": String(state.armed),
    "data-count": String(state.count),
  }))
  .setEvents(({ events, setState }) => ({
    ...events,
    click() {
      setState(({ state }) => {
        state.armed = !state.armed;
        state.count += 1;
      });

      panel.setState(({ state }) => {
        state.armed = !state.armed;
        state.count += 1;
      });
    },
  }));

app.setChildren(
  document.createElement("h2").setText("Stateful setter callback demo"),
  panel,
  button
);
