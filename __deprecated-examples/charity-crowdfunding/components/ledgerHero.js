import { el } from "../utils/dompp.js";

export function createLedgerHero({ onClear }) {
  const hero = el("section").setAttributes({ class: "hero" });
  const clearButton = el("button").setAttributes({
    class: "button",
    type: "button",
  });

  clearButton.setText("Clear all records");
  clearButton.setEvents({ click: onClear });

  hero.setChildren(
    el("div").setChildren(
      el("h1").setText("Donation Ledger"),
      el("p").setText("Donation records are stored in localStorage. Click an item to see its note.")
    ),
    el("div").setAttributes({ class: "hero-actions" }).setChildren(
      el("a").setAttributes({
        class: "button secondary",
        href: "./index.html",
      }).setText("Back to campaigns"),
      clearButton
    )
  );

  return hero;
}
