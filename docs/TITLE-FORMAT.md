# Card title format

Both buttons pull the order number and client name from the **card title**.

## The contract

```
19711 (SKINNER) | 1A* | POCKET | 55 | COVER - KRAFT | BLUE | GRAPH | ...
```

- **Order number** — the run of digits at the very start of the title.
- **Client name** — the text inside the **first** parentheses, trimmed.

Everything after that is ignored. The regex is
`/^\s*(\d+)\s*\(([^)]+)\)/` and lives in **one place**: [`card-title.js`](../card-title.js)
(`CardTitle.parse`). `connector.html`, `popup-box.js` and the test harness all
call it.

If a title doesn't match, the buttons show:
*"Could not find an order number / client name at the start of the title."*
and nothing prints.

## Changing where the values come from

### Different title positions
Edit the pattern in [`card-title.js`](../card-title.js) only. Keep `parse()`
returning `{ orderNumber, clientName }` and nothing else needs to change.

### From Custom Fields instead of the title
1. In `card-title.js`, replace `parse()` with a function that takes the card's
   custom-field items.
2. In `connector.html` and `popup-box.js`, request the fields and pass them in:

   ```js
   t.card('customFieldItems').then(function (card) {
     var parsed = CardTitle.fromCustomFields(card.customFieldItems);
     // ...
   });
   ```

3. Enable the `card-buttons` capability's access to custom fields is automatic;
   no extra capability needed for reading them via `t.card('customFieldItems')`.

The rest of the pipeline (`DymoPrint.printArchiveLabel` / `printBoxLabels`) is
unaffected — it only cares about `{ orderNumber, clientName }`.
