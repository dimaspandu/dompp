export function computeProgress(campaign) {
  return Math.min(campaign.raised / campaign.goal, 1);
}

export function computeSummary(campaigns) {
  const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.raised, 0);
  const totalDonors = campaigns.reduce((sum, campaign) => sum + campaign.donors, 0);
  const fundedCount = campaigns.filter((campaign) => campaign.raised >= campaign.goal).length;
  const activeCount = campaigns.length - fundedCount;

  return {
    totalRaised,
    totalDonors,
    fundedCount,
    activeCount,
  };
}

export function filterCampaigns(campaigns, filter) {
  const query = filter.query.trim().toLowerCase();

  return campaigns.filter((campaign) => {
    if (filter.category !== "all" && campaign.category !== filter.category) {
      return false;
    }

    const isFunded = campaign.raised >= campaign.goal;
    if (filter.status === "funded" && !isFunded) return false;
    if (filter.status === "active" && isFunded) return false;

    if (!query) return true;

    const haystack = `${campaign.title} ${campaign.summary} ${campaign.location}`.toLowerCase();
    return haystack.includes(query);
  });
}
