/** @jsx document.createElement */
/** @jsxFrag document.createDocumentFragment */

// Data embedded by the server alongside the rendered HTML.
const messages = JSON.parse(
  document.getElementById("messenger-data").textContent
);
let nextId = Math.max(...messages.map((m) => m.id)) + 1;

const rootNode = document.getElementById("messenger-app");

const messenger = document.createComponent((rerender) =>
  document.hydrateElement(
    rootNode,
    { class: "demo-surface messenger-surface" },
    <h3>Reactive server messenger</h3>,
    <p>
      This component adopts the pre-rendered container (same root node) and
      rerenders a keyed message list when you send a message.
    </p>,
    <ul class="server-list">
      {[...messages].reverse().map((msg) => (
        <li key={msg.id}>{msg.text}</li>
      ))}
    </ul>,
    <div class="message-form">
      <textarea
        class="message-input"
        aria-label="New message"
        placeholder="Write a message..."
      ></textarea>
      <button
        class="action-button"
        type="button"
        onClick={() => {
          const input = rootNode.querySelector("textarea");
          const text = input.value.trim();
          if (!text) return;
          messages.push({ id: nextId++, text });
          input.value = "";
          rerender();
        }}
      >
        Send
      </button>
    </div>,
    <p id="messenger-status" class="status-note">
      {"Adopted root node · messages: " + messages.length}
    </p>
  )
);

// ComponentBuilder renders immediately and adopts the existing root.
