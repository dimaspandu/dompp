import "../../src/index.js";
import { installDomppReconcile } from "../../src/addons/reconcile.addon.js";
import { installDomppStateful } from "../../src/reactive/stateful.js";

import { baseCampaigns, categories, statusOptions } from "./data/campaigns.js";
import { el } from "./utils/dompp.js";
import { computeSummary, filterCampaigns } from "./utils/campaigns.js";
import { formatCurrency } from "./utils/format.js";
import {
  CAMPAIGN_KEY,
  DONATION_KEY,
  addDonation,
  loadCampaigns,
  saveCampaigns,
} from "./state/storage.js";
import { createAppHero } from "./components/appHero.js";
import { createFilters } from "./components/filters.js";
import { createCampaignCard } from "./components/campaignCard.js";
import { createSpotlightPanel } from "./components/spotlightPanel.js";
import { createSummaryPanel } from "./components/summaryPanel.js";
import { createToast } from "./components/toast.js";

installDomppReconcile({ overrideSetters: true });
installDomppStateful();

let campaignsCache = loadCampaigns();
let spotlightId = campaignsCache[0]?.id ?? baseCampaigns[0].id;
const campaignCards = new Map();

const app = document.getElementById("app").setState({
  campaigns: campaignsCache,
  filter: {
    query: "",
    category: "all",
    status: "all",
  },
  spotlightId,
});

const hero = createAppHero({ onReset: resetDemo });

const { filters, searchInput, categorySelect, statusSelect } = createFilters({
  categories,
  statusOptions,
  onSearch: (value) => setFilter({ query: value }),
  onCategory: (value) => setFilter({ category: value }),
  onStatus: (value) => setFilter({ status: value }),
});

const list = el("section").setAttributes({ class: "campaign-grid" });
const emptyState = el("div").setAttributes({ class: "empty", hidden: true });
emptyState.setText("No campaigns match the current filters.");

const spotlightPanel = createSpotlightPanel({
  initialId: spotlightId,
  onDonate: donateToCampaign,
});

const summaryPanel = createSummaryPanel(computeSummary(campaignsCache));
const toast = createToast();

const layout = el("section").setAttributes({ class: "layout" });
const footer = el("footer");

footer.setText("Demo data is stored in localStorage. Reloading the page won't erase donations.");

layout.setChildren(
  el("div").setChildren(list, emptyState),
  el("div").setChildren(spotlightPanel, summaryPanel, toast)
);

function setFilter(next) {
  app.setState(({ state }) => {
    state.filter = {
      ...state.filter,
      ...next,
    };
  });
}

function syncSpotlight(campaignId, campaigns) {
  const data = campaigns.find((campaign) => campaign.id === campaignId) ?? campaigns[0];
  if (!data) return;

  spotlightPanel.setState({
    title: data.title,
    summary: data.summary,
    raised: data.raised,
    goal: data.goal,
    donors: data.donors,
    location: data.location,
    category: data.category,
    campaignId: data.id,
  });
}

function donateToCampaign(campaignId, amount, donorName, note) {
  const value = Math.max(1000, Math.round(amount || 0));
  if (!Number.isFinite(value) || value <= 0) return;

  const nextCampaigns = campaignsCache.map((campaign) => {
    if (campaign.id !== campaignId) return campaign;
    return {
      ...campaign,
      raised: campaign.raised + value,
      donors: campaign.donors + 1,
    };
  });

  campaignsCache = nextCampaigns;
  saveCampaigns(nextCampaigns);

  app.setState({ campaigns: nextCampaigns });

  summaryPanel.setState(computeSummary(nextCampaigns));
  syncSpotlight(spotlightId, nextCampaigns);

  const campaign = nextCampaigns.find((item) => item.id === campaignId);
  const entry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    campaignId,
    campaignTitle: campaign?.title ?? "Campaign",
    amount: value,
    name: donorName || "Anonymous",
    note: note || "",
    at: Date.now(),
  };

  addDonation(entry);

  toast.setState({
    message: `Donation ${formatCurrency(value)} for ${campaign?.title ?? "campaign"} has been recorded.`,
    visible: true,
  });
}

function resetDemo() {
  localStorage.removeItem(CAMPAIGN_KEY);
  localStorage.removeItem(DONATION_KEY);

  campaignsCache = loadCampaigns();
  spotlightId = campaignsCache[0]?.id ?? baseCampaigns[0].id;

  app.setState({
    campaigns: campaignsCache,
    spotlightId,
    filter: {
      query: "",
      category: "all",
      status: "all",
    },
  });

  summaryPanel.setState(computeSummary(campaignsCache));
  syncSpotlight(spotlightId, campaignsCache);
  toast.setState({ message: "Demo data has been reset.", visible: true });
}

function getCampaignCard(campaign) {
  let card = campaignCards.get(campaign.id);
  if (!card) {
    card = createCampaignCard({
      campaign,
      onDonate: donateToCampaign,
      onSpotlight: (id) => {
        spotlightId = id;
        app.setState({ spotlightId });
        syncSpotlight(spotlightId, campaignsCache);
      },
    });
    campaignCards.set(campaign.id, card);
    return card;
  }

  card.setState({ campaign });
  return card;
}

app.setChildren(({ state }) => {
  const filtered = filterCampaigns(state.campaigns, state.filter);

  list.setChildren(
    ...filtered.map((campaign) => getCampaignCard(campaign)),
    { matchById: true }
  );

  emptyState.setAttributes({ hidden: filtered.length > 0 });

  searchInput.value = state.filter.query;
  categorySelect.value = state.filter.category;
  statusSelect.value = state.filter.status;

  syncSpotlight(state.spotlightId, state.campaigns);

  return [hero, filters, layout, footer];
});

syncSpotlight(spotlightId, campaignsCache);




