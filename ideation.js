// IDEATION: Big tree workload with localized state + optional reconcile
//
// Goal:
// - Demonstrate localized state updates that do not re-render the full tree.
// - Provide an explicit toggle for reconcile (matchById) on list updates.
// - Include a larger static subtree to simulate realistic DOM size.
//
// Sections:
// - Counter (localized state, no reconcile required).
// - Todo list (100 items initial, reconcile toggle).
// - Ordered list keyed (50 items initial, reconcile enabled).
// - Static grid (200 nodes, never changes).

// Load DOM++ core extensions first.
import "./src/index.js";
// Reconcile enables patch-style setters.
import { installDomppReconcile } from "./src/addons/reconcile.addon.js";
// Stateful enables callback-based bindings + local element state.
import { installDomppStateful } from "./src/reactive/stateful.js";

installDomppReconcile({ overrideSetters: true });
installDomppStateful();

const createTodo = (index) => ({ id: `todo-${index}`, text: `Todo ${index}` });
const createListItem = () => ({
  id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  message: "Hello, World!",
});

const app = document.getElementById("app");

const counterTitle = document.createElement("h2")
  .setState({ count: 0 })
  .setText(({ state }) => `Count: ${state.count}`);

const counterSection = document.createElement("section")
  .setAttributes({ id: "counter-section" })
  .setChildren(
    document.createElement("h3").setText("Counter (localized state)"),
    counterTitle,
    document.createElement("button")
      .setAttributes({ type: "button" })
      .setText("+1")
      .setEvents({
        click: () => counterTitle.setState(({ state }) => { state.count += 1; })
      })
  );

const reconcileToggleInput = document.createElement("input")
  .setAttributes({ type: "checkbox", checked: true, id: "reconcile-toggle" });

const reconcileToggle = document.createElement("label")
  .setChildren(
    reconcileToggleInput,
    document.createElement("span").setText(" Use matchById reconcile for list")
  );

const todoList = document.createElement("ul");
const todoHeading = document.createElement("h3").setText("Todos (reconcile optional)");
const addTodoBtn = document.createElement("button")
  .setAttributes({ type: "button" })
  .setText("Add Todo");

const todoSection = document.createElement("section")
  .setAttributes({ id: "todo-section" })
  .setState({
    todos: Array.from({ length: 100 }, (_, i) => createTodo(i)),
    useReconcile: true
  })
  .setChildren(({ state }) => {
    const items = state.todos.map((todo) => (
      document.createElement("li")
        .setAttributes({ id: todo.id })
        .setText(todo.text)
    ));

    if (state.useReconcile) {
      todoList.setChildren(...items, { matchById: true });
    } else {
      todoList.setChildren(...items);
    }

    return [todoHeading, reconcileToggle, todoList, addTodoBtn];
  });

reconcileToggleInput.setEvents({
  change: () => todoSection.setState(({ state }) => {
    state.useReconcile = reconcileToggleInput.checked;
  })
});

addTodoBtn.setEvents({
  click: () => todoSection.setState(({ state }) => {
    state.todos = [...state.todos, createTodo(state.todos.length)];
  })
});

const orderedList = document.createElement("ol");
const orderedHeading = document.createElement("h3").setText("Ordered List Keyed");
const refreshOrderedBtn = document.createElement("button")
  .setAttributes({ type: "button" })
  .setText("Refresh List");

const refreshOrderedList = ({ state }) => {
  const items = state.items.map((item) => ({
    ...item,
    message: item.message.replace(" (UPDATED!)", "")
  }));
  items.unshift(createListItem());
  if (items.length > 5 && items[1]) {
    items[1].message += " (UPDATED!)";
  }
  state.items = items;
};

const orderedListSection = document.createElement("section")
  .setAttributes({ id: "ordered-list-section" })
  .setState({
    items: Array.from({ length: 50 }, () => createListItem())
  })
  .setChildren(({ state: { items } }) => {
    const templates = items.map((item) => (
      document.createElement("li")
        .setAttributes({ id: item.id })
        .setText(item.message)
    ));
    orderedList.setChildren(...templates, { matchById: true });
    return [orderedHeading, orderedList, refreshOrderedBtn];
  });

refreshOrderedBtn.setEvents({
  click: () => orderedListSection.setState(refreshOrderedList)
});

const staticSection = document.createElement("section")
  .setAttributes({ id: "static-section" })
  .setChildren(
    document.createElement("h3").setText("Static Tree (200 nodes)"),
    document.createElement("div")
      .setChildren(
        ...Array.from({ length: 200 }, (_, i) => (
          document.createElement("div").setText(`Static ${i + 1}`)
        ))
      )
  );

app.setChildren(
  document.createElement("h1").setText("DOMPP Big Tree Ideation"),
  document.createElement("p").setText("Localized state + optional reconcile for list updates."),
  counterSection,
  todoSection,
  orderedListSection,
  staticSection
);
