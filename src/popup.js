import {
  getSettings,
  listSubscriptions,
  upsertSubscription,
} from "./lib/storage.js";
import { currenciesIn, daysUntil, formatMoney, totalsFor } from "./lib/money.js";

const totalsEl = document.getElementById("totals");
const upcomingEl = document.getElementById("upcoming");
const form = document.getElementById("quick-add");

function upcomingItems(items) {
  return items
    .filter((item) => item.status !== "cancelled" && item.nextRenewal)
    .map((item) => ({ item, days: daysUntil(item.nextRenewal) }))
    .filter((row) => row.days !== null)
    .sort((a, b) => a.days - b.days)
    .slice(0, 4);
}

async function render() {
  const [items, settings] = await Promise.all([listSubscriptions(), getSettings()]);
  const currencies = currenciesIn(items);
  const currency = currencies.includes(settings.defaultCurrency)
    ? settings.defaultCurrency
    : currencies[0] || settings.defaultCurrency;
  const totals = totalsFor(items, currency);

  totalsEl.innerHTML = ["weekly", "monthly", "yearly"]
    .map(
      (key) =>
        `<div class="stat"><span>${key}</span><strong>${formatMoney(totals[key], currency)}</strong></div>`,
    )
    .join("");

  const soon = upcomingItems(items);
  const emptyEl = document.getElementById("upcoming-empty");
  emptyEl.hidden = soon.length > 0;
  upcomingEl.innerHTML = soon
    .map(({ item, days }) => {
      const when = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "today" : `in ${days}d`;
      return `<li><span>${item.name}<em> · ${when}</em></span><strong>${formatMoney(item.amount, item.currency)}</strong></li>`;
    })
    .join("");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const settings = await getSettings();
  await upsertSubscription({
    name: data.get("name"),
    amount: data.get("amount"),
    interval: data.get("interval"),
    currency: settings.defaultCurrency,
    status: "active",
    source: "manual",
  });
  form.reset();
  await render();
});

render();
