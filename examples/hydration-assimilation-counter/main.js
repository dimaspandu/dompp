import "../../src/index.js";

const greetings = document.getElementById("greetings");
const counter = document.getElementById("counter");

greetings.setChildren(({ children }) => {
  const [titleEl, descriptionEl] = children;

  return [
    titleEl.setText("Hello, Hydrated DOM++!"),
    descriptionEl.setText("This block was assimilated from pre-rendered HTML.")
  ];
});

counter.setChildren(({ children }) => {
  const [countEl, decrementButton, incrementButton] = children;
  let count = Number.parseInt(countEl.textContent ?? "0", 10);

  const render = () => {
    countEl.setText(String(count));
  };

  return [
    countEl,
    decrementButton.setEvents({
      click() {
        count -= 1;
        render();
      }
    }),
    incrementButton.setEvents({
      click() {
        count += 1;
        render();
      }
    })
  ];
});

