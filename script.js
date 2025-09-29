const cart = {};
function updateCartSummary() {
  let count = Object.values(cart).reduce((a, b) => a + b.qty, 0);
  let total = Object.values(cart).reduce((a, b) => a + b.qty * b.price, 0);
  document.getElementById(
    'cartSummary'
  ).innerHTML = `Cart: ${count} item${count !== 1 ? 's' : ''} <span id="cartTotal">${
    total ? `${total} AED` : ''
  }</span>`;
}

// Add to cart buttons handler
document.querySelectorAll('.add-cart').forEach((btn) => {
  btn.onclick = function () {
    const name = btn.getAttribute('data-name');
    const price = Number(btn.getAttribute('data-price'));
    const select = btn.parentElement.querySelector('.card-select');
    const qty = Number(select.value);
    if (qty < 1) {
      alert('Select at least one box.');
      return;
    }
    cart[name] = { qty: qty, price: price };
    updateCartSummary();
  };
});

// Delivery vs Pickup field toggle
const deliveryFieldsDiv = document.getElementById('deliveryFields');
const pickupFieldsDiv = document.getElementById('pickupFields');
const orderTypeRadios = document.querySelectorAll('input[name="order_type"]');

function updateOrderTypeFields() {
  const selectedType = document.querySelector('input[name="order_type"]:checked').value;
  if(selectedType === 'delivery'){
    deliveryFieldsDiv.style.display = 'block';
    pickupFieldsDiv.style.display = 'none';
    document.querySelectorAll('#deliveryFields input').forEach(input => input.required = true);
    document.querySelectorAll('#pickupFields input').forEach(input => input.required = false);
  } else {
    deliveryFieldsDiv.style.display = 'none';
    pickupFieldsDiv.style.display = 'block';
    document.querySelectorAll('#pickupFields input').forEach(input => input.required = true);
    document.querySelectorAll('#deliveryFields input').forEach(input => input.required = false);
  }
}
orderTypeRadios.forEach(radio => radio.addEventListener('change', updateOrderTypeFields));
updateOrderTypeFields();

document.getElementById('orderForm').onsubmit = function(e) {
  e.preventDefault();

  let count = Object.values(cart).reduce((a,b) => a + b.qty, 0);
  if(count < 1){
    alert('Add at least one product to cart.');
    return;
  }

  const selectedType = document.querySelector('input[name="order_type"]:checked').value;

  let msg = `Hello! I placed a ${selectedType} order:\n\n`;
  if(selectedType === 'delivery'){
    const name = document.getElementById('customerNameDelivery').value.trim();
    const phone = document.getElementById('phoneDelivery').value.trim();
    const date = document.getElementById('dateDelivery').value;
    const city = document.getElementById('cityDelivery').value.trim();
    const area = document.getElementById('areaDelivery').value.trim();
    const time = document.getElementById('timeDelivery').value;

    if(!name || !phone || !date || !city || !area || !time) {
      alert('Please fill all delivery details.');
      return;
    }

    msg += `Name: ${name}\nPhone: ${phone}\nDate: ${date}\nCity: ${city}\nArea: ${area}\nTime: ${time}\n\n`;

  } else {
    const name = document.getElementById('customerNamePickup').value.trim();
    const phone = document.getElementById('phonePickup').value.trim();
    const date = document.getElementById('datePickup').value;
    const licensePlate = document.getElementById('licensePlate').value.trim();
    const time = document.getElementById('timePickup').value;

    if(!name || !phone || !date || !licensePlate || !time) {
      alert('Please fill all pickup details.');
      return;
    }

    msg += `Name: ${name}\nPhone: ${phone}\nDate: ${date}\nLicense Plate: ${licensePlate}\nTime: ${time}\n\n`;
  }

  msg += `Orders:\n`;
  Object.keys(cart).forEach(k => {
    msg += `${k}: ${cart[k].qty} box(es)\n`;
  });

  msg += `\nTotal: ${Object.values(cart).reduce((a,b) => a + b.qty*b.price, 0)} AED`;

  window.open(`https://wa.me/971544588113?text=${encodeURIComponent(msg)}`, '_blank');

  // Replace your webhook url below
  fetch("YOUR_ACTIVEPIECES_WEBHOOK_URL_HERE", {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      order_type: selectedType,
      details: msg,
      cart: cart
    })
  }).then(() => console.log("Order sent to Activepieces"))
  .catch(e => console.error("Webhook error:", e));
};

updateCartSummary();
