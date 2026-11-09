let nextId = 4;
const feed = document.createElement("div")
  .setState({ posts: [{ id: 1, text: "Welcome to the feed!" }, { id: 2, text: "DOM++ is reactive." }, { id: 3, text: "Try the buttons below." }] })
  .setChildren(({ state, setState }) => [
    document.createElement("div").setChildren(
      document.createElement("button").setText("Prepend").setEvents({ click() { setState({ posts: [{ id: nextId++, text: "New post " + nextId }, ...state.posts] }); } }),
      document.createElement("button").setText("Append").setEvents({ click() { setState({ posts: [...state.posts, { id: nextId++, text: "New post " + nextId }] }); } })
    ),
    document.createElement("div").setChildren(
      state.posts.map(post =>
        document.createElement("div")
          .setAttributes({ class: "card", key: post.id })
          .setChildren(
            document.createElement("p").setText(post.text),
            document.createElement("button").setText("Remove").setEvents({ click() { setState({ posts: state.posts.filter(p => p.id !== post.id) }); } })
          )
      )
    )
  ]);

app.setChildren(feed);