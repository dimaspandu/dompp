/**
 * Ideation: hydration / assimilation flow
 *
 * Seed HTML expected in the document:
 *
 * <section id="greetings">
 *   <h1>Hello, World!</h1>
 *   <p>Nice to see you!</p>
 * </section>
 *
 * <div id="counter">
 *   <h1>0</h1>
 *   <button type="button">-</button>
 *   <button type="button">+</button>
 * </div>
 */

import "./src/index.js";
import { installDomppHydration } from "./src/addons/hydration.addon.js";

installDomppHydration();

const greetings = document.getElementById("greetings");
const counter = document.getElementById("counter");

if (greetings) {
  greetings.hydrateChildren(({ children }) => {
    const [titleEl, descriptionEl] = children;

    return [
      titleEl,
      descriptionEl.setText("Nice to see you from hydrated DOM++!")
    ];
  });
}

if (counter) {
  counter.hydrateChildren(({ children }) => {
    const [countEl, decrementButton, incrementButton] = children;
    let count = Number.parseInt(countEl.textContent ?? "0", 10);

    return [
      countEl,
      decrementButton.setEvents({
        click() {
          count -= 1;
          countEl.setText(String(count));
        }
      }),
      incrementButton.setEvents({
        click() {
          count += 1;
          countEl.setText(String(count));
        }
      })
    ];
  });
}
