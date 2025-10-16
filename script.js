const cart = {};

function getDeliveryFee(city) {
  if (["Fujairah", "Ras Al Khaimah", "Abu Dhabi", "Al Ain"].includes(city)) {
    return 35;
  }
  return null;
}

function updateCartSummary() {
  let count = Object.values(cart).reduce((a, b) => a + b.qty, 0);
  let total = Object.values(cart).reduce((a, b) => a + b.qty * b.price, 0);

  if (document.getElementById('extra_garlic_og')?.checked) total += 5;
  if (document.getElementById('extra_garlic_zaatar')?.checked) total += 5;
  if (document.getElementById('extra_choc_diabetes')?.checked) total += 5;

  let deliveryFee = 0;
  const deliveryRadio = document.querySelector('input[name="modal_order_type"]:checked');
  if (deliveryRadio && deliveryRadio.value === 'delivery') {
    const citySelect = document.getElementById('modalDeliveryCity');
    const selectedCity = citySelect ? citySelect.value : "";
    deliveryFee = getDeliveryFee(selectedCity);
    if (deliveryFee) {
      total += deliveryFee;
    }
  }

  let deliveryText = "";
  if (deliveryRadio && deliveryRadio.value === 'delivery') {
    const citySelect = document.getElementById('modalDeliveryCity');
    const selectedCity = citySelect ? citySelect.value : "";
    if (getDeliveryFee(selectedCity)) {
      deliveryText = `+${deliveryFee} AED delivery`;
    } else if (selectedCity && selectedCity !== "") {
      deliveryText = "Delivery charge determined on checkout";
    }
  }

  document.getElementById('cartSummary').innerHTML =
    `Cart: ${count} item${count !== 1 ? 's' : ''} <span id="cartTotal">${total} AED</span>` +
    (deliveryText ? `<div class="delivery-note">${deliveryText}</div>` : "");
}

function updateCartItem(name, qty, price) {
  if (qty <= 0) {
    delete cart[name];
  } else {
    cart[name] = { qty, price };
  }
  updateCartSummary();
}

document.querySelectorAll('.qty-input').forEach(input => {
  input.addEventListener('input', (e) => {
    const name = e.target.dataset.name;
    let qty = Math.max(0, Math.min(10, parseInt(e.target.value) || 0));
    e.target.value = qty;
    const btnParent = e.target.closest('.product-card');
    const price = Number(btnParent.querySelector('.add-cart')?.getAttribute('data-price')) || 0;
    updateCartItem(name, qty, price);
  });
});

document.querySelectorAll('.qty-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const name = btn.dataset.name;
    const input = document.getElementById(`qty_${name.toLowerCase().replace(/ /g, '_')}`);
    if (!input) return;
    let qty = parseInt(input.value) || 0;
    if (btn.classList.contains('plus')) {
      if (qty < 10) qty++;
    } else {
      if (qty > 0) qty--;
    }
    input.value = qty;
    const price = Number(btn.parentElement.querySelector('.add-cart')?.getAttribute('data-price')) || 0;
    updateCartItem(name, qty, price);
  });
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
const modalDeliveryCity = document.getElementById('modalDeliveryCity');

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
    li.textContent = `Extra garlic sauce (OG Bunku): +5 AED`;
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
    const citySelect = document.getElementById('modalDeliveryCity');
    const selectedCity = citySelect ? citySelect.value : "";
    const deliveryFee = getDeliveryFee(selectedCity);
    if (deliveryFee) {
      total += deliveryFee;
      const li = document.createElement('li');
      li.textContent = `Delivery fee: +${deliveryFee} AED`;
      modalBasket.appendChild(li);
    } else if (selectedCity && selectedCity !== "") {
      const li = document.createElement('li');
      li.textContent = `Delivery charge determined on checkout`;
      modalBasket.appendChild(li);
    }
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
    modalDeliveryForm.querySelectorAll('input, select').forEach(i => i.required = true);
    modalPickupForm.querySelectorAll('input').forEach(i => i.required = false);
  } else {
    modalDeliveryForm.classList.remove('active');
    modalPickupForm.classList.add('active');
    modalDeliveryForm.querySelectorAll('input, select').forEach(i => i.required = false);
    modalPickupForm.querySelectorAll('input').forEach(i => i.required = true);
  }
  updateCartSummary();
}

modalOrderTypeRadios.forEach(radio => radio.addEventListener('change', () => {
  updateModalForm();
  populateBasketSummary();
}));

if (modalDeliveryCity) {
  modalDeliveryCity.addEventListener('change', () => {
    updateCartSummary();
    populateBasketSummary();
  });
}

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

function openWhatsAppDirect(url){
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isIOS && isSafari) {
    window.location.href = url;
  } else {
    window.open(url, '_blank');
  }
}

modalSubmitBtn.addEventListener('click', () => {
  const selectedType = Array.from(modalOrderTypeRadios).find(r => r.checked).value;
  let msg = `Hello! I placed a ${selectedType} order:\n\n`;

  if(selectedType === 'delivery'){
    const name = modalDeliveryForm.querySelector('#modalDeliveryName').value.trim();
    const phone = modalDeliveryForm.querySelector('#modalDeliveryPhone').value.trim();
    const date = modalDeliveryForm.querySelector('#modalDeliveryDate').value;
    const city = modalDeliveryForm.querySelector('#modalDeliveryCity').value;
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
    msg += "Extra garlic sauce (OG Bunku): Yes (+5 AED)\n";
    total += 5;
  }
  if(document.getElementById('extra_garlic_zaatar')?.checked){
    msg += "Extra garlic sauce (Zaatar Bomb): Yes (+5 AED)\n";
    total += 5;
  }
  if(document.getElementById('extra_choc_diabetes')?.checked){
    msg += "Extra chocolate sauce (Diabetes): Yes (+5 AED)\n";
    total += 5;
  }
  if(selectedType === 'delivery'){
    const city = modalDeliveryForm.querySelector('#modalDeliveryCity').value;
    const deliveryFee = getDeliveryFee(city);
    if (deliveryFee) {
      msg += `Delivery Fee: +${deliveryFee} AED\n`;
      total += deliveryFee;
    } else {
      msg += "Delivery charge determined on checkout\n";
    }
  }

  msg += `\nTotal: ${total} AED`;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=971544588113&text=${encodeURIComponent(msg)}`;

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
    openWhatsAppDirect(whatsappUrl);
    console.log("Order sent to Activepieces");
    closeModal();
  })
  .catch(e => {
    console.error("Activepieces webhook error:", e);
    alert("Failed to send order. Please try again.");
  });
});

updateCartSummary();
