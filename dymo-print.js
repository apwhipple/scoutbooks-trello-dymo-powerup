/*
 * Shared DYMO printing logic used by the Archive Label button (connector.html),
 * the Box Labels popup (popup-box.js) and the mock test harness (test/test.html).
 *
 * Requires vendor/dymo.connect.framework.js to be loaded first, and DYMO Connect
 * to be installed + running on the machine doing the printing.
 *
 * Label templates (labels/ArchiveLabel.label / labels/BoxLabel.label) are DYMO
 * Connect files — see README.md / docs for the text-object names that
 * setObjectText() below fills in.
 *
 * Testing without hardware: load test/dymo-mock.js BEFORE this file. It sets
 * window.__DYMO_BACKEND__, which replaces every call into the real SDK below.
 */

var DymoPrint = (function () {

  // Delay between successive box-label print jobs. The LabelWriter 450 spooler
  // can merge or drop jobs fired back-to-back; a small gap makes each "Box n of
  // N" come out as its own label. Bump this in docs if a site still drops jobs.
  var BOX_PRINT_GAP_MS = 400;

  // ---- SDK backend -------------------------------------------------------
  // Everything that touches dymo.label.framework goes through this object so
  // the test harness can swap in a fake via window.__DYMO_BACKEND__.
  var realBackend = {
    init: function () {
      return new Promise(function (resolve) {
        var fw = dymo.label.framework;
        var done = false;
        var finish = function () { if (!done) { done = true; resolve(); } };
        try {
          // init(cb): cb fires when async framework setup completes. Give it
          // room — it probes several local ports before giving up.
          fw.init(finish);
        } catch (e) {
          finish();
        }
        // Fallback in case the callback never fires (older sync builds).
        setTimeout(finish, 8000);
      });
    },

    checkEnvironment: function () {
      // The service check ("is DYMO Connect reachable?") is the one that
      // matters. isBrowserSupported only goes false on the legacy-plugin
      // fallback path, which really means "couldn't reach the service" on any
      // modern browser — so don't lead with a scary browser message.
      var NOT_REACHABLE =
        'Cannot reach DYMO Connect on this computer. Check that:\n' +
        '  1. DYMO Connect for Desktop is installed and running, and\n' +
        '  2. you have opened https://127.0.0.1:41951 in this browser once\n' +
        '     and accepted the certificate.\n' +
        'See docs/INSTALL-PRINTING-MACHINE.md.';

      return new Promise(function (resolve, reject) {
        var fw = dymo.label.framework;
        var settled = false;
        var ok = function (env) {
          if (settled) return;
          settled = true;
          env = env || {};
          if (env.isWebServicePresent === false || env.isBrowserSupported === false) {
            var msg = NOT_REACHABLE;
            if (env.errorDetails) msg += '\n(' + env.errorDetails + ')';
            reject(new Error(msg));
          } else {
            resolve(env);
          }
        };
        try {
          var maybe = fw.checkEnvironment(ok, ok);
          // Older builds return the env object synchronously instead.
          if (maybe && typeof maybe.isWebServicePresent !== 'undefined') ok(maybe);
        } catch (e) {
          reject(e);
        }
        setTimeout(function () { ok({ isWebServicePresent: false }); }, 8000);
      });
    },

    getPrinterName: function () {
      var fw = dymo.label.framework;
      var printers = [];
      try {
        printers = fw.getLabelWriterPrinters() || [];
      } catch (e) { /* fall through to getPrinters */ }
      if (!printers.length && typeof fw.getPrinters === 'function') {
        printers = (fw.getPrinters() || []).filter(function (p) {
          return p && (p.printerType === 'LabelWriterPrinter' || /LabelWriter/i.test(p.name || ''));
        });
      }
      if (!printers.length) {
        throw new Error('No DYMO LabelWriter found. Is it plugged in and turned on?');
      }
      // Prefer a printer literally named "450", otherwise take the first one.
      for (var i = 0; i < printers.length; i++) {
        if ((printers[i].name || '').indexOf('450') !== -1) return printers[i].name;
      }
      return printers[0].name;
    },

    printLabelXml: function (xml, printerName, fields) {
      var label = dymo.label.framework.openLabelXml(xml);
      Object.keys(fields).forEach(function (name) {
        label.setObjectText(name, fields[name]);
      });
      label.print(printerName);
    }
  };

  function backend() {
    return (typeof window !== 'undefined' && window.__DYMO_BACKEND__) || realBackend;
  }

  // ---- init (memoised) --------------------------------------------------
  var initPromise = null;
  function ensureReady() {
    if (!initPromise) {
      initPromise = Promise.resolve()
        .then(function () { return backend().init(); })
        .then(function () { return backend().checkEnvironment(); })
        .catch(function (err) {
          initPromise = null; // let the next click retry
          throw err;
        });
    }
    return initPromise;
  }

  function loadTemplate(fileName) {
    return fetch(fileName).then(function (resp) {
      if (!resp.ok) throw new Error('Could not load label template: ' + fileName);
      return resp.text();
    });
  }

  // ---- public API -----------------------------------------------------
  function printArchiveLabel(parsed) {
    return ensureReady()
      .then(function () { return loadTemplate('labels/ArchiveLabel.label'); })
      .then(function (xml) {
        backend().printLabelXml(xml, backend().getPrinterName(), {
          OrderNumber: parsed.orderNumber,
          ClientName: parsed.clientName,
          PrintDate: new Date().toLocaleDateString()
        });
      });
  }

  // Prints one physical label per box: "Box 1 of 4", "Box 2 of 4", ...
  // Each label's text differs, so this can't use the SDK's "copies" param.
  function printBoxLabels(parsed, totalBoxes) {
    return ensureReady()
      .then(function () { return loadTemplate('labels/BoxLabel.label'); })
      .then(function (xml) {
        var printerName = backend().getPrinterName();

        function printOne(boxNumber) {
          backend().printLabelXml(xml, printerName, {
            OrderNumber: parsed.orderNumber,
            BoxCount: 'Box ' + boxNumber + ' of ' + totalBoxes
          });
        }

        var chain = Promise.resolve();
        for (var i = 1; i <= totalBoxes; i++) {
          (function (boxNumber) {
            chain = chain.then(function () {
              printOne(boxNumber);
              if (boxNumber < totalBoxes) {
                return new Promise(function (r) { setTimeout(r, BOX_PRINT_GAP_MS); });
              }
            });
          })(i);
        }
        return chain;
      });
  }

  return {
    printArchiveLabel: printArchiveLabel,
    printBoxLabels: printBoxLabels
  };
})();
