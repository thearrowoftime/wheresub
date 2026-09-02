/**
 * Convert a billed amount into weekly, monthly, and yearly totals.
 * Uses a 52-week year so weekly and yearly figures stay consistent.
 */
export const INTERVALS = ["weekly", "monthly", "yearly", "custom"];

const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

export function monthlyFrom(amount, interval, intervalDays = 30) {
  const value = Number(amount) || 0;
  switch (interval) {
    case "weekly":
      return (value * WEEKS_PER_YEAR) / MONTHS_PER_YEAR;
    case "yearly":
      return value / MONTHS_PER_YEAR;
    case "custom": {
      const days = Number(intervalDays) > 0 ? Number(intervalDays) : 30;
      return (value * 365.25) / days / MONTHS_PER_YEAR;
    }
    case "monthly":
    default:
      return value;
  }
}

export function normalize(amount, interval, intervalDays) {
  const monthly = monthlyFrom(amount, interval, intervalDays);
  return {
    weekly: (monthly * MONTHS_PER_YEAR) / WEEKS_PER_YEAR,
    monthly,
    yearly: monthly * MONTHS_PER_YEAR,
  };
}

export function totalsFor(subscriptions, currency) {
  const active = subscriptions.filter(
    (item) => item.status !== "cancelled" && item.currency === currency,
  );
  return active.reduce(
    (acc, item) => {
      const parts = normalize(item.amount, item.interval, item.intervalDays);
      acc.weekly += parts.weekly;
      acc.monthly += parts.monthly;
      acc.yearly += parts.yearly;
      return acc;
    },
    { weekly: 0, monthly: 0, yearly: 0 },
  );
}

export function currenciesIn(subscriptions) {
  return [...new Set(subscriptions.map((item) => item.currency).filter(Boolean))].sort();
}

export function formatMoney(amount, currency = "PLN") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    return `${(Number(amount) || 0).toFixed(2)} ${currency}`;
  }
}

export function daysUntil(dateString) {
  if (!dateString) return null;
  const target = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

export function isUnreviewed(item, reviewAfterDays = 30) {
  if (!item.lastReviewedAt) return true;
  const then = new Date(item.lastReviewedAt);
  if (Number.isNaN(then.getTime())) return true;
  const ageMs = Date.now() - then.getTime();
  return ageMs > reviewAfterDays * 86400000;
}
