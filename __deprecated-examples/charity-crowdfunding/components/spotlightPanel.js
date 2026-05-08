import { el } from "../utils/dompp.js";
import { formatCurrency } from "../utils/format.js";

export function createSpotlightPanel({ initialId, onDonate }) {
  const spotlightPanel = el("section")
    .setAttributes({ class: "spotlight" })
    .setState({
      title: "",
      summary: "",
      raised: 0,
      goal: 0,
      donors: 0,
      location: "",
      category: "",
      campaignId: initialId,
    });

  spotlightPanel.setChildren(({ state }) => {
    const progressValue = state.goal ? Math.min(state.raised / state.goal, 1) : 0;
    const prefix = "spotlight";

    return [
      el("h2").setAttributes({ id: `${prefix}-title` }).setText("Spotlight"),
      el("h3").setAttributes({ id: `${prefix}-name` }).setText(state.title || "Select a campaign"),
      el("p").setAttributes({ id: `${prefix}-summary` }).setText(
        state.summary || "No campaign selected yet."
      ),
      el("div").setAttributes({ class: "meta", id: `${prefix}-meta` }).setText(
        `${state.category || ""} ${state.location ? "| " + state.location : ""}`.trim()
      ),
      el("div").setAttributes({ class: "progress", id: `${prefix}-progress` }).setChildren(
        el("span").setAttributes({ id: `${prefix}-progress-fill` }).setStyles({
          width: `${Math.round(progressValue * 100)}%`,
        })
      ),
      el("div").setAttributes({ class: "numbers", id: `${prefix}-numbers` }).setChildren(
        el("span").setAttributes({ id: `${prefix}-raised` }).setText(formatCurrency(state.raised)),
        el("span").setAttributes({ id: `${prefix}-donors` }).setText(`${state.donors} donors`)
      ),
      el("div").setAttributes({ class: "card-actions", id: `${prefix}-actions` }).setChildren(
        el("button").setAttributes({ type: "button", id: `${prefix}-donate-20` }).setText("Rp 20k")
          .setEvents({ click: () => onDonate(state.campaignId, 20000) }),
        el("button").setAttributes({ type: "button", id: `${prefix}-donate-75` }).setText("Rp 75k")
          .setEvents({ click: () => onDonate(state.campaignId, 75000) }),
        el("button").setAttributes({ class: "primary", type: "button", id: `${prefix}-donate-150` })
          .setText("Rp 150k")
          .setEvents({ click: () => onDonate(state.campaignId, 150000) })
      ),
      { matchById: true }
    ];
  });

  return spotlightPanel;
}
