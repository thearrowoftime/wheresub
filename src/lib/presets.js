/**
 * Catalog of common products. Amounts are left empty on purpose so the
 * user always types the price they actually pay. Nothing is fetched remotely.
 */
export const PRESETS = [
  { name: "Netflix", interval: "monthly", category: "entertainment" },
  { name: "Spotify", interval: "monthly", category: "entertainment" },
  { name: "YouTube Premium", interval: "monthly", category: "entertainment" },
  { name: "Disney+", interval: "monthly", category: "entertainment" },
  { name: "Max", interval: "monthly", category: "entertainment" },
  { name: "Amazon Prime", interval: "yearly", category: "shopping" },
  { name: "Apple iCloud+", interval: "monthly", category: "storage" },
  { name: "Google One", interval: "monthly", category: "storage" },
  { name: "Dropbox", interval: "monthly", category: "storage" },
  { name: "Microsoft 365", interval: "yearly", category: "work" },
  { name: "Adobe Creative Cloud", interval: "monthly", category: "work" },
  { name: "Notion", interval: "monthly", category: "work" },
  { name: "GitHub Copilot", interval: "monthly", category: "work" },
  { name: "ChatGPT Plus", interval: "monthly", category: "work" },
  { name: "Cursor", interval: "monthly", category: "work" },
  { name: "PlayStation Plus", interval: "yearly", category: "entertainment" },
  { name: "Xbox Game Pass", interval: "monthly", category: "entertainment" },
  { name: "1Password", interval: "yearly", category: "security" },
  { name: "Bitwarden", interval: "yearly", category: "security" },
];
