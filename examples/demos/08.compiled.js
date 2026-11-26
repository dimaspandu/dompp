

let showPanel = false;
let renderCount = 0;

// A component may return an array. When rendered through createComponent,
// each slot is reconciled on rerender (a slot can become null and be removed).
function ArrayChildList({ rerender }) {
  return [
    document.createElement("div", { "key": "a", "className": "fragment-child fragment-child-a" }, "Array child A"),
    document.createElement("div", { "key": "b", "className": "fragment-child fragment-child-b" }, "Array child B (renders:", renderCount, ")"),
    document.createElement("button", { "key": "action", "class": "action-button", "type": "button", "onClick": () => rerender(() => renderCount++) }, "Rerender array slots"),
  ];
}

// Fragment-producing APIs (<>...</>, elementBuilder.fragment,
// document.createDocumentFragment(...)) return a flat child array that is
// inlined into the parent. As a component result it is reconciled per slot.
const inlineFragmentPanel = document.createComponent((rerender) =>
  document.createDocumentFragment(
    document.createElement("strong", null, "Inline fragment array"),
    document.createElement("p", null, "Time:", new Date().toLocaleTimeString()),
    document.createElement("button", { "class": "action-button", "type": "button", "onClick": () => rerender(() => (showPanel = true)) }, "Open panel"),
    showPanel ? (
      document.createElement("div", { "className": "conditional-panel", "role": "dialog", "aria-label": "Panel", "style": { marginTop: "10px" } }, document.createElement("h4", null, "Conditional slot"), document.createElement("p", null, "This slot is removed when it becomes null."), document.createElement("button", { "class": "action-button", "type": "button", "onClick": () => rerender(() => (showPanel = false)) }, "Close"))
    ) : null
  )
);

// The root view is a component so child array components can request rerenders.
const view = document.createComponent((rerender) => (
  document.createElement("section", { "className": "demo-surface fragment-surface" }, document.createElement("h3", null, "Fragments and arrays"), document.createElement("p", null, "Fragment-producing forms (", document.createElement("code", null, "<>", "...", "</>"), ",", " ", document.createElement("code", null, "elementBuilder.fragment"), ",", " ", document.createElement("code", null, "document.createDocumentFragment(...)"), ") return a flat child array that is inlined (no wrapper node). Use", " ", document.createElement("code", null, "<", "fragment", ">"), "or", " ", document.createElement("code", null, "document.createElement(\"fragment\")"), "for an explicit wrapper element."), document.createElement("h4", null, "<", "fragment", ">", "wrapper element"), document.createElement("p", null, document.createElement("code", null, "<", "fragment", ">"), "creates a real wrapper element node that owns its children."), document.createElement("div", { "className": "fragment-box" }, document.createElement("strong", null, "Parent"), document.createElement("fragment", null, document.createElement("div", { "className": "fragment-child fragment-child-a" }, "Wrapped child one"), document.createElement("div", { "className": "fragment-child fragment-child-b" }, "Wrapped child two"))), document.createElement("h4", null, "JSX fragment", "<", ">", "...", "<", "/", ">", "(inlined array)"), document.createElement("p", null, "Children are contributed directly to the parent with no wrapper."), document.createElement("div", { "className": "fragment-box" }, document.createElement("strong", null, "Parent label"), document.createDocumentFragment(document.createElement("div", { "className": "fragment-child fragment-child-a" }, "Inlined child one"), document.createElement("div", { "className": "fragment-child fragment-child-b" }, "Inlined child two"))), document.createElement("h4", null, "Array-returning component (per-slot rerender)"), document.createElement("p", null, "The component returns an array; each slot is compared and updated on rerender."), document.createElement("div", { "className": "fragment-box" }, document.createElement("strong", null, "Parent label"), document.createElement(ArrayChildList, { "rerender": rerender })), document.createElement("h4", null, "document.createDocumentFragment(...) child arrays"), document.createElement("p", null, "Returns/updates a flat child array.", document.createElement("code", null, ".setChildren"), "and", " ", document.createElement("code", null, ".setText"), "mutate the array in place."), document.createElement("div", { "className": "fragment-box" }, document.createDocumentFragment(
        document.createElement("strong", null, "Static fragment array"),
        document.createElement("p", null, "Two nodes inlined with no wrapper.")
      ), document.createElement("h5", { "style": { margin: "0.5rem 0" } }, document.createDocumentFragment("Text-only fragment array")), document.createDocumentFragment()
        .setChildren([
          document.createElement("em", { "key": "set-children" }, "Built via .setChildren([...])"),
        ]), document.createElement("div", { "style": { marginTop: "0.5rem" } }, inlineFragmentPanel)))
));

document.getElementById("fragment-array-app").setChildren(view);
