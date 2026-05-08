import { el } from "../utils/dompp.js";

export function createAppHero({ onReset }) {
  const hero = el("section").setAttributes({ class: "hero" });
  const resetButton = el("button").setAttributes({
    class: "button",
    type: "button",
  });

  resetButton.setText("Reset demo data");
  resetButton.setEvents({ click: onReset });

  hero.setChildren(
    el("div").setChildren(
      el("span").setAttributes({ class: "badge" }).setText("DOMPP Crowdfunding Demo"),
      el("h1").setText("Together We Create Real Impact"),
      el("p").setText(
        "A SaaS-style crowdfunding/charity app built with DOMPP. Users can browse, filter, and donate with stateful UI and local storage."
      )
    ),
    el("div").setAttributes({ class: "hero-actions" }).setChildren(
      el("a").setAttributes({
        class: "button secondary",
        href: "./ledger.html",
      }).setText("View donation ledger"),
      resetButton
    )
  );

  return hero;
}
