export const baseCampaigns = [
  {
    id: "clean-water",
    title: "Clean Water Wells for Wailuri Village",
    category: "Infrastructure",
    location: "Kupang",
    goal: 75000000,
    raised: 28500000,
    donors: 182,
    summary: "Build 3 bore wells and a pipe network so 420 families have year-round access to clean water.",
  },
  {
    id: "school-kits",
    title: "School Kits for Fisherfolk Children",
    category: "Education",
    location: "Indramayu",
    goal: 42000000,
    raised: 19400000,
    donors: 95,
    summary: "Provide bags, uniforms, and books for 350 grade 1-3 students to keep them motivated.",
  },
  {
    id: "forest-guardian",
    title: "Marena Indigenous Forest Patrol",
    category: "Environment",
    location: "Central Sulawesi",
    goal: 68000000,
    raised: 51200000,
    donors: 210,
    summary: "Support 18 forest patrol volunteers, documentation tools, and community mapping training.",
  },
  {
    id: "health-clinic",
    title: "Mobile Clinic for Mothers and Children",
    category: "Health",
    location: "Southwest Maluku",
    goal: 90000000,
    raised: 37200000,
    donors: 148,
    summary: "Reach 12 small islands with prenatal checks, toddler nutrition, and health education.",
  },
  {
    id: "micro-stall",
    title: "Micro-Stall Capital for Women Entrepreneurs",
    category: "Economy",
    location: "Yogyakarta",
    goal: 56000000,
    raised: 44800000,
    donors: 173,
    summary: "Provide micro-capital and business literacy training for 60 underprivileged women vendors.",
  },
  {
    id: "flood-response",
    title: "Emergency Community Kitchen",
    category: "Emergency",
    location: "South Kalimantan",
    goal: 35000000,
    raised: 31800000,
    donors: 260,
    summary: "Supply food, logistics, and essentials for 1,200 survivors for 14 days.",
  },
];

export const categories = [
  "all",
  ...Array.from(new Set(baseCampaigns.map((item) => item.category))),
];

export const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "funded", label: "Funded" },
];
