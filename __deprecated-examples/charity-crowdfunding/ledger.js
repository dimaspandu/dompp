import "../../src/index.js";
import { installDomppReconcile } from "../../src/addons/reconcile.addon.js";
import { installDomppStateful } from "../../src/reactive/stateful.js";

import { el } from "./utils/dompp.js";
import { createLedgerHero } from "./components/ledgerHero.js";
import { createDonationItem } from "./components/donationItem.js";
import { createLedgerSummary } from "./components/ledgerSummary.js";
import { loadDonations, saveDonations } from "./state/storage.js";

installDomppReconcile({ overrideSetters: true });
installDomppStateful();

const app = document.getElementById("app").setState({
  donations: loadDonations(),
});

const hero = createLedgerHero({
  onClear: () => {
    saveDonations([]);
    app.setState({ donations: [] });
  },
});

const ledgerPanel = el("section").setAttributes({ class: "ledger" });
const list = el("ul").setAttributes({ class: "ledger-list" });
const emptyState = el("div").setAttributes({ class: "empty", hidden: true });
emptyState.setText("No donations recorded yet.");

const summary = createLedgerSummary();

function computeSummary(donations) {
  return donations.reduce(
    (acc, item) => {
      acc.total += Number(item.amount || 0);
      acc.count += 1;
      return acc;
    },
    { total: 0, count: 0 }
  );
}

ledgerPanel.setChildren(list, emptyState);

app.setChildren(({ state }) => {
  list.setChildren(
    ...state.donations.map((entry) => createDonationItem(entry)),
    { matchById: true }
  );

  emptyState.setAttributes({ hidden: state.donations.length > 0 });

  summary.setState(computeSummary(state.donations));

  return [hero, summary, ledgerPanel];
});
