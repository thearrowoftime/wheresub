/**
 * Local reminder worker. Reads only chrome.storage.local and never
 * contacts a network. The toolbar badge is the count of renewals in
 * the next seven days.
 */
import { listSubscriptions, getSettings } from "./lib/storage.js";
import { daysUntil } from "./lib/money.js";

const ALARM_NAME = "wheresub-daily";

async function refreshBadge() {
  const [items, settings] = await Promise.all([listSubscriptions(), getSettings()]);
  const windowDays = Number(settings.reminderDays) || 3;
  const soon = items.filter((item) => {
    if (item.status === "cancelled") return false;
    const days = daysUntil(item.nextRenewal);
    return days !== null && days >= 0 && days <= Math.max(windowDays, 7);
  });
  const count = String(soon.length);
  await chrome.action.setBadgeBackgroundColor({ color: "#1B3A4B" });
  await chrome.action.setBadgeText({ text: soon.length ? count : "" });
}

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.alarms.create(ALARM_NAME, { periodInMinutes: 60 * 12 });
  await refreshBadge();
});

chrome.runtime.onStartup.addListener(refreshBadge);
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) refreshBadge();
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.subscriptions || changes.settings)) {
    refreshBadge();
  }
});
