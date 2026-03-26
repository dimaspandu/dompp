import { el } from "../utils/dompp.js";
import { formatCurrency } from "../utils/format.js";

export function createSummaryPanel(initialSummary) {
  const summaryPanel = el("section")
    .setAttributes({ class: "summary" })
    .setState(initialSummary);

  summaryPanel.setChildren(({ state }) => {
    const prefix = "summary";

    return [
      el("h2").setAttributes({ id: `${prefix}-title` }).setText("Summary"),
      el("div").setAttributes({ class: "metric", id: `${prefix}-total` }).setChildren(
        el("small").setAttributes({ id: `${prefix}-total-label` }).setText("Total raised"),
        el("strong").setAttributes({ id: `${prefix}-total-value` }).setText(formatCurrency(state.totalRaised))
      ),
      el("div").setAttributes({ class: "metric", id: `${prefix}-donors` }).setChildren(
        el("small").setAttributes({ id: `${prefix}-donors-label` }).setText("Total donors"),
        el("strong").setAttributes({ id: `${prefix}-donors-value` }).setText(`${state.totalDonors} donors`)
      ),
      el("div").setAttributes({ class: "metric", id: `${prefix}-funded` }).setChildren(
        el("small").setAttributes({ id: `${prefix}-funded-label` }).setText("Funded campaigns"),
        el("strong").setAttributes({ id: `${prefix}-funded-value` }).setText(`${state.fundedCount} campaigns`)
      ),
      el("div").setAttributes({ class: "metric", id: `${prefix}-active` }).setChildren(
        el("small").setAttributes({ id: `${prefix}-active-label` }).setText("Active campaigns"),
        el("strong").setAttributes({ id: `${prefix}-active-value` }).setText(`${state.activeCount} campaigns`)
      ),
      { matchById: true }
    ];
  });

  return summaryPanel;
}
