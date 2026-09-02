import { PRESETS } from "./lib/presets.js";
import {
  exportBackup,
  getSettings,
  importBackup,
  listSubscriptions,
  markReviewed,
  removeSubscription,
  saveSettings,
  upsertSubscription,
  wipeAll,
} from "./lib/storage.js";
import {
  currenciesIn,
  daysUntil,
  formatMoney,
  isUnreviewed,
  normalize,
  totalsFor,
} from "./lib/money.js";

const rowsEl = document.getElementById("rows");
const emptyEl = document.getElementById("table-empty");
const heroEl = document.getElementById("hero-totals");
const editor = document.getElementById("editor");
const editorTitle = document.getElementById("editor-title");
const presetEl = document.getElementById("preset");
const customDaysWrap = document.getElementById("custom-days-wrap");
const settingsForm = document.getElementById("settings");
const statusFilter = document.getElementById("filter-status");
const currencyFilter = document.getElementById("filter-currency");

function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function fillEditor(item = {}) {
  editorTitle.textContent = item.id ? "Edit subscription" : "Add subscription";
  editor.elements.id.value = item.id || "";
  editor.elements.name.value = item.name || "";
  editor.elements.amount.value = item.amount ?? "";
  editor.elements.currency.value = item.currency || currencyFilter.value || "PLN";
  editor.elements.interval.value = item.interval || "monthly";
  editor.elements.intervalDays.value = item.intervalDays || 30;
  editor.elements.nextRenewal.value = item.nextRenewal || "";
  editor.elements.status.value = item.status || "active";
  editor.elements.category.value = item.category || "";
  editor.elements.notes.value = item.notes || "";
  customDaysWrap.hidden = editor.elements.interval.value !== "custom";
}

function renewalLabel(item) {
  const days = daysUntil(item.nextRenewal);
  if (days === null) return "—";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "today";
  return `${item.nextRenewal} (${days}d)`;
}

function matchesFilter(item, status, reviewAfterDays) {
  if (status === "all") return true;
  if (status === "unreviewed") return item.status !== "cancelled" && isUnreviewed(item, reviewAfterDays);
  if (status === "active") return item.status === "active" || item.status === "trial";
  return item.status === status;
}

async function render() {
  const [items, settings] = await Promise.all([listSubscriptions(), getSettings()]);
  const currencies = currenciesIn(items);
  const selectedCurrency = currencyFilter.value || settings.defaultCurrency;
  const currencyOptions = [...new Set([settings.defaultCurrency, ...currencies])];
  currencyFilter.innerHTML = currencyOptions
    .map((code) => `<option value="${code}">${code}</option>`)
    .join("");
  currencyFilter.value = currencyOptions.includes(selectedCurrency)
    ? selectedCurrency
    : settings.defaultCurrency;

  const totals = totalsFor(items, currencyFilter.value);
  heroEl.innerHTML = ["weekly", "monthly", "yearly"]
    .map(
      (key) =>
        `<div><dt>${key}</dt><dd>${formatMoney(totals[key], currencyFilter.value)}</dd></div>`,
    )
    .join("");

  const visible = items
    .filter((item) => item.currency === currencyFilter.value)
    .filter((item) => matchesFilter(item, statusFilter.value, settings.reviewAfterDays))
    .sort((a, b) => a.name.localeCompare(b.name));

  emptyEl.hidden = visible.length > 0;
  rowsEl.innerHTML = visible
    .map((item) => {
      const monthly = normalize(item.amount, item.interval, item.intervalDays).monthly;
      const unreviewed = isUnreviewed(item, settings.reviewAfterDays);
      const days = daysUntil(item.nextRenewal);
      return `<tr data-id="${item.id}">
        <td class="name-cell">${item.name}<small>${item.status}${unreviewed ? " · needs review" : ""}</small></td>
        <td>${item.interval}${item.interval === "custom" ? ` / ${item.intervalDays}d` : ""}</td>
        <td>${formatMoney(item.amount, item.currency)}</td>
        <td>${formatMoney(monthly, item.currency)}</td>
        <td class="${days !== null && days < 0 ? "overdue" : ""}">${renewalLabel(item)}</td>
        <td>
          <button type="button" data-act="edit">Edit</button>
          <button type="button" class="ghost" data-act="review">Reviewed</button>
          <button type="button" class="ghost" data-act="delete">Delete</button>
        </td>
      </tr>`;
    })
    .join("");

  settingsForm.elements.defaultCurrency.value = settings.defaultCurrency;
  settingsForm.elements.reminderDays.value = settings.reminderDays;
  settingsForm.elements.reviewAfterDays.value = settings.reviewAfterDays;
  if (!editor.elements.currency.value) {
    editor.elements.currency.value = settings.defaultCurrency;
  }
}

presetEl.innerHTML += PRESETS.map(
  (preset) => `<option value="${preset.name}">${preset.name}</option>`,
).join("");

presetEl.addEventListener("change", () => {
  const preset = PRESETS.find((item) => item.name === presetEl.value);
  if (!preset) return;
  editor.elements.name.value = preset.name;
  editor.elements.interval.value = preset.interval;
  editor.elements.category.value = preset.category;
  customDaysWrap.hidden = true;
});

editor.elements.interval.addEventListener("change", () => {
  customDaysWrap.hidden = editor.elements.interval.value !== "custom";
});

editor.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = formValues(editor);
  await upsertSubscription({
    ...data,
    source: data.id ? undefined : presetEl.value ? "preset" : "manual",
  });
  fillEditor();
  presetEl.value = "";
  await render();
});

document.getElementById("reset-editor").addEventListener("click", () => {
  fillEditor();
  presetEl.value = "";
});

rowsEl.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-act]");
  if (!button) return;
  const id = button.closest("tr").dataset.id;
  const items = await listSubscriptions();
  const item = items.find((row) => row.id === id);
  if (!item) return;
  if (button.dataset.act === "edit") {
    fillEditor(item);
    editor.scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (button.dataset.act === "review") {
    await markReviewed(id);
    await render();
  } else if (button.dataset.act === "delete") {
    if (confirm(`Delete ${item.name} from this device?`)) {
      await removeSubscription(id);
      await render();
    }
  }
});

statusFilter.addEventListener("change", render);
currencyFilter.addEventListener("change", render);

settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await saveSettings(formValues(settingsForm));
  await render();
});

document.getElementById("export-btn").addEventListener("click", async () => {
  const backup = await exportBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `wheresub-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

document.getElementById("import-file").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    await importBackup(payload);
    await render();
  } catch (error) {
    alert(error.message || "Could not import that file.");
  } finally {
    event.target.value = "";
  }
});

document.getElementById("wipe").addEventListener("click", async () => {
  if (!confirm("Delete every subscription and setting stored in this browser profile?")) return;
  await wipeAll();
  fillEditor();
  await render();
});

(async function init() {
  const settings = await getSettings();
  fillEditor({ currency: settings.defaultCurrency });
  await render();
})();
