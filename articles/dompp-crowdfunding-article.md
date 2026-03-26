# Building a Crowdfunding UI with DOMPP: A Practical Case Study

Crowdfunding products sit in a tricky space: the UI needs to feel fast, stateful, and predictable, yet the data model is simple enough that a heavy framework can feel like overkill. In this article I will show how DOMPP can power a small crowdfunding/charity web app with a clear, explicit architecture.

We will build two pages:

- A campaign browsing page with filters and donation actions
- A donation ledger page that lists stored transactions

Everything runs in the browser with local storage, and the UI stays stateful without virtual DOM diffing.

## Why DOMPP

DOMPP stays close to the platform. It extends real DOM elements with small, chainable helpers and gives you optional stateful bindings. That means:

- Rendering is explicit and predictable
- State is local to the element that owns it
- You can opt into reconcile behavior when needed (`matchById`)

For a simple crowdfunding UI, this is a great match: we want fast updates, stable DOM identity, and clear flows rather than complex abstractions.

## App Overview

The app is intentionally small but realistic. It includes:

- Campaign list with search, category, and funding status filters
- Campaign cards with a toggleable detail area
- Quick donation buttons and a custom amount input
- Spotlight panel for a featured campaign
- Summary panel with totals
- Toast feedback for successful donations
- Ledger page that lists all transactions

The project is organized into small modules so each UI block is easy to read and maintain:

- `components/` for UI blocks
- `state/` for storage helpers
- `utils/` for formatting and campaign utilities
- `data/` for seed campaigns

## A Small Helper: `el()`

In the codebase, most DOM nodes are created via a small helper:

```js
const el = (tag) => document.createElement(tag);
```

It is just a shorthand for `document.createElement` to keep the UI construction more declarative and easier to scan. If you prefer, you can replace `el("div")` with `document.createElement("div")` everywhere.

## Storage Layer

For a demo, local storage is enough. We store:

- Campaign progress (raised amount and donor count)
- Donation ledger entries

The storage helpers live in `state/storage.js`, keeping the UI code clean and focused.

```js
export const CAMPAIGN_KEY = "dompp-charity-campaigns-v1";
export const DONATION_KEY = "dompp-charity-donations-v1";

export function saveCampaigns(campaigns) {
  const payload = campaigns.map((campaign) => ({
    id: campaign.id,
    raised: campaign.raised,
    donors: campaign.donors,
  }));
  localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(payload));
}
```

## Declarative DOMPP Components

Instead of large monolithic scripts, each UI block is created in its own file. For example, a campaign card is a stateful element that re-renders its children based on local state:

```js
const el = (tag) => document.createElement(tag);

export function createCampaignCard({ campaign, onDonate, onSpotlight }) {
  const card = el("article")
    .setAttributes({ class: "card", id: `campaign-${campaign.id}` })
    .setState({ expanded: false, customAmount: "", campaign });

  card.setChildren(({ state }) => {
    const current = state.campaign;
    const funded = current.raised >= current.goal;

    return [
      el("h3").setText(current.title),
      el("span").setAttributes({ class: "badge" }).setText(
        funded ? "Funded" : "Active"
      ),
      el("button").setText("Rp 25k").setEvents({
        click: () => onDonate(current.id, 25000),
      }),
      { matchById: true }
    ];
  });

  return card;
}
```

This feels similar to a component in React, but stays fully DOM-native.

## Highlight 1: Stateful Cards + matchById

When filters change, the campaign list is re-rendered. Without reconcile, newly created cards would lose their internal state. DOMPP lets us keep card state intact by using `matchById` in the list rendering and inside each card.

```js
list.setChildren(
  ...filtered.map((campaign) => getCampaignCard(campaign)),
  { matchById: true }
);
```

That means if a user expands a card, changes filters, and later sees the card again, its expanded state can persist. The DOM identity stays stable while the data updates.

## Highlight 2: Cross-Element State Updates

Donating from a card does more than update that card. It also:

- Updates the summary panel totals
- Updates the spotlight panel progress
- Shows a toast confirmation

```js
function donateToCampaign(campaignId, amount) {
  const nextCampaigns = campaignsCache.map((campaign) => {
    if (campaign.id !== campaignId) return campaign;
    return {
      ...campaign,
      raised: campaign.raised + amount,
      donors: campaign.donors + 1,
    };
  });

  campaignsCache = nextCampaigns;
  saveCampaigns(nextCampaigns);

  summaryPanel.setState(computeSummary(nextCampaigns));
  syncSpotlight(spotlightId, nextCampaigns);

  toast.setState({
    message: `Donation ${formatCurrency(amount)} recorded.`,
    visible: true,
  });
}
```

The code is explicit and easy to trace: the donation handler updates storage and then pushes new state into the affected elements. No global reactivity is required.

## Ledger Page

The ledger page is a smaller companion view that lists recent donations stored in local storage. Each entry is also stateful: clicking an item toggles a note section.

```js
const el = (tag) => document.createElement(tag);

export function createDonationItem(entry) {
  const item = el("li")
    .setAttributes({ class: "ledger-item" })
    .setState({ expanded: false });

  item.setEvents({
    click: () => item.setState(({ state }) => {
      state.expanded = !state.expanded;
    }),
  });

  item.setChildren(({ state }) => [
    el("strong").setText(`${formatCurrency(entry.amount)} - ${entry.campaignTitle}`),
    el("p").setAttributes({ hidden: !state.expanded }).setText(entry.note || "No note"),
    { matchById: true }
  ]);

  return item;
}
```

## Trade-offs

What you gain:

- Clear control over DOM mutations
- Minimal runtime overhead
- Stable and debuggable state ownership

What you trade:

- You have to organize state and re-renders manually
- Larger apps still need structure and discipline

For small to medium UIs where performance and explicit behavior matter, DOMPP is an excellent fit.

## Closing Thoughts

This case study shows that you can build a real, stateful crowdfunding interface without a heavy framework. DOMPP keeps the UI fast, predictable, and easy to reason about while giving you just enough structure to scale the codebase.

If you want to take it further, the next steps could include:

- IndexedDB for larger storage needs
- Auth and real payment flow integration
- Server-backed campaigns and ledger

Thanks for reading, and I hope this gives you a practical starting point for your own DOMPP experiments.
