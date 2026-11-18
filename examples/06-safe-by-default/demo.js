const app = document.getElementById("app");

// Safe: events and styles via dedicated setters
const safe = document.createElement("a")
  .setText("Safe link")
  .setAttributes({ href: "https://example.com", target: "_blank" })
  .setStyles({ color: "blue", textDecoration: "underline" })
  .setEvents({ click(e) { e.preventDefault(); } });

app.setChildren(safe);

// These would throw (left commented):
// document.createElement("button").setAttributes({ onClick: "alert(1)" });
// document.createElement("iframe").setAttributes({ srcdoc: "<script>alert(1)</script>" });
// document.createElement("div").setAttributes({ style: "color:red" });
// document.createElement("a").setAttributes({ href: "javascript:alert(1)" });
