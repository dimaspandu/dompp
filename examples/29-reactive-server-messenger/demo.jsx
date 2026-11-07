/** @jsx elementBuilder */

(function () {
  const dataFromServer = JSON.parse(
    document.getElementById("messenger-data").textContent
  );

  const messengerNode = document.getElementById("reactive-messenger");
  const statusNode = document.getElementById("reactive-messenger-status");

  let nextMessageId = Math.max(0, ...dataFromServer.map((m) => Number(m.id) || 0)) + 1;

  function sendReactiveMessage(rerender) {
    const textarea = messengerNode.querySelector("textarea");
    const text = textarea.value.trim();
    if (!text) return;

    const message = { id: nextMessageId++, text };
    dataFromServer.push(message);
    textarea.value = "";
    rerender();

    statusNode.textContent = `Added "${message.text}" at the top. Messages: ${dataFromServer.length}.`;
  }

  componentBuilder((rerender) =>
    elementBuilder(
      messengerNode,
      null,
      <ul>
        {[...dataFromServer].reverse().map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>,
      <textarea aria-label="New message"></textarea>,
      <button type="button" onClick={() => sendReactiveMessage(rerender)}>SEND</button>
    )
  ).render();

  statusNode.textContent = "Attached to server nodes; enter a message and select SEND.";
})();