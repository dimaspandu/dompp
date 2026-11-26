/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

// Data embedded by the server alongside the rendered HTML.
const serverMessages = JSON.parse(
  document.getElementById("adoption-data").textContent
);

const listNode = document.getElementById("adoption-list");
const statusNode = document.getElementById("adoption-status");

// Adopt the existing <ul> node and reconcile a keyed descriptor tree against
// its current children instead of destroying and recreating them.
const listBuilder = document.hydrateElement(
  listNode,
  null,
  ...[...serverMessages]
    .reverse()
    .map((msg) => <li key={msg.id}>{msg.text}</li>)
);

const adopted = listBuilder.node === listNode;
statusNode.setText(
  "Adopted existing <ul>: " + adopted +
  " · reconciled items: " + listBuilder.struct.children.length +
  " · same DOM node kept: " + adopted
);
