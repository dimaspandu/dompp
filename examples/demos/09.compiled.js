

let nextId = 4;
let items = [
  { id: 1, label: "Alpha" },
  { id: 2, label: "Bravo" },
  { id: 3, label: "Charlie" },
];

const keyedFragment = document.createComponent((rerender) => (
  document.createElement("section", { "className": "demo-surface keyed-surface" }, document.createElement("h3", null, "Keyed list inside a fragment"), document.createElement("p", null, "The list items are produced inside a real fragment array via", " ", document.createElement("code", null, "document.createDocumentFragment(...)"), "(not the", " ", document.createElement("code", null, "<", "fragment", ">"), "wrapper element). The fragment inlines its children into the container while stable keys preserve item identity across updates."), document.createElement("div", { "className": "keyed-controls" }, document.createElement("button", { "class": "keyed-button", "type": "button", "onClick": () => {
          const id = nextId++;
          items = [...items, { id, label: `Item ${id}` }];
          rerender();
        } }, "APPEND"), document.createElement("button", { "class": "keyed-button", "type": "button", "onClick": () => {
          const id = nextId++;
          items = [{ id, label: `Item ${id}` }, ...items];
          rerender();
        } }, "PREPEND"), document.createElement("button", { "class": "keyed-button", "type": "button", "onClick": () => {
          items = [...items].reverse();
          rerender();
        } }, "REVERSE"), document.createElement("button", { "class": "keyed-button", "type": "button", "onClick": () => {
          if (items.length) {
            items = items.slice(1);
            rerender();
          }
        } }, "REMOVE FIRST")), document.createElement("div", { "className": "keyed-list" }, document.createDocumentFragment(
        ...items.map((item) => (
          document.createElement("div", { "key": item.id, "className": "keyed-item" }, item.label, "(key:", item.id, ")")
        ))
      )))
));

document.getElementById("keyed-fragment-app").setChildren(keyedFragment);
