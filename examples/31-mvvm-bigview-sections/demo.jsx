/** @jsx elementBuilder */

function createProjectModel() {
  let title = "Project dashboard";
  let nextTaskId = 4;
  const tasks = [
    { id: 1, label: "Review the design", complete: true },
    { id: 2, label: "Implement the view", complete: false },
    { id: 3, label: "Check the interaction", complete: false },
  ];
  return {
    getSnapshot() { return { title, tasks: tasks.map((task) => ({ ...task })) }; },
    setTitle(nextTitle) { title = nextTitle; },
    addTask() { const task = { id: nextTaskId++, label: `New project task ${nextTaskId - 1}`, complete: false }; tasks.push(task); return task; },
    toggleTask(taskId) { const task = tasks.find((item) => item.id === taskId); if (task) task.complete = !task.complete; },
  };
}

function createProjectViewModel(model) {
  const listeners = new Set();
  function notify(topic) { listeners.forEach((listener) => listener(topic)); }
  return {
    getSnapshot() { return model.getSnapshot(); },
    renameTitle() { const currentTitle = model.getSnapshot().title; model.setTitle(currentTitle === "Project dashboard" ? "Project dashboard: reviewed" : "Project dashboard"); notify("title"); },
    addTask() { model.addTask(); notify("tasks"); },
    toggleTask(taskId) { model.toggleTask(taskId); notify("tasks"); },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  };
}

function createBigViewHeader(viewModel) {
  const component = componentBuilder(() => {
    const { title } = viewModel.getSnapshot();
    return <header style={{ alignItems: "center", display: "flex", gap: "12px" }}><h3>{title}</h3><button type="button" onClick={() => viewModel.renameTitle()}>Rename project</button></header>;
  });
  const unsubscribe = viewModel.subscribe((topic) => { if (topic === "title") component.rerender(); });
  return { builder: component.render(), dispose: unsubscribe };
}

function createBigViewSummary(viewModel) {
  const component = componentBuilder(() => {
    const tasks = viewModel.getSnapshot().tasks;
    const completeCount = tasks.filter((task) => task.complete).length;
    return <p>{completeCount} of {tasks.length} project tasks complete.</p>;
  });
  const unsubscribe = viewModel.subscribe((topic) => { if (topic === "tasks") component.rerender(); });
  return { builder: component.render(), dispose: unsubscribe };
}

function createBigViewTaskList(viewModel) {
  const component = componentBuilder(() => (
    <ul>
      {viewModel.getSnapshot().tasks.map((task) => (
        <li key={task.id}>
          <span>{task.complete ? "[done]" : "[todo]"} {task.label}</span>{" "}
          <button type="button" aria-pressed={task.complete} onClick={() => viewModel.toggleTask(task.id)}>
            {task.complete ? "Reopen" : "Complete"}
          </button>
        </li>
      ))}
    </ul>
  ));
  const unsubscribe = viewModel.subscribe((topic) => { if (topic === "tasks") component.rerender(); });
  return { builder: component.render(), dispose: unsubscribe };
}

function MaintainableBigView() {
  const model = createProjectModel();
  const viewModel = createProjectViewModel(model);
  const header = createBigViewHeader(viewModel);
  const summary = createBigViewSummary(viewModel);
  const taskList = createBigViewTaskList(viewModel);
  elementBuilder(
    document.getElementById("big-view-mvvm"),
    null,
    <p>Model owns the task data. ViewModel handles commands and publishes updates. Each View section subscribes only to topics it displays.</p>,
    header.builder,
    summary.builder,
    <button type="button" onClick={() => viewModel.addTask()}>Add task</button>,
    taskList.builder
  );
}

MaintainableBigView();