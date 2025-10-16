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

  const deliveryRadio = document.querySelector('input[name="modal_order_type"]:checked');
  let deliveryFee = 0;
  if (deliveryRadio && deliveryRadio.value === 'delivery') {
    const citySelect = document.getElementById('modalDeliveryCity');
    const selectedCity = citySelect ? citySelect.value : "";
    deliveryFee = getDeliveryFee(selectedCity);
    if (deliveryFee && selectedCity) {
      total += deliveryFee;
    }
  }

  const summaryEl = document.getElementById('cartSummary');
  let deliveryText = "";
  if (deliveryRadio && deliveryRadio.value === 'delivery') {
    const selectedCity = document.getElementById('modalDeliveryCity').value;
    if(getDeliveryFee(selectedCity)) {
      deliveryText = `+${deliveryFee} AED delivery`;
    } else if(selectedCity !== "") {
      deliveryText = "Delivery charge determined on checkout";
    }
  }
  summaryEl.innerHTML =
    `Cart: ${count} item${count !== 1 ? 's' : ''} <span id="cartTotal">${total} AED</span>` +
    (deliveryText ? `<div class="delivery-note">${deliveryText}</div>` : "");

  populateCartPanel();
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
    const priceText = btnParent.querySelector('.card-price').textContent;
    const price = Number(priceText.replace(/\D/g, '')) || 0;
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
    const btnParent = input.closest('.product-card');
    const priceText = btnParent.querySelector('.card-price').textContent;
    const price = Number(priceText.replace(/\D/g, '')) || 0;
    updateCartItem(name, qty, price);
  });
});

['extra_garlic_og', 'extra_garlic_zaatar', 'extra_choc_diabetes'].forEach(id => {
  const checkbox = document.getElementById(id);
  if (checkbox) checkbox.addEventListener('change', updateCartSummary);
});

const cartPanel = document.getElementById('cartPanel');
const cartSummary = document.getElementById('cartSummary');
const cartList = document.getElementById('cartList');
const closeCartBtn = document.getElementById('closeCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const modalDeliveryForm = document.getElementById('modalDeliveryForm');
const modalPickupForm = document.getElementById('modalPickupForm');
const modalOrderTypeRadios = document.querySelectorAll('input[name="modal_order_type"]');
const modalDeliveryCity = document.getElementById('modalDeliveryCity');

function populateCartPanel() {
  cartList.innerHTML = '';
  const items = Object.entries(cart);
  if (items.length === 0) {
    cartList.innerHTML = '<li>Your cart is empty.</li>';
    return;
  }
  let total = 0;

  items.forEach(([name, { qty, price }]) => {
    const li = document.createElement('li');
    li.textContent = `${name}: ${qty} box(es) - ${qty * price} AED`;
    cartList.appendChild(li);
    total += qty * price;
  });

  ['extra_garlic_og', 'extra_garlic_zaatar', 'extra_choc_diabetes'].forEach(id => {
    const chk = document.getElementById(id);
    if (chk?.checked) {
      const li = document.createElement('li');
      const labels = {
        'extra_garlic_og': "Extra garlic sauce (OG Bunku)",
        'extra_garlic_zaatar': "Extra garlic sauce (Zaatar Bomb)",
        'extra_choc_diabetes': "Extra chocolate sauce (Diabetes)"
      };
      li.textContent = `${labels[id]}: +5 AED`;
      cartList.appendChild(li);
      total += 5;
    }
  });

  const deliveryRadio = document.querySelector('input[name="modal_order_type"]:checked');
  if (deliveryRadio && deliveryRadio.value === 'delivery') {
    const city = modalDeliveryCity.value;
    const deliveryFee = getDeliveryFee(city);
    if (deliveryFee) {
      const li = document.createElement('li');
      li.textContent = `Delivery fee: +${deliveryFee} AED`;
      cartList.appendChild(li);
      total += deliveryFee;
    } else if (city) {
      const li = document.createElement('li');
      li.textContent = `Delivery charge determined on checkout`;
      cartList.appendChild(li);
    }
  }

  const totalLi = document.createElement('li');
  totalLi.textContent = `Total: ${total} AED`;
  totalLi.style.fontWeight = 'bold';
  cartList.appendChild(totalLi);
}

cartSummary.addEventListener('click', () => {
  const visible = cartPanel.getAttribute('aria-hidden') === 'false';
  if (visible) {
    cartPanel.setAttribute('aria-hidden', 'true');
    cartPanel.classList.remove('show');
  } else {
    populateCartPanel();
    cartPanel.setAttribute('aria-hidden', 'false');
    cartPanel.classList.add('show');
  }
});

closeCartBtn.addEventListener('click', () => {
  cartPanel.setAttribute('aria-hidden', 'true');
  cartPanel.classList.remove('show');
});

checkoutBtn.addEventListener('click', () => {
  if (Object.values(cart).reduce((a, b) => a + b.qty, 0) < 1) {
    alert('Add at least one product to cart.');
    return;
  }

  const selectedType = Array.from(modalOrderTypeRadios).find(r => r.checked).value;
  let msg = `Hello! I placed a ${selectedType} order:\n\n`;

  if (selectedType === 'delivery') {
    const name = modalDeliveryForm.querySelector('#modalDeliveryName').value.trim();
    const phone = modalDeliveryForm.querySelector('#modalDeliveryPhone').value.trim();
    const date = modalDeliveryForm.querySelector('#modalDeliveryDate').value;
    const city = modalDeliveryForm.querySelector('#modalDeliveryCity').value;
    const area = modalDeliveryForm.querySelector('#modalDeliveryArea').value.trim();
    const time = modalDeliveryForm.querySelector('#modalDeliveryTime').value;

    if (!name || !phone || !date || !city || !area || !time) {
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

    if (!name || !phone || !date || !licensePlate || !time) {
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

  if (document.getElementById('extra_garlic_og')?.checked) {
    msg += "Extra garlic sauce (OG Bunku): Yes (+5 AED)\n";
    total += 5;
  }
  if (document.getElementById('extra_garlic_zaatar')?.checked) {
    msg += "Extra garlic sauce (Zaatar Bomb): Yes (+5 AED)\n";
    total += 5;
  }
  if (document.getElementById('extra_choc_diabetes')?.checked) {
    msg += "Extra chocolate sauce (Diabetes): Yes (+5 AED)\n";
    total += 5;
  }

  if (selectedType === 'delivery') {
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_type: selectedType,
      details: msg,
      cart: cart
    }),
  })
    .then(() => {
      window.open(whatsappUrl, '_blank');
      closeCartBtn.click();
      alert("Order sent successfully! Redirecting to WhatsApp.");
    })
    .catch(e => {
      console.error("Activepieces webhook error:", e);
      alert("Failed to send order. Please try again.");
    });
});

updateCartSummary();
