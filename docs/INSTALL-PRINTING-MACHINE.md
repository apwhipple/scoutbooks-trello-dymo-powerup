# Install — each printing machine

Every computer that will actually print labels needs this one-time setup. The
browser talks to a small local service that DYMO Connect runs; it never prints
straight from Trello's servers.

## 1. Install DYMO Connect + the printer

1. Install **DYMO Connect for Desktop** (not the older "DYMO Label" app):
   <https://www.dymo.com/support>
2. Plug in and power on the **DYMO LabelWriter 450**. Load the **30336
   Multi-Purpose** roll (1" × 2‑1/8").
3. Open DYMO Connect and print any label from the app itself once. If that
   fails, fix it here first — nothing downstream will work until it does.

## 2. Accept the local service certificate (per browser)

DYMO Connect runs a background web service on `https://127.0.0.1:41951` with a
self-signed certificate. Until the browser has accepted it, print calls fail
**silently**.

In the same browser you'll use for Trello:

1. Visit <https://127.0.0.1:41951/DYMO/DLS/Printing/Check>
   (also try <https://localhost:41951/DYMO/DLS/Printing/Check>).
2. Click through the security warning ("Advanced" → "proceed").
3. You should see a short text response like `true`.

Repeat for every browser/profile that will be used for printing.

## 3. Print

Open the Trello board, open a card, click **Archive Label** or **Box Labels**.

- **Archive Label** — parses the title, prints one label immediately, shows a
  toast.
- **Box Labels** — popup asks how many boxes, then prints one label per box
  (`Box 1 of N` … `Box N of N`), ~0.4 s apart.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `DYMO Connect is not running (or its certificate has not been accepted…)` | DYMO Connect app not running, **or** step 2 not done in *this* browser. Reopen the app; redo the certificate step. |
| `No DYMO LabelWriter found. Is it plugged in and turned on?` | USB unplugged, printer off, or driver missing. Check it appears in DYMO Connect. |
| Button gives a success toast but nothing prints | Certificate accepted for a *different* browser/profile than the one in use. Redo step 2 here. |
| Text runs off the edge of the label | Widen/enlarge the text objects in DYMO Connect — open `labels/ArchiveLabel.label` (or `BoxLabel.label`), adjust, **File → Save As** over the same filename, keep the object **Names** (`OrderNumber`, `ClientName`, `PrintDate` / `BoxCount`). Commit and redeploy. |
| Only one box label prints when you asked for several | Spooler is merging jobs. Increase `BOX_PRINT_GAP_MS` in `dymo-print.js` (try 800), redeploy. |
| Wrong printer used (multiple DYMOs) | `dymo-print.js` prefers a printer whose name contains `450`, else the first one. Rename the target printer in Windows/macOS print settings to include `450`. |

## Notes

- Works in Chrome, Edge, Firefox, Safari — anywhere DYMO Connect's service +
  accepted cert are reachable.
- The label templates are designed against the **30336** roll. A different roll
  needs new templates built in DYMO Connect (same object names).
