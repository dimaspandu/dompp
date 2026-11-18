let likes = 0;
let count;

function Counter(props, ...children) {
  return document.createElement(
    document.getElementById("app"),
    props,
    ...children
  );
}

count = document.createElement("strong").setText(likes);

Counter(
  { className: "surface", styles: { backgroundColor: "#fffebb" } },
  document.createElement("div").setChildren(
    count,
    document.createElement("span").setText(" likes")
  ),
  document.createElement("button")
    .setText("Like")
    .setAttributes({ type: "button" })
    .setEvents({
      click() {
        likes++;
        count.setText(likes);
      },
    })
);
