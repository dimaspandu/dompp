function createLikeViewModel() {
  let likes = 0;
  const listeners = new Set();

  return {
    get likes() {
      return likes;
    },

    like() {
      likes++;
      listeners.forEach((listener) => listener());
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const viewModel = createLikeViewModel();

const likeComponent = document.createComponent(() => (
  document.createElement(document.getElementById("app"))
    .setChildren(
      document.createElement("div")
        .setAttributes({ class: "like-row" })
        .setChildren(
          document.createElement("strong").setText(viewModel.likes),
          document.createElement("span").setText(" likes")
        ),
      document.createElement("button")
        .setText("♥ Like")
        .setAttributes({
          type: "button",
          class: "like-button"
        })
        .setEvents({
          click() {
            viewModel.like();
          }
        })
    )
));

viewModel.subscribe(() => likeComponent.rerender());