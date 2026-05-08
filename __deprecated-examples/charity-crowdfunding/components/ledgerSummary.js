import { el } from "../utils/dompp.js";
import { formatCurrency } from "../utils/format.js";

export function createLedgerSummary() {
  const summary = el("section")
    .setAttributes({ class: "summary" })
    .setState({ total: 0, count: 0 });

  summary.setChildren(({ state }) => {
    const prefix = "ledger-summary";

    return [
      el("h2").setAttributes({ id: `${prefix}-title` }).setText("Ledger summary"),
      el("div").setAttributes({ class: "metric", id: `${prefix}-total` }).setChildren(
        el("small").setAttributes({ id: `${prefix}-total-label` }).setText("Total donated"),
        el("strong").setAttributes({ id: `${prefix}-total-value` }).setText(formatCurrency(state.total))
      ),
      el("div").setAttributes({ class: "metric", id: `${prefix}-count` }).setChildren(
        el("small").setAttributes({ id: `${prefix}-count-label` }).setText("Number of transactions"),
        el("strong").setAttributes({ id: `${prefix}-count-value` }).setText(`${state.count} transactions`)
      ),
      { matchById: true }
    ];
  });

  return summary;
}
