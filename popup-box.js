var t = TrelloPowerUp.iframe();

var statusEl = document.getElementById('status');
var qtyEl = document.getElementById('qty');
var btnEl = document.getElementById('printBtn');

function setStatus(msg, isError) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? '#c9372c' : '#216e4e';
}

btnEl.addEventListener('click', function () {
  var totalBoxes = parseInt(qtyEl.value, 10);
  if (!totalBoxes || totalBoxes < 1) {
    setStatus('Enter a number of boxes (1 or more).', true);
    return;
  }

  btnEl.disabled = true;
  setStatus('Printing...', false);

  t.card('name')
    .then(function (card) {
      var parsed = CardTitle.parse(card.name);
      if (!parsed) {
        throw new Error('Could not find an order number / client name at the start of the title.');
      }
      return DymoPrint.printBoxLabels(parsed, totalBoxes);
    })
    .then(function () {
      setStatus('Printed ' + totalBoxes + ' box label(s).', false);
      btnEl.disabled = false;
    })
    .catch(function (err) {
      setStatus('Print failed: ' + err.message, true);
      btnEl.disabled = false;
    });
});
