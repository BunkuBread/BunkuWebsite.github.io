const cart = {};

function updateCartSummary() {
  let count = Object.values(cart).reduce((a, b) => a + b.qty, 0);
  let total = Object.values(cart).reduce((a, b) => a + b.qty * b.price, 0);

  if (document.getElementById('extra_garlic_og')?.checked) total += 5;
  if (document.getElementById('extra_garlic_zaatar')?.checked) total += 5;
  if (document.getElementById('extra_choc_diabetes')?.checked) total += 5;

  const deliveryRadio = document.querySelector('input[name="modal_order_type"]:checked');
  if (deliveryRadio && deliveryRadio.value === 'delivery') total += 35;

  document.getElementById('cartSummary').innerHTML = `Cart: ${count} item${count !== 1 ? 's' : ''} <span id="cartTotal">${total} AED</span>`;
}

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
    cart[name] = { qty, price };
    updateCartSummary();
  };
});

const orderModal = document.getElementById('orderModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalDeliveryForm = document.getElementById('modalDeliveryForm');
const modalPickupForm = document.getElementById('modalPickupForm');
const modalOrderTypeRadios = orderModal.querySelectorAll('input[name="modal_order_type"]');
const modalBasket = document.getElementById('modalBasket');
const modalSubmitBtn = document.getElementById('modalSubmitBtn');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const checkoutBtn = document.getElementById('checkoutBtn');

function populateBasketSummary() {
  modalBasket.innerHTML = '';
  let total = 0;
  Object.entries(cart).forEach(([key, val]) => {
    total += val.qty * val.price;
    const li = document.createElement('li');
    li.textContent = `${key}: ${val.qty} box(es)`;
    modalBasket.appendChild(li);
  });

  if (document.getElementById('extra_garlic_og')?.checked) {
    total += 5;
    const li = document.createElement('li');
    li.textContent = `Extra garlic sauce (Bunku OG): +5 AED`;
    modalBasket.appendChild(li);
  }
  if (document.getElementById('extra_garlic_zaatar')?.checked) {
    total += 5;
    const li = document.createElement('li');
    li.textContent = `Extra garlic sauce (Zaatar Bomb): +5 AED`;
    modalBasket.appendChild(li);
  }
  if (document.getElementById('extra_choc_diabetes')?.checked) {
    total += 5;
    const li = document.createElement('li');
    li.textContent = `Extra chocolate sauce (Diabetes): +5 AED`;
    modalBasket.appendChild(li);
  }

  const deliveryRadio = document.querySelector('input[name="modal_order_type"]:checked');
  if (deliveryRadio && deliveryRadio.value === 'delivery') {
    total += 35;
    const li = document.createElement('li');
    li.textContent = `Delivery fee: +35 AED`;
    modalBasket.appendChild(li);
  }

  const totalLi = document.createElement('li');
  totalLi.textContent = `Total: ${total} AED`;
  totalLi.style.fontWeight = 'bold';
  modalBasket.appendChild(totalLi);
}

function updateModalForm() {
  const selectedType = Array.from(modalOrderTypeRadios).find(r => r.checked).value;
  if(selectedType === 'delivery'){
    modalDeliveryForm.classList.add('active');
    modalPickupForm.classList.remove('active');
    document.getElementById('googleMapContainer').style.display = 'block';
    modalDeliveryForm.querySelectorAll('input').forEach(i => i.required = true);
    modalPickupForm.querySelectorAll('input').forEach(i => i.required = false);
  } else {
    modalDeliveryForm.classList.remove('active');
    modalPickupForm.classList.add('active');
    document.getElementById('googleMapContainer').style.display = 'none';
    modalDeliveryForm.querySelectorAll('input').forEach(i => i.required = false);
    modalPickupForm.querySelectorAll('input').forEach(i => i.required = true);
  }
  updateCartSummary();
}

modalOrderTypeRadios.forEach(radio => radio.addEventListener('change', () => {
  updateModalForm();
  populateBasketSummary();
}));

function closeModal() {
  orderModal.setAttribute('aria-hidden', 'true');
  modalDeliveryForm.reset();
  modalPickupForm.reset();
}

checkoutBtn.addEventListener('click', () => {
  if (Object.values(cart).reduce((a, b) => a + b.qty, 0) < 1) {
    alert('Add at least one product to cart.');
    return;
  }
  populateBasketSummary();
  updateModalForm();
  orderModal.setAttribute('aria-hidden', 'false');
});

modalCloseBtn.addEventListener('click', closeModal);
modalCancelBtn.addEventListener('click', closeModal);
window.addEventListener('click', e => {
  if(e.target === orderModal){
    closeModal();
  }
});

modalSubmitBtn.addEventListener('click', () => {
  const selectedType = Array.from(modalOrderTypeRadios).find(r => r.checked).value;
  let msg = `Hello! I placed a ${selectedType} order:\n\n`;

  if(selectedType === 'delivery'){
    const name = modalDeliveryForm.querySelector('#modalDeliveryName').value.trim();
    const phone = modalDeliveryForm.querySelector('#modalDeliveryPhone').value.trim();
    const date = modalDeliveryForm.querySelector('#modalDeliveryDate').value;
    const city = modalDeliveryForm.querySelector('#modalDeliveryCity').value.trim();
    const area = modalDeliveryForm.querySelector('#modalDeliveryArea').value.trim();
    const time = modalDeliveryForm.querySelector('#modalDeliveryTime').value;

    if(!name || !phone || !date || !city || !area || !time){
      alert('Please fill all delivery details.');
      return;
    }

    msg += `Name: ${name}\nPhone: ${phone}\nDate: ${date}\nCity: ${city}\nArea: ${area}\nTime: ${time}\n\n`;
  } else {
    const name = modalPickupForm.querySelector('#modalPickupName').value.trim();
    const phone = modalPickupForm.querySelector('#modalPickupPhone').value.trim();
    const date = modalPickupForm.querySelector('#modalPickupDate').value;
    const licensePlate = modalPickupForm.querySelector('#modalPickupLicense').value.trim();
    const time = modalPickupForm.querySelector('#modalPickupTime').value;

    if(!name || !phone || !date || !licensePlate || !time){
      alert('Please fill all pickup details.');
      return;
    }

    msg += `Name: ${name}\nPhone: ${phone}\nDate: ${date}\nLicense Plate: ${licensePlate}\nTime: ${time}\n\n`;
  }

  msg += `Orders:\n`;
  let total = 0;
  Object.entries(cart).forEach(([key, val]) => {
    total += val.qty * val.price;
    msg += `${key}: ${val.qty} box(es)\n`;
  });

  if(document.getElementById('extra_garlic_og')?.checked){
    msg += "Extra garlic sauce (Bunku OG): Yes (+5 AED)\n";
  }
  if(document.getElementById('extra_garlic_zaatar')?.checked){
    msg += "Extra garlic sauce (Zaatar Bomb): Yes (+5 AED)\n";
  }
  if(document.getElementById('extra_choc_diabetes')?.checked){
    msg += "Extra chocolate sauce (Diabetes): Yes (+5 AED)\n";
  }
  if(selectedType === 'delivery'){
    msg += "Delivery Fee: +35 AED\n";
    total += 35;
  }

  msg += `\nTotal: ${total} AED`;

  fetch("https://cloud.activepieces.com/api/v1/webhooks/LI2vLphGyGdkLIbL0wH2U/sync", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      order_type: selectedType,
      details: msg,
      cart: cart
    }),
  })
  .then(() => {
    window.open(`https://wa.me/971544588113?text=${encodeURIComponent(msg)}`, '_blank');
    console.log("Order sent to Activepieces");
    closeModal();
  })
  .catch(e => {
    console.error("Activepieces webhook error:", e);
    alert("Failed to send order. Please try again.");
  });
});

updateCartSummary();
