import { el } from "../utils/dompp.js";
import { formatCurrency, formatDate } from "../utils/format.js";

export function createDonationItem(entry) {
  const item = el("li")
    .setAttributes({ class: "ledger-item", id: `donation-${entry.id}` })
    .setState({ expanded: false });

  item.setEvents({
    click: () => {
      item.setState(({ state }) => {
        state.expanded = !state.expanded;
      });
    },
  });

  item.setChildren(({ state }) => {
    const prefix = `donation-${entry.id}`;

    return [
      el("strong").setAttributes({ id: `${prefix}-title` }).setText(
        `${formatCurrency(entry.amount)} - ${entry.campaignTitle}`
      ),
      el("br").setAttributes({ id: `${prefix}-break` }),
      el("small").setAttributes({ id: `${prefix}-meta` }).setText(
        `${entry.name || "Anonymous"} | ${formatDate(entry.at)}`
      ),
      el("p").setAttributes({ id: `${prefix}-note`, hidden: !state.expanded }).setText(
        entry.note || "No additional note."
      ),
      { matchById: true }
    ];
  });

  return item;
}
