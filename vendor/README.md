# vendor/

## dymo.connect.framework.js

Vendored copy of the DYMO Connect Framework for JavaScript. It must be served
from the same origin as the rest of the Power-Up, so it lives in the repo rather
than being pulled from a CDN at runtime.

- Source: https://github.com/dymosoftware/dymo-connect-framework
- File: `dymo.connect.framework.js` (from repo root)
- Commit: `2182e505e334663bf79a48dea24800f2aebcfa98` (master, retrieved 2026-08-27)

### Updating

```bash
curl -sL -o vendor/dymo.connect.framework.js \
  https://raw.githubusercontent.com/dymosoftware/dymo-connect-framework/master/dymo.connect.framework.js
```

Then update the commit hash above and re-run the mock test page
(`test/test.html`) before deploying.

### API notes (why `dymo-print.js` looks the way it does)

- `dymo.label.framework.init(cb)` — `cb` fires once the framework finishes
  async initialization. Must complete **before** anything else is called.
- `dymo.label.framework.checkEnvironment(cb, errCb)` — callback style in this
  build (older docs show a synchronous return; don't rely on it).
- `dymo.label.framework.getLabelWriterPrinters()` — synchronous, returns an
  array. `getLabelWriterPrintersAsync()` / `getPrintersAsync()` also exist.
- `dymo.label.framework.openLabelXml(xml)` → label instance with
  `.setObjectText(name, value)` and `.print(printerName)`.
