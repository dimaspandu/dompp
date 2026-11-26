

function LikeViewModel() {
  let likes = 0;
  const listeners = new Set();

  return {
    get likes() {
      return likes;
    },

    like() {
      likes++;
      listeners.forEach(listener => listener(likes));
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

const viewModel = LikeViewModel();
const likeComponent = document.createComponent(() => (
  document.createElement("section", { "class": "demo-surface mvvm-surface" }, document.createElement("div", { "class": "like-row" }, document.createElement("strong", null, viewModel.likes), document.createElement("span", null, "likes")), document.createElement("button", { "class": "like-button", "type": "button", "onClick": () => viewModel.like() }, "♥ Like"))
));

// Example without using setChildren.
document.createElement(
  document.getElementById("mvvm-app"),
  null,
  likeComponent
);

viewModel.subscribe(() => likeComponent.rerender());
