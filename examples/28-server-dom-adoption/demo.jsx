/** @jsx elementBuilder */

(function () {
  const dataFromServer = JSON.parse(
    document.getElementById("messenger-data").textContent
  );
  const messengerNode = document.getElementById("messenger");
  const messengerBuilder = elementBuilder(
    messengerNode,
    null,
    <ul>{[...dataFromServer].reverse().map((message) => <li key={message.id}>{message.text}</li>)}</ul>
  );
  const messageListBuilder = messengerBuilder.struct.children.find((child) => child && child.struct && child.struct.tag === "ul");
  document.getElementById("messenger-status").textContent =
    `Adopted existing root: ${messengerBuilder.node === messengerNode}. Server list items in struct: ${messageListBuilder?.struct.children.length ?? 0}.`;
})();