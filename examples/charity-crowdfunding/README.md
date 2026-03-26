# Charity Crowdfunding (DOMPP)

A case study demo of a SaaS-style crowdfunding/charity app built with DOMPP. This example includes:

- A campaign list with filters
- Quick donations and custom amounts
- Persistent data stored in localStorage
- Stateful components with cross-element updates
- `matchById` reconcile to preserve DOM identity
- Two simple pages (campaigns + ledger)

## Technical Highlights

- **Stateful + reconcile:** each campaign card is stateful. When filters change, `matchById` preserves internal UI state (like expanded details).
- **Cross-element updates:** donating from a card updates the `summaryPanel` and `toast` directly.
- **Spotlight panel:** the spotlight panel is stateful and can be updated by other elements (via the "Set spotlight" button).
- **Persistent storage:** donations and campaign progress are stored in `localStorage`.

## Project Structure

- `index.html` + `app.js` -> campaigns page
- `ledger.html` + `ledger.js` -> donation ledger
- `styles.css` -> shared styling
- `components/` -> UI blocks (hero, filters, cards, summary, toast)
- `data/` -> initial campaign seed data
- `state/` -> localStorage helpers
- `utils/` -> DOMPP helpers and formatting

## Running the Demo

From the repo root:

```bash
node examples/serve.js
```

Then open:

- `http://localhost:3000/examples/charity-crowdfunding/`
- `http://localhost:3000/examples/charity-crowdfunding/ledger.html`
