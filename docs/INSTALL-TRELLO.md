# Install — Trello side (hosting + registering the Power-Up)

## What lives where

The Power-Up code **does not live on Trello**. Trello stores exactly one thing:
the **Iframe connector URL**. It loads that URL (`connector.html`) in a hidden
iframe on every card, and that page registers the two card buttons. So the job
is: host this folder over HTTPS, then point Trello at it.

This is a **private, workspace-only** Power-Up — no marketplace submission or
review.

## 1. Put the repo on GitHub

```bash
git init
git add .
git commit -m "Trello DYMO Power-Up"
git branch -M main
git remote add origin git@github.com:<you>/scoutbooks-trello-dymo-powerup.git
git push -u origin main
```

## 2. Enable GitHub Pages

1. GitHub repo → **Settings** → **Pages**.
2. **Build and deployment** → Source: **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)** → **Save**.
4. Wait ~1 min. Pages shows a URL like
   `https://<you>.github.io/scoutbooks-trello-dymo-powerup/`.

Verify these open in a browser:

- `https://<you>.github.io/scoutbooks-trello-dymo-powerup/connector.html`
  (blank page, no errors in the console)
- `.../labels/ArchiveLabel.label` (shows XML)
- `.../vendor/dymo.connect.framework.js` (shows JS)

That base URL + `connector.html` is your **connector URL**.

## 3. Register the Power-Up

1. Go to <https://trello.com/power-ups/admin> (or `trello.com/apps/admin`).
2. Pick your **Workspace** → **New**.
3. Name it (e.g. "DYMO Labels"), set the workspace, create.
4. **Iframe connector URL** →
   `https://<you>.github.io/scoutbooks-trello-dymo-powerup/connector.html`
5. **Capabilities** tab → enable **card-buttons**.
6. **Basic information** → upload an icon — use `assets/icon.svg` from this repo
   (or any square PNG/SVG).

## 4. Enable it on a board

On any board in that workspace: **Power-Ups** → **Custom** tab → find this
Power-Up → **Add**.

Open a card whose title starts with `<order#> (CLIENT) | ...` — the **Archive
Label** and **Box Labels** buttons appear in the card's button list.

## 5. Set up each machine that will print

Printing only works from a computer running DYMO Connect with a LabelWriter
attached. See [INSTALL-PRINTING-MACHINE.md](INSTALL-PRINTING-MACHINE.md).

## Updating later

Push to `main`; GitHub Pages redeploys within a minute. In Trello, hard-refresh
the board (Cmd/Ctrl-Shift-R) to drop the cached iframe. No changes needed in the
Power-Up admin unless you rename/move `connector.html`.

## Testing changes before deploy

Run the mock harness locally — no Trello, no printer:

```bash
python3 -m http.server 8000
open http://localhost:8000/test/test.html
```

See [../README.md](../README.md#testing-without-a-printer).
