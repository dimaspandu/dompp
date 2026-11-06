/** @jsx elementBuilder */

/*
 * Model: owns data and has no dependency on View or DOM.
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
 * ViewModel: exposes Model data/actions and notifies subscribers when data changes.
 * The View subscribes with its rerender method.
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
    decrement() {
      if (model.count > 0) this.count = model.count - 1;
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

function App(props, ...children) {
  return elementBuilder(document.getElementById("app-jsx"), props, ...children);
}

// View: reads ViewModel state and sends user actions to ViewModel methods.
function MVVMExample() {
  const model = createCounterModel();
  const viewModel = createCounterViewModel(model);
  let view;

  view = componentBuilder(() => (
    <section className="card">
      <h3>MVVM: View / ViewModel / Model</h3>
      <p>View reads the ViewModel getter: <strong>{viewModel.count}</strong></p>
      <p>
        The View only calls ViewModel actions. The ViewModel updates its Model and
        notifies listeners, which trigger <code>view.rerender()</code>.
      </p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button type="button" class="secondary" onClick={() => viewModel.decrement()}>
          Decrement
        </button>
        <button type="button" class="secondary" onClick={() => viewModel.increment()}>
          Increment through ViewModel
        </button>
      </div>
    </section>
  ));

  viewModel.addListener(() => view.rerender());
  return view.render();
}

<App>
  <MVVMExample />
</App>