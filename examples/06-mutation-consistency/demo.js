const element = document.createElement("div").setAttributes({ class: "card" });

// Static value
element.setText("Hello");

// Reactive function - reads current state
element.setText(({ text }) => text + "!");

// Same pattern for styles
element.setStyles({ color: "#111111" });
element.setStyles(({ styles }) => ({ ...styles, fontSize: "20px" }));

// Same pattern for attributes
element.setAttributes({ title: "Original" });
element.setAttributes(({ attributes }) => ({ ...attributes, "data-updated": "true" }));

app.setChildren(element);