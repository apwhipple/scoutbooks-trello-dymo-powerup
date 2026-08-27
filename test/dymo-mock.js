/*
 * Fake DYMO backend for hardware-free testing. Load this BEFORE dymo-print.js.
 * It installs window.__DYMO_BACKEND__, which dymo-print.js uses instead of the
 * real SDK. Every "print" is parsed, validated against the template's declared
 * object names, rendered as a preview, and logged on the page.
 *
 * This file is only referenced by test/test.html — production HTML never loads it.
 */
(function () {
  function el(id) { return document.getElementById(id); }

  function templateObjectNames(xml) {
    var doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) {
      throw new Error('Label template is not valid XML');
    }
    var names = [];
    var nodes = doc.getElementsByTagName('Name');
    for (var i = 0; i < nodes.length; i++) names.push(nodes[i].textContent.trim());
    if (!names.length) throw new Error('Label template declares no named objects');
    return names;
  }

  window.__DYMO_BACKEND__ = {
    init: function () { return Promise.resolve(); },

    checkEnvironment: function () { return Promise.resolve({ isWebServicePresent: true, mock: true }); },

    getPrinterName: function () { return 'Mock LabelWriter 450'; },

    printLabelXml: function (xml, printerName, fields) {
      var declared = templateObjectNames(xml);
      Object.keys(fields).forEach(function (name) {
        if (declared.indexOf(name) === -1) {
          throw new Error('Template has no object named "' + name + '" (has: ' + declared.join(', ') + ')');
        }
      });

      var card = document.createElement('div');
      card.className = 'label-preview';
      card.innerHTML = Object.keys(fields).map(function (k) {
        return '<div><span class="k">' + k + '</span>' +
               '<span class="v">' + String(fields[k]).replace(/</g, '&lt;') + '</span></div>';
      }).join('');
      el('previews').prepend(card);

      var line = document.createElement('div');
      line.textContent = '[' + new Date().toLocaleTimeString() + '] print → ' +
        printerName + '  ' + JSON.stringify(fields);
      el('log').prepend(line);
    }
  };
})();
