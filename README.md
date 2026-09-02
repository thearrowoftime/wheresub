# WhereSub

A privacy-first browser extension for tracking subscriptions.

WhereSub is a **local ledger**, not a scanner. You add what you pay for. The
extension converts those entries into weekly, monthly, and yearly totals and
reminds you when something is about to renew. It never reads mail, history,
cookies, or bank pages, and it never uploads your data.

This repository is private. The product is meant to stay on your machine.

## Principles

- Data is created only when you type it, pick a preset, or import a JSON file.
- Storage is `chrome.storage.local` on this browser profile.
- Permissions are only `storage` and `alarms`.
- No account, no backend, no host permissions, no content scripts.

## Features (v0.1)

- Manual add / edit / delete
- Product presets (you still type the price you actually pay)
- Weekly / monthly / yearly totals per currency
- Upcoming renewals and a toolbar badge
- “Needs review” for entries you have not confirmed recently
- Local JSON export and import
- One-click wipe of all local data

## Load unpacked (Chrome / Edge / Brave)

1. Open `chrome://extensions` (or the equivalent page in Edge/Brave).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this repository folder (the one that contains `manifest.json`).
4. Pin WhereSub on the toolbar. Open **Open ledger** from the popup for the full view.

Firefox support can be added later; this MVP targets Manifest V3 Chromium browsers.

## How to use it

1. Add a subscription in the popup (name, amount, cycle) or in the ledger.
2. Optionally set the next renewal date so the badge and upcoming list work.
3. Once a month, filter by **Unreviewed** and confirm you still want each item.
4. Keep a JSON backup somewhere you control (encrypted disk, password manager, etc.).

## What is intentionally missing

Automatic detection from Gmail, banks, or merchant billing pages would make
the extension more convenient and would also make it a privacy product in
name only. Those sources are out of scope unless a later version can do them
entirely on-device, with an explicit user action, and without extra host
permissions by default.

## Repository layout

```
manifest.json          Chromium Manifest V3
src/background.js      Local badge refresh
src/popup.*            Quick add + totals
src/dashboard.*        Full ledger
src/privacy.html       In-extension privacy page
src/lib/               Storage, money math, presets
icons/                 Toolbar icons
PRIVACY.md             Privacy notes for the repo
```

## Privacy

See [PRIVACY.md](PRIVACY.md). Short version: nothing leaves the device.

## License

Private repository. All rights reserved.
