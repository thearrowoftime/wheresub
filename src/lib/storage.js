import { createId } from "./id.js";

const SUBS_KEY = "subscriptions";
const SETTINGS_KEY = "settings";

export const DEFAULT_SETTINGS = {
  defaultCurrency: "PLN",
  reminderDays: 3,
  reviewAfterDays: 30,
};

function area() {
  return chrome.storage.local;
}

async function get(key, fallback) {
  const bag = await area().get(key);
  return bag[key] ?? fallback;
}

async function set(key, value) {
  await area().set({ [key]: value });
}

export async function getSettings() {
  const stored = await get(SETTINGS_KEY, {});
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(patch) {
  const next = { ...(await getSettings()), ...patch };
  await set(SETTINGS_KEY, next);
  return next;
}

export async function listSubscriptions() {
  const items = await get(SUBS_KEY, []);
  return Array.isArray(items) ? items : [];
}

export async function getSubscription(id) {
  const items = await listSubscriptions();
  return items.find((item) => item.id === id) ?? null;
}

export async function upsertSubscription(input) {
  const items = await listSubscriptions();
  const now = new Date().toISOString();
  const existing = input.id ? items.find((item) => item.id === input.id) : null;
  const record = {
    id: existing?.id ?? createId(),
    name: String(input.name || "").trim(),
    amount: Number(input.amount) || 0,
    currency: String(input.currency || "PLN").toUpperCase(),
    interval: input.interval || "monthly",
    intervalDays: Number(input.intervalDays) || 30,
    nextRenewal: input.nextRenewal || "",
    status: input.status || "active",
    category: String(input.category || "").trim(),
    notes: String(input.notes || "").trim(),
    source: existing?.source ?? input.source ?? "manual",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    lastReviewedAt: input.lastReviewedAt ?? existing?.lastReviewedAt ?? now,
  };
  const next = existing
    ? items.map((item) => (item.id === record.id ? record : item))
    : [...items, record];
  await set(SUBS_KEY, next);
  return record;
}

export async function removeSubscription(id) {
  const items = await listSubscriptions();
  await set(
    SUBS_KEY,
    items.filter((item) => item.id !== id),
  );
}

export async function markReviewed(id) {
  const item = await getSubscription(id);
  if (!item) return null;
  return upsertSubscription({ ...item, lastReviewedAt: new Date().toISOString() });
}

export async function replaceAll(subscriptions, settings) {
  await set(SUBS_KEY, subscriptions);
  if (settings) await set(SETTINGS_KEY, { ...DEFAULT_SETTINGS, ...settings });
}

export async function exportBackup() {
  const [subscriptions, settings] = await Promise.all([
    listSubscriptions(),
    getSettings(),
  ]);
  return {
    wheresub: 1,
    exportedAt: new Date().toISOString(),
    settings,
    subscriptions,
  };
}

export async function importBackup(payload) {
  if (!payload || payload.wheresub !== 1 || !Array.isArray(payload.subscriptions)) {
    throw new Error("This file is not a WhereSub backup.");
  }
  await replaceAll(payload.subscriptions, payload.settings);
}

export async function wipeAll() {
  await area().clear();
}
