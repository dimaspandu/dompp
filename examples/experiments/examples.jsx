/** @jsx elementBuilder */
import { ElementBuilder, elementBuilder, componentBuilder } from "./engine.js";
import LocalStatefulInStatelessExample from "./LocalStatefulInStatelessExample.jsx";

/*
 * This page is an implementation notebook for the JSX builder experiments.
 * The examples at the end share one host and focus on creation, reconciliation,
 * and component updates.
 */
const app = document.getElementById("app");


/*
 * Example 1: update text and styles directly through ElementBuilder methods,
 * without rebuilding the complete component.
 */
function CounterElement() {
  let count = 0;
  let countEl;
  let buttonEl;

  return (
    <div className="card">
      <h3>01 · Direct element updates</h3>
      <p>Update a node with ElementBuilder setters without rerendering its parent.</p>
      {countEl = <p className="counter-value" style={{
        backgroundColor: count % 2 === 0 ? "purple" : "fuchsia",
        color: "white",
      }}>{count}</p>}
      {buttonEl = <button
        class="secondary"
        onClick={() => {
          count += 1;
          countEl
            .setStyles({
              backgroundColor: count % 2 === 0 ? "purple" : "fuchsia",
              color: "white",
            })
            .setText(count);
          if (count === 10) {
            buttonEl.setAttributes({ disabled: true });
          }
        }}
      >UPDATE</button>}
      <hr />
      <>Hello, I'm just a Fragment!</>
    </div>
  );
}

// Shared state for the ComponentBuilder callback example.
let count = 0;

/*
 * Example 2: rerender(callback) combines a state update with a view update.
 * The callback runs first, so the builder reads the new count.
 */
const rerenderCallbackCounter = componentBuilder((rerender) => {
  return (
    <div
      className="card"
      style={{
        backgroundColor: count % 2 === 0 ? "purple" : "fuchsia",
        color: "white",
      }}
    >
      <h3 styles={{ color: "white" }}>02 · ComponentBuilder rerender</h3>
      <p className="counter-value" styles={{ color: "white" }}>{count}</p>
      <p styles={{ color: "white" }}>rerender(callback) runs the state update before rebuilding this view.</p>
      <button
        class="secondary"
        disabled={count === 10}
        onClick={() => {
          rerender(() => {
            count += 1;
          });
        }}
      >UPDATE</button>
    </div>
  );
});

/*
 * Example 3: the Model owns the value and has no dependency on the View or DOM.
 */
function createCounterModel(initialCount = 0) {
  let count = initialCount;

  return {
    get count() {
      return count;
    },

    setCount(value) {
      count = value;
    },
  };
}

/*
 * The ViewModel exposes Model data and actions, then notifies its subscribers
 * when data changes. The View subscribes with its rerender method.
 */
function createCounterViewModel(model) {
  const listeners = new Set();

  return {
    get count() {
      return model.count;
    },

    set count(value) {
      model.setCount(value);
      this.notifyListener();
    },

    increment() {
      this.count = model.count + 1;
    },

    addListener(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    notifyListener() {
      listeners.forEach((listener) => listener(this));
    },
  };
}

// The View reads ViewModel state and sends user actions to ViewModel methods.
function MVVMExample() {
  const model = createCounterModel();
  const viewModel = createCounterViewModel(model);
  let view;

  view = componentBuilder(() => (
    <section className="card">
      <h3>03 · MVVM: View / ViewModel / Model</h3>
      <p>View reads the ViewModel getter: {viewModel.count}</p>
      <p>The View only calls ViewModel actions. The ViewModel reads and updates its Model, then notifies the View to rerender.</p>
      <button
        type="button"
        onClick={() => viewModel.increment()}
      >Increment through ViewModel</button>
    </section>
  ));

  viewModel.addListener(() => view.rerender());
  return view.render();
}

/*
 * Example 4: conditionally add or remove a dialog during rerender.
 * Returning null means there is no dialog node in the current virtual tree.
 */
function Validator() {
  let confirming = false;

  return componentBuilder(rerender => {
    return (
      <div className="card">
        <h3>04 · Conditional child reconciliation</h3>
        <p>The dialog is added or removed by rerendering only this component.</p>
        <button
          onClick={() => {
            confirming = true;
            rerender();
          }}
        >OPEN</button>
        {confirming ? (
          <dialog styles={{
            bottom: 0,
            display: "block",
            height: "100vh",
            left: 0,
            position: "fixed",
            right: 0,
            top: 0,
            width: "100%",
          }}>
            <h4>Are you sure?</h4>
            <button
              class="secondary"
              onClick={() => {
                confirming = false;
                rerender();
              }}
            >CLOSE</button>
          </dialog>
        ) : null}
      </div>
    );
  })
  .render();
}

/*
 * Example 5: stable keys preserve item nodes during append, prepend, reorder,
 * and removal. Changing an element tag intentionally replaces its node.
 */
function KeyedListExample() {
  let nextId = 4;
  let items = [
    { id: 1, label: "Alpha", tag: "article" },
    { id: 2, label: "Bravo", tag: "article" },
    { id: 3, label: "Charlie", tag: "article" },
  ];

  return componentBuilder((rerender) => (
    <section className="card">
      <h3>05 · Keyed child reconciliation</h3>
      <p>Stable keys preserve item nodes when the list order changes. Changing an item's tag replaces its node.</p>
      <div>
        <button type="button" onClick={() => {
          const id = nextId++;
          items = [...items, { id, label: `Item ${id}`, tag: "article" }];
          rerender();
        }}>APPEND</button>
        <button type="button" onClick={() => {
          const id = nextId++;
          items = [{ id, label: `Item ${id}`, tag: "article" }, ...items];
          rerender();
        }}>PREPEND</button>
        <button type="button" onClick={() => {
          items = [...items].reverse();
          rerender();
        }}>REVERSE</button>
        <button type="button" onClick={() => {
          items = items.slice(1);
          rerender();
        }}>REMOVE FIRST</button>
        <button type="button" onClick={() => {
          if (items.length) {
            const [first, ...remaining] = items;
            items = [{
              ...first,
              tag: first.tag === "article" ? "p" : "article",
            }, ...remaining];
            rerender();
          }
        }}>CHANGE FIRST TAG</button>
      </div>
      <div className="keyed-list">
        {items.map((item) => elementBuilder(
          item.tag,
          {
            key: item.id,
            styles: {
              border: "1px solid #ccc",
              margin: "6px 0",
              padding: "8px",
            },
          },
          `${item.label} (key: ${item.id})`
        ))}
      </div>
    </section>
  )).render();
}

/*
 * Example 6a: an array-returning component contributes sibling nodes directly
 * to its parent without creating an extra wrapper.
 */
function ArrayChildComponent() {
  return [
    <div key="array-first" styles={{ padding: "8px", backgroundColor: "#eef6ff" }}>
      Array child one
    </div>,
    <div key="array-second" styles={{ padding: "8px", backgroundColor: "#f1f8ed" }}>
      Array child two
    </div>,
    <button key="array-action" type="button">Array child button</button>,
  ];
}

/*
 * Example 6b: a fragment is one literal wrapper node; an array component
 * contributes each returned node directly to the parent child list.
 */
function FragmentAndArrayExample() {
  return (
    <section className="card">
      <h3>06 · Fragments and array components</h3>
      <h4>Literal fragment wrapper</h4>
      <p>
        The bordered parent has two direct children: its label and one literal fragment node. That fragment node owns the two nested div children.
      </p>
      <div styles={{ border: "1px solid #ddd", padding: "10px" }}>
        <strong>Fragment parent</strong>
        <>
          <div styles={{ padding: "6px", backgroundColor: "#eef6ff" }}>
            Nested fragment child one
          </div>
          <div styles={{ padding: "6px", backgroundColor: "#f1f8ed" }}>
            Nested fragment child two
          </div>
        </>
      </div>

      <h4>Array-returning component</h4>
      <p>
        The component returns three nodes. setChildren flattens that array, so the bordered parent has five direct children: its label, its paragraph, and the three returned nodes.
      </p>
      <div styles={{ border: "1px solid #ddd", padding: "10px" }}>
        <strong>Array parent heading</strong>
        <p>Array parent paragraph</p>
        <ArrayChildComponent />
      </div>
    </section>
  );
}

/*
 * Example 7: pass the server-created root directly to elementBuilder. The
 * builder adopts its existing DOM tree and synchronizes the supplied list.
 */
(function() {
  const dataFromServer = JSON.parse(
    document.getElementById("messenger-data").textContent
  );

  const messengerNode = document.getElementById("messenger");

  const messengerBuilder = elementBuilder(
    messengerNode,
    null,
    <ul>
      {[...dataFromServer].reverse().map((message) => <li key={message.id}>{message.text}</li>)}
    </ul>
  );

  const messageListBuilder = messengerBuilder.struct.children.find(
    (child) =>
      child instanceof ElementBuilder &&
      child.struct.tag === "ul"
  );
  document.getElementById("messenger-status").textContent =
    `Result is an ElementBuilder: ${messengerBuilder instanceof ElementBuilder}. ` +
    `Existing root node reused: ${messengerBuilder.node === messengerNode}. ` +
    `Server list items represented in the struct: ${messageListBuilder.struct.children.length}.`;
})();

/*
 * Example 8: use the same direct node adoption inside ComponentBuilder. The
 * data array stays chronological; reversing it displays the newest message first.
 */
(function() {
  const dataFromServer = JSON.parse(
    document.getElementById("messenger-data").textContent
  );

  const reactiveMessengerStatus = elementBuilder(
    document.getElementById("reactive-messenger-status"),
    null,
    `Attached to server nodes; enter a message and select SEND.`
  );
  
  let nextMessageId = Math.max(
    0,
    ...dataFromServer.map((message) => Number(message.id) || 0)
  ) + 1;

  function sendReactiveMessage(rerender) {
    const textarea = messengerNode.querySelector("textarea");
    const text = textarea.value.trim();
    if (!text) return;

    const message = { id: nextMessageId++, text };
    dataFromServer.push(message);
    textarea.value = "";

    rerender();

    reactiveMessengerStatus.setText(
      `Added "${message.text}" at the top. Messages: ${dataFromServer.length}.`
    );
  }

  const messengerNode = document.getElementById("reactive-messenger");

  const messengerBuilder = componentBuilder(rerender =>
    elementBuilder(
      messengerNode,
      null,
      <ul>
        {[...dataFromServer].reverse().map((message) => <li key={message.id}>{message.text}</li>)}
      </ul>,
      <textarea aria-label="New message"></textarea>,
      <button
        type="button"
        onClick={() => sendReactiveMessage(rerender)}
      >SEND</button>,
    )
  )
  .render();

})();

/*
 * Example 9: BigView adopts an existing root once. Static parts
 * use their ElementBuilder setters, while stateful sections keep independent
 * ComponentBuilder instances that can update one another.
 */
function BigView(props, ...children) {
  return elementBuilder(
    document.getElementById("big-view"),
    props,
    ...children
  );
}

let bigViewTitle;
let bigViewMenu;
let bigViewComponentA;
let bigViewComponentB;
let bigViewCountA = 0;
let bigViewCountB = 0;
let bigViewAlternateMenu = false;

bigViewComponentA = componentBuilder((rerender) => (
  <article styles={{ border: "1px solid #cbd5e1", padding: "10px" }}>
    <h4>Component A</h4>
    <p>Local count: {bigViewCountA}</p>
    <button type="button" onClick={() => rerender(() => { bigViewCountA += 1; })}>
      Update A only
    </button>
    <button type="button" onClick={() => {
      rerender(() => { bigViewCountA += 1; });
      bigViewComponentB.rerender(() => { bigViewCountB += 1; });
    }}>
      Update A and B
    </button>
  </article>
));

bigViewComponentB = componentBuilder((rerender) => (
  <article styles={{ border: "1px solid #cbd5e1", padding: "10px" }}>
    <h4>Component B</h4>
    <p>Local count: {bigViewCountB}</p>
    <button type="button" onClick={() => rerender(() => { bigViewCountB += 1; })}>
      Update B only
    </button>
    <button type="button" onClick={() => {
      rerender(() => { bigViewCountB += 1; });
      bigViewComponentA.rerender(() => { bigViewCountA += 1; });
    }}>
      Update B and A
    </button>
  </article>
));

const bigViewComponentABuilder = bigViewComponentA.render();
const bigViewComponentBBuilder = bigViewComponentB.render();

const bigView = (
  <BigView>
    {bigViewTitle = <h3>Independent updates inside a Big View</h3>}
    <p>
      The outer section is not a ComponentBuilder. Each control updates only
      the ElementBuilder or stateful component it targets.
    </p>
    {bigViewComponentABuilder}
    <summary>Component A and B can rerender separately or together.</summary>
    {bigViewComponentBBuilder}
    <div styles={{ border: "1px dashed #94a3b8", marginTop: "10px", padding: "10px" }}>
      <strong>A directly managed menu</strong>
      {bigViewMenu = (
        <ul aria-label="Big view menu">
          <li key="overview">Overview</li>
          <li key="settings">Settings</li>
        </ul>
      )}
      <button type="button" onClick={() => {
        bigViewAlternateMenu = !bigViewAlternateMenu;
        const labels = bigViewAlternateMenu
          ? [{ id: "profile", label: "Profile" }, { id: "help", label: "Help" }]
          : [{ id: "overview", label: "Overview" }, { id: "settings", label: "Settings" }];

        bigViewMenu
          .setStyles({ listStyle: "square", paddingLeft: "28px" })
          .setAttributes({ "aria-label": bigViewAlternateMenu ? "Secondary menu" : "Big view menu" })
          .setChildren(labels.map((item) => <li key={item.id}>{item.label}</li>));
      }}>
        Update menu only
      </button>
    </div>
    <dialog open styles={{ margin: "10px 0 0", maxWidth: "100%", padding: "10px", position: "static" }}>
      <button type="button" onClick={() => bigViewTitle.setText("Title updated directly") }>
        Update title only
      </button>
    </dialog>
  </BigView>
);

/*
 * Example 10, Model: owns project data and domain updates. It has no DOM or
 * rendering dependency, so it can be reused independently of this View.
 */
function createProjectModel() {
  let title = "Project dashboard";
  let nextTaskId = 4;
  const tasks = [
    { id: 1, label: "Review the design", complete: true },
    { id: 2, label: "Implement the view", complete: false },
    { id: 3, label: "Check the interaction", complete: false },
  ];

  return {
    getSnapshot() {
      return {
        title,
        tasks: tasks.map((task) => ({ ...task })),
      };
    },

    setTitle(nextTitle) {
      title = nextTitle;
    },

    addTask() {
      const task = {
        id: nextTaskId++,
        label: `New project task ${nextTaskId - 1}`,
        complete: false,
      };
      tasks.push(task);
      return task;
    },

    toggleTask(taskId) {
      const task = tasks.find((item) => item.id === taskId);
      if (task) {
        task.complete = !task.complete;
      }
    },
  };
}

/*
 * Example 10, ViewModel: coordinates Model operations and notifies interested
 * View sections with a small topic name instead of exposing mutable data.
 */
function createProjectViewModel(model) {
  const listeners = new Set();

  function notify(topic) {
    listeners.forEach((listener) => listener(topic));
  }

  return {
    getSnapshot() {
      return model.getSnapshot();
    },

    renameTitle() {
      const currentTitle = model.getSnapshot().title;
      model.setTitle(
        currentTitle === "Project dashboard"
          ? "Project dashboard: reviewed"
          : "Project dashboard"
      );
      notify("title");
    },

    addTask() {
      model.addTask();
      notify("tasks");
    },

    toggleTask(taskId) {
      model.toggleTask(taskId);
      notify("tasks");
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/*
 * Example 10, View sections: each section owns a ComponentBuilder and
 * subscribes only to the ViewModel topic that affects its displayed data.
 */
function createBigViewHeader(viewModel) {
  const component = componentBuilder(() => {
    const { title } = viewModel.getSnapshot();
    return (
      <header styles={{ alignItems: "center", display: "flex", gap: "12px" }}>
        <h3>{title}</h3>
        <button type="button" onClick={() => viewModel.renameTitle()}>
          Rename project
        </button>
      </header>
    );
  });

  const unsubscribe = viewModel.subscribe((topic) => {
    if (topic === "title") component.rerender();
  });

  return { builder: component.render(), dispose: unsubscribe };
}

function createBigViewSummary(viewModel) {
  const component = componentBuilder(() => {
    const tasks = viewModel.getSnapshot().tasks;
    const completeCount = tasks.filter((task) => task.complete).length;
    return (
      <p>
        {completeCount} of {tasks.length} project tasks complete.
      </p>
    );
  });

  const unsubscribe = viewModel.subscribe((topic) => {
    if (topic === "tasks") component.rerender();
  });

  return { builder: component.render(), dispose: unsubscribe };
}

function createBigViewTaskList(viewModel) {
  const component = componentBuilder(() => (
    <ul>
      {viewModel.getSnapshot().tasks.map((task) => (
        <li key={task.id}>
          <span>{task.complete ? "[done]" : "[todo]"} {task.label}</span>
          <button
            type="button"
            aria-pressed={task.complete}
            onClick={() => viewModel.toggleTask(task.id)}
          >
            {task.complete ? "Reopen" : "Complete"}
          </button>
        </li>
      ))}
    </ul>
  ));

  const unsubscribe = viewModel.subscribe((topic) => {
    if (topic === "tasks") component.rerender();
  });

  return { builder: component.render(), dispose: unsubscribe };
}

/*
 * Example 10, View: composes the Model, ViewModel, and focused View sections.
 * The root is stable; notifications rerender only the interested sections.
 */
function MaintainableBigView() {
  const model = createProjectModel();
  const viewModel = createProjectViewModel(model);
  const header = createBigViewHeader(viewModel);
  const summary = createBigViewSummary(viewModel);
  const taskList = createBigViewTaskList(viewModel);

  const root = elementBuilder(
    document.getElementById("big-view-mvvm"),
    null,
    <p>
      Model owns the task data. ViewModel handles commands and publishes
      updates. These View sections subscribe only to the topics they display.
    </p>,
    header.builder,
    summary.builder,
    <button type="button" onClick={() => viewModel.addTask()}>
      Add task
    </button>,
    taskList.builder,
  );

  return {
    root,
    model,
    viewModel,
    dispose() {
      header.dispose();
      summary.dispose();
      taskList.dispose();
    },
  };
}

document.maintainableBigView = MaintainableBigView();

/*
 * Example 11: the builder rejects active attribute sinks and renders strings
 * as text. Attribute checks are a boundary, not a general HTML sanitizer.
 */
function getBlockedAttributeResult(label, operation) {
  try {
    operation();
    return `${label}: unexpectedly accepted`;
  } catch (error) {
    return `${label}: blocked (${error.message})`;
  }
}

function SecurityBoundaryExample() {
  const sampleUserText = "<img src=x onerror=alert(1)>";
  const checks = [
    getBlockedAttributeResult("Inline event attribute", () =>
      new ElementBuilder("button").setAttributes({ onclick: "alert(1)" })
    ),
    getBlockedAttributeResult("JavaScript URL", () =>
      elementBuilder("a", { href: "javascript:alert(1)" }, "Unsafe link")
    ),
    getBlockedAttributeResult("Data URL", () =>
      elementBuilder("img", { src: "data:text/html,unsafe" })
    ),
    getBlockedAttributeResult("srcdoc", () =>
      new ElementBuilder("iframe").setAttributes({ srcdoc: "<script>alert(1)</script>" })
    ),
    getBlockedAttributeResult("Raw style attribute", () =>
      new ElementBuilder("div").setAttributes({ style: "color: red" })
    ),
    getBlockedAttributeResult("Script element", () =>
      new ElementBuilder("script")
    ),
  ];

  let textPreview;

  return (
    <div>
      <p>These unsafe builder operations are rejected before attributes reach the DOM:</p>
      <ul>
        {checks.map((result, index) => <li key={index}>{result}</li>)}
      </ul>
      <h4>Untrusted content stays text</h4>
      {textPreview = <pre>{sampleUserText}</pre>}
      <button
        type="button"
        onClick={() => textPreview.setText(sampleUserText)}
      >Render the sample string as text</button>
      <p>
        Event handlers must be functions passed through event props or setEvents().
        Keep tag names, HTTPS destinations, and CSS values under application control.
      </p>
      <button
        type="button"
        onClick={() => textPreview.setText("A trusted function handler ran.")}
      >Run a function event handler</button>
    </div>
  );
}

elementBuilder(
  document.getElementById("security-example"),
  null,
  <SecurityBoundaryExample />
);

/*
 * Example 14: local stateful inside stateless view (ViewModel-driven).
 * The stateless createView builds a container and embeds a componentBuilder
 * instance. The ViewModel notifies listeners; the view's listener calls
 * stateful.rerender() to update only the inner subtree.
 */
LocalStatefulInStatelessExample();

/*
 * Mount all examples into one host. componentBuilder.render() returns its
 * ElementBuilder, which the host reconciles with the other JSX children.
 */
elementBuilder(
  app,
  null,
  <CounterElement />,
  <hr />,
  // render() returns the initial ElementBuilder.
  rerenderCallbackCounter.render(),
  <MVVMExample />,
  <Validator />,
  <KeyedListExample />,
  <FragmentAndArrayExample />,
);

// Expose the builder APIs for quick experiments in the browser DevTools console.
document.elementBuilder = elementBuilder;
document.componentBuilder = componentBuilder;

/*
 * Example 12: elementBuilder outlet with reset()
 * Demonstrates using elementBuilder on a shared outlet with .reset() to ensure
 * a clean slate on each route change.
 */
(function RouterOutletResetExample() {
  function Home() {
    return (
      <section className="page page--home">
        <h4>Home</h4>
        <p>Home route content with elementBuilder + reset().</p>
        <div className="home-only" data-route="home">This div has class="home-only" and data-route="home"</div>
      </section>
    );
  }

  function About() {
    return (
      <section className="page page--about">
        <h4>About</h4>
        <p>About route content (no home-only class or data-route).</p>
        <div className="about-only" data-route="about">This div has class="about-only" and data-route="about"</div>
      </section>
    );
  }

  const host = document.getElementById("router-outlet-reset-host");
  const status = document.getElementById("router-outlet-reset-status");
  if (!host || !status) return;

  function describeHost() {
    const attrs = Array.from(host.attributes).map(a => `${a.name}="${a.value}"`).join(" ") || "(none)";
    const style = host.getAttribute("style") || "(none)";
    const children = Array.from(host.children).map(c => `${c.tagName.toLowerCase()}${c.className ? "." + c.className.split(" ").join(".") : ""}${c.id ? "#" + c.id : ""}`).join(", ") || "(none)";
    return `attrs: [${attrs}]; style: "${style}"; children: [${children}]`;
  }

  function renderReset(path) {
    const view = path === "/about" ? <About /> : <Home />;
    elementBuilder(host, { class: path === "/about" ? "page page--about" : "page page--home", id: "router-outlet-reset-host" })
      .reset()
      .setChildren(view);
    status.textContent = `elementBuilder + reset() → ${path}: ${describeHost()}`;
  }

  elementBuilder(
    document.getElementById("router-outlet-reset-controls"),
    null,
    <div>
      <button type="button" onClick={() => renderReset("/")}>Route "/" (Home)</button>
      <button type="button" onClick={() => renderReset("/about")}>Route "/about" (About)</button>
    </div>
  );

  renderReset("/");
})();

/*
 * Example 13: componentBuilder outlet with rerender()
 * Demonstrates using componentBuilder for route transitions where _patchFrom
 * replaces attributes, styles, and children entirely.
 */
(function RouterOutletComponentExample() {
  let currentRoute = "/";

  function Home() {
    return (
      <section className="page page--home">
        <h4>Home</h4>
        <p>Home route content via componentBuilder.</p>
        <div className="home-only" data-route="home">This div has class="home-only" and data-route="home"</div>
      </section>
    );
  }

  function About() {
    return (
      <section className="page page--about">
        <h4>About</h4>
        <p>About route content (no home-only class or data-route).</p>
        <div className="about-only" data-route="about">This div has class="about-only" and data-route="about"</div>
      </section>
    );
  }

  const host = document.getElementById("router-outlet-component-host");
  const status = document.getElementById("router-outlet-component-status");
  if (!host || !status) return;

  function describeHost() {
    const attrs = Array.from(host.attributes).map(a => `${a.name}="${a.value}"`).join(" ") || "(none)";
    const style = host.getAttribute("style") || "(none)";
    const children = Array.from(host.children).map(c => `${c.tagName.toLowerCase()}${c.className ? "." + c.className.split(" ").join(".") : ""}${c.id ? "#" + c.id : ""}`).join(", ") || "(none)";
    return `attrs: [${attrs}]; style: "${style}"; children: [${children}]`;
  }

  const routerComponent = componentBuilder((rerender) => {
    const view = currentRoute === "/about" ? <About /> : <Home />;
    return elementBuilder(host, { class: currentRoute === "/about" ? "page page--about" : "page page--home", id: "router-outlet-component-host" }, view);
  });

  function renderComponent(path) {
    currentRoute = path;
    routerComponent.rerender();
    status.textContent = `componentBuilder + rerender() → ${path}: ${describeHost()}`;
  }

  elementBuilder(
    document.getElementById("router-outlet-component-controls"),
    null,
    <div>
      <button type="button" onClick={() => renderComponent("/")}>Route "/" (Home)</button>
      <button type="button" onClick={() => renderComponent("/about")}>Route "/about" (About)</button>
    </div>
  );

  routerComponent.render();
  renderComponent("/");
})();
