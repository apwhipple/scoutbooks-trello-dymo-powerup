# Trello → DYMO LabelWriter 450 Power-Up

A private Trello Power-Up that prints two label styles from a card, straight to a
DYMO LabelWriter 450 on the 1" × 2‑1/8" roll (DYMO **30336** "Multi-Purpose").

It reads the order number and client name from the card title:

```
19711 (SKINNER) | 1A* | POCKET | 55 | COVER - KRAFT | BLUE | GRAPH | ...
└─┬─┘ └──┬──┘
  │      client name  = first parentheses
  order number        = leading digits
```

## The two buttons

| Button | Behaviour |
|---|---|
| **Archive Label** | Parses the title and prints one label immediately (order #, client name, today's date). Toast confirms success/failure — no popup. |
| **Box Labels** | Popup asks how many boxes, then prints one label per box: `Box 1 of N`, `Box 2 of N`, … Each is a separate print job (the text differs per label, so the SDK's "copies" option can't be used). |

## File map

| Path | Purpose |
|---|---|
| `connector.html` | Hidden iframe Trello loads on every card; registers the two card buttons. **This is the Iframe connector URL.** |
| `popup-box.html` / `popup-box.js` | The box-count popup. |
| `dymo-print.js` | Shared printing logic — framework init, environment check, printer lookup, template fill + print. |
| `card-title.js` | The single shared title parser (`CardTitle.parse`). |
| `labels/ArchiveLabel.label`, `labels/BoxLabel.label` | DYMO Connect label templates for the 30336 roll. Text objects are filled by **name**: `OrderNumber`, `ClientName`, `PrintDate` / `OrderNumber`, `BoxCount`. |
| `vendor/dymo.connect.framework.js` | Vendored DYMO Connect SDK (must be same-origin). See `vendor/README.md`. |
| `assets/icon.svg` | Power-Up + card-button icon. |
| `test/test.html`, `test/dymo-mock.js` | Hardware-free test harness. |
| `docs/` | Install and format guides. |

## Setup

1. **Trello side** (host it, register the Power-Up):
   [docs/INSTALL-TRELLO.md](docs/INSTALL-TRELLO.md)
2. **Each printing machine** (DYMO Connect, certificate, printer):
   [docs/INSTALL-PRINTING-MACHINE.md](docs/INSTALL-PRINTING-MACHINE.md)
3. **Card title format** and how to change it:
   [docs/TITLE-FORMAT.md](docs/TITLE-FORMAT.md)

## Testing without a printer

The mock harness swaps the real SDK for a fake that renders each label on the
page instead of printing — no DYMO Connect, no hardware.

```bash
python3 -m http.server 8000
open http://localhost:8000/test/test.html
```

Try: the default title (prints an archive label + N box labels), a box count,
and a title with no leading `NNNNN (NAME)` (should error, print nothing).

## Refining the label layout

The `.label` files are hand-written starters that print correctly. To adjust
fonts/positions, open one in **DYMO Connect**, edit, then **File → Save As** over
the same filename — keeping each text object's **Name** unchanged. Commit and
redeploy.
