/*
 * Shared card-title parser. Loaded by connector.html, popup-box.html and the
 * test harness so the title contract lives in exactly one place.
 *
 * Contract (see docs/TITLE-FORMAT.md):
 *
 *   19711 (SKINNER) | 1A* | POCKET | 55 | COVER - KRAFT | BLUE | GRAPH | ...
 *   ^^^^^  ^^^^^^^
 *   |      client name  = text inside the first parentheses
 *   order number        = digits at the very start of the title
 */
(function (global) {
  // group 1 = order number, group 2 = client name
  var TITLE_PATTERN = /^\s*(\d+)\s*\(([^)]+)\)/;

  function parseCardTitle(title) {
    var m = (title || '').match(TITLE_PATTERN);
    if (!m) return null;
    return {
      orderNumber: m[1],
      clientName: m[2].trim()
    };
  }

  global.CardTitle = {
    PATTERN: TITLE_PATTERN,
    parse: parseCardTitle
  };
})(this);
