# Privacy

WhereSub is designed so that a stranger inspecting the source and the
Chrome permission prompt should reach the same conclusion: this extension
cannot see your life. It can only store a list you wrote.

## Data that exists

- Subscription fields you enter: name, amount, currency, cycle, renewal date, status, category, notes
- Settings: default currency, reminder window, review interval
- Derived UI state only (badge count)

All of it is stored in `chrome.storage.local` for the current browser profile.

## Data that does not exist

WhereSub does not collect, infer, or transmit:

- email contents or mailbox metadata
- browsing history, cookies, or open tabs
- bank, card, or merchant account pages
- identifiers that would let a server recognize you
- crash or usage analytics

There is no WhereSub backend in this version. Export and import are local file operations.

## Permissions

| Permission | Why |
| --- | --- |
| `storage` | Save the ledger on this device |
| `alarms` | Refresh the toolbar badge a few times a day |

There are no `host_permissions`, no content scripts, and no identity / OAuth scopes.

## Your controls

- Export a JSON backup from the ledger
- Import a JSON backup (replaces local data)
- Delete a single row
- Delete all local data
- Uninstall the extension (the browser then drops `chrome.storage.local` for it)

## Threat model (honest)

Local storage is as private as the browser profile that holds it. Anyone who
can use this Chrome/Edge/Brave profile can open WhereSub and read the list.
Syncing that profile through the browser vendor is outside WhereSub’s control.
If you need a copy off this machine, export JSON and store it yourself.

## Changes to this policy

If a future version ever talks to a network, that must be opt-in, documented
here first, and visible in the permission prompt. Silent telemetry is not an
acceptable trade for convenience.
