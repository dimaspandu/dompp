import { el } from "../utils/dompp.js";
import { computeProgress } from "../utils/campaigns.js";
import { formatCurrency } from "../utils/format.js";

export function createCampaignCard({ campaign, onDonate, onSpotlight }) {
  const card = el("article")
    .setAttributes({ class: "card", id: `campaign-${campaign.id}` })
    .setState({ expanded: false, customAmount: "", campaign });

  card.setChildren(({ state }) => {
    const current = state.campaign;
    const progressValue = computeProgress(current);
    const funded = current.raised >= current.goal;
    const prefix = `campaign-${current.id}`;

    return [
      el("h3").setAttributes({ id: `${prefix}-title` }).setText(current.title),
      el("span").setAttributes({ class: "badge", id: `${prefix}-status` }).setText(
        funded ? "Funded" : "Active"
      ),
      el("div").setAttributes({ class: "meta", id: `${prefix}-meta` }).setText(
        `${current.category} | ${current.location}`
      ),
      el("div").setAttributes({ class: "progress", id: `${prefix}-progress` }).setChildren(
        el("span").setAttributes({ id: `${prefix}-progress-fill` }).setStyles({
          width: `${Math.round(progressValue * 100)}%`,
        })
      ),
      el("div").setAttributes({ class: "numbers", id: `${prefix}-numbers` }).setChildren(
        el("span").setAttributes({ id: `${prefix}-raised` }).setText(
          `${formatCurrency(current.raised)} raised`
        ),
        el("span").setAttributes({ id: `${prefix}-donors` }).setText(
          `${current.donors} donors`
        )
      ),
      el("p").setAttributes({
        class: "card-detail",
        id: `${prefix}-detail`,
        hidden: !state.expanded,
      }).setText(current.summary),
      el("div").setAttributes({ class: "card-actions", id: `${prefix}-quick` }).setChildren(
        el("button").setAttributes({ type: "button", id: `${prefix}-donate-10` }).setText("Rp 10k")
          .setEvents({ click: () => onDonate(current.id, 10000) }),
        el("button").setAttributes({ type: "button", id: `${prefix}-donate-25` }).setText("Rp 25k")
          .setEvents({ click: () => onDonate(current.id, 25000) }),
        el("button").setAttributes({ type: "button", id: `${prefix}-donate-50` }).setText("Rp 50k")
          .setEvents({ click: () => onDonate(current.id, 50000) })
      ),
      el("div").setAttributes({ class: "custom-row", id: `${prefix}-custom` }).setChildren(
        el("input").setAttributes({
          id: `${prefix}-custom-input`,
          type: "number",
          min: "1000",
          step: "1000",
          placeholder: "Custom amount",
          value: state.customAmount || "",
        }).setEvents({
          input: (event) => {
            card.setState({ customAmount: event.target.value });
          },
        }),
        el("button").setAttributes({
          class: "primary",
          type: "button",
          id: `${prefix}-custom-button`,
        }).setText("Donate").setEvents({
          click: () => {
            let amount = 0;
            card.setState(({ state }) => {
              amount = Number(state.customAmount);
              state.customAmount = "";
            });

            if (!Number.isFinite(amount) || amount <= 0) return;
            onDonate(current.id, amount, "Anonymous", "Custom");
          },
        })
      ),
      el("button").setAttributes({
        class: "button secondary",
        type: "button",
        id: `${prefix}-toggle`,
      }).setText(state.expanded ? "Hide details" : "View details")
        .setEvents({
          click: () => {
            card.setState(({ state }) => {
              state.expanded = !state.expanded;
            });
          },
        }),
      el("button").setAttributes({
        class: "button secondary",
        type: "button",
        id: `${prefix}-spotlight`,
      }).setText("Set spotlight")
        .setEvents({
          click: () => onSpotlight(current.id),
        }),
      { matchById: true }
    ];
  });

  return card;
}
