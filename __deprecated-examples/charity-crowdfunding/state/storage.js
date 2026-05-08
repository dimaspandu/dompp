import { baseCampaigns } from "../data/campaigns.js";

export const CAMPAIGN_KEY = "dompp-charity-campaigns-v1";
export const DONATION_KEY = "dompp-charity-donations-v1";

function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (err) {
    return fallback;
  }
}

export function loadCampaigns() {
  const stored = safeParse(CAMPAIGN_KEY, []);
  if (!Array.isArray(stored) || stored.length === 0) {
    return baseCampaigns.map((campaign) => ({ ...campaign }));
  }

  const storedById = new Map(stored.map((item) => [item.id, item]));

  return baseCampaigns.map((campaign) => {
    const saved = storedById.get(campaign.id);
    if (!saved) return { ...campaign };
    return {
      ...campaign,
      raised: Number(saved.raised ?? campaign.raised),
      donors: Number(saved.donors ?? campaign.donors),
    };
  });
}

export function saveCampaigns(campaigns) {
  const payload = campaigns.map((campaign) => ({
    id: campaign.id,
    raised: campaign.raised,
    donors: campaign.donors,
  }));
  localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(payload));
}

export function loadDonations() {
  const stored = safeParse(DONATION_KEY, []);
  return Array.isArray(stored) ? stored : [];
}

export function saveDonations(donations) {
  localStorage.setItem(DONATION_KEY, JSON.stringify(donations));
}

export function addDonation(entry) {
  const donations = loadDonations();
  donations.unshift(entry);
  saveDonations(donations);
  return donations;
}
