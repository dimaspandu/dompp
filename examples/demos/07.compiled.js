

let nextId = 4;
let items = [
  { id: 1, label: "Alpha", tag: "article" },
  { id: 2, label: "Bravo", tag: "article" },
  { id: 3, label: "Charlie", tag: "article" },
];

const keyedList = document.createComponent((rerender) => (
  document.createElement("section", { "className": "demo-surface keyed-surface" }, document.createElement("h3", null, "Keyed child reconciliation"), document.createElement("p", null, "Stable keys preserve item nodes when the list order changes. Changing an item's tag intentionally replaces its node."), document.createElement("div", { "className": "keyed-controls" }, document.createElement("button", { "class": "keyed-button", "type": "button", "onClick": () => {
          const id = nextId++;
          items = [...items, { id, label: `Item ${id}`, tag: "article" }];
          rerender();
        } }, "APPEND"), document.createElement("button", { "class": "keyed-button", "type": "button", "onClick": () => {
          const id = nextId++;
          items = [{ id, label: `Item ${id}`, tag: "article" }, ...items];
          rerender();
        } }, "PREPEND"), document.createElement("button", { "class": "keyed-button", "type": "button", "onClick": () => {
          items = [...items].reverse();
          rerender();
        } }, "REVERSE"), document.createElement("button", { "class": "keyed-button", "type": "button", "onClick": () => {
          items = items.slice(1);
          rerender();
        } }, "REMOVE FIRST"), document.createElement("button", { "class": "keyed-button", "type": "button", "onClick": () => {
          if (items.length) {
            const [first, ...remaining] = items;
            items = [{
              ...first,
              tag: first.tag === "article" ? "p" : "article",
            }, ...remaining];
            rerender();
          }
        } }, "CHANGE FIRST TAG")), document.createElement("div", { "className": "keyed-list" }, items.map((item) => {
        const Tag = item.tag;
        return (
          document.createElement(Tag, { "key": item.id, "className": "keyed-item" }, item.label, "(key:", item.id, ")")
        );
      })))
));

document.getElementById("keyed-list-app").setChildren(
  keyedList,
);
