let hasBeenUpdated = false;

const message = document.createElement("h1")
  .setStyles({
    backgroundColor: "#39bdff",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
  })
  .setText("Hello, World!");

const btnUpdate = document.createElement("button")
  .setAttributes({
    disabled: false,
    type: "button",
  })
  .setText("UPDATE")
  .setEvents({
    click() {
      if (hasBeenUpdated) return;

      // Core callback updater: ambil previous value dari setter context.
      message
        .setStyles(({ styles }) => ({
          ...styles,
          backgroundColor: "#05e66e",
        }))
        .setText(({ text }) => `${text} (updated)`);

      btnUpdate
        .setAttributes(({ attributes }) => ({
          ...attributes,
          disabled: true,
        }))
        .setText(({ text }) => `${text}D`);

      hasBeenUpdated = true;
    },
  });

document.getElementById("greetings").setChildren(
  message,
  btnUpdate
);
