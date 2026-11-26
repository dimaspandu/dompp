

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
    document.createElement("h3", null, "Reactive server messenger"),
    document.createElement("p", null, "This component adopts the pre-rendered container (same root node) and rerenders a keyed message list when you send a message."),
    document.createElement("ul", { "class": "server-list" }, [...messages].reverse().map((msg) => (
        document.createElement("li", { "key": msg.id }, msg.text)
      ))),
    document.createElement("div", { "class": "message-form" }, document.createElement("textarea", { "class": "message-input", "aria-label": "New message", "placeholder": "Write a message..." }), document.createElement("button", { "class": "action-button", "type": "button", "onClick": () => {
          const input = rootNode.querySelector("textarea");
          const text = input.value.trim();
          if (!text) return;
          messages.push({ id: nextId++, text });
          input.value = "";
          rerender();
        } }, "Send")),
    document.createElement("p", { "id": "messenger-status", "class": "status-note" }, "Adopted root node · messages: " + messages.length)
  )
);

// ComponentBuilder renders immediately and adopts the existing root.
