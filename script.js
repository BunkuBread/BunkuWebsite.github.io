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
    const city = document.getElementById('modalDeliveryCity')?.value || "";
    deliveryFee = getDeliveryFee(city);
    if (deliveryFee) total += deliveryFee;
  }

  let deliveryText = "";
  if (deliveryRadio && deliveryRadio.value === 'delivery') {
    const city = document.getElementById('modalDeliveryCity')?.value || "";
    if (getDeliveryFee(city)) {
      deliveryText = `+${deliveryFee} AED delivery`;
    } else if (city !== "") {
      deliveryText = "Delivery charge determined on checkout";
    }
  }

  const summaryEl = document.getElementById('cartSummary');
  summaryEl.innerHTML = `Cart: ${count} item${count !== 1 ? 's' : ''} <span id="cartTotal">${total} AED</span>`;
  if (deliveryText) {
    summaryEl.innerHTML += `<div class="delivery-note">${deliveryText}</div>`;
  }

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

function populateCartPanel() {
  const cartList = document.getElementById('cartList');
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
    const modalDeliveryCity = document.getElementById('modalDeliveryCity');
    const city = modalDeliveryCity ? modalDeliveryCity.value : "";
    const deliveryFee = getDeliveryFee(city);
    if (deliveryFee) {
      const li = document.createElement('li');
      li.textContent = `Delivery fee: +${deliveryFee} AED`;
      cartList.appendChild(li);
      total += deliveryFee;
    } else if (city) {
      const li = document.createElement('li');
      li.textContent = "Delivery charge determined on checkout";
      cartList.appendChild(li);
    }
  }
  const totalLi = document.createElement('li');
  totalLi.textContent = `Total: ${total} AED`;
  totalLi.style.fontWeight = 'bold';
  cartList.appendChild(totalLi);
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded, attaching event listeners.");

  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const name = e.target.dataset.name;
      let qty = Math.max(0, Math.min(10, parseInt(e.target.value) || 0));
      e.target.value = qty;
      const card = e.target.closest('.product-card');
      const priceText = card.querySelector('.card-price').textContent;
      const price = Number(priceText.replace(/\D/g, '')) || 0;
      updateCartItem(name, qty, price);
    });
  });

  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name = btn.dataset.name;
      const input = document.getElementById(`qty_${name.toLowerCase().replace(/ /g, '_')}`);
      if(!input) return;
      let qty = parseInt(input.value) || 0;
      if (btn.classList.contains('plus')) qty = Math.min(qty + 1, 10);
      if (btn.classList.contains('minus')) qty = Math.max(qty - 1, 0);
      input.value = qty;
      const card = input.closest('.product-card');
      const priceText = card.querySelector('.card-price').textContent;
      const price = Number(priceText.replace(/\D/g, '')) || 0;
      updateCartItem(name, qty, price);
    });
  });

  ['extra_garlic_og', 'extra_garlic_zaatar', 'extra_choc_diabetes'].forEach(id => {
    const cb = document.getElementById(id);
    if(cb) cb.addEventListener('change', updateCartSummary);
  });

  const cartPanel = document.getElementById('cartPanel');
  const cartSummary = document.getElementById('cartSummary');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const modalDeliveryForm = document.getElementById('modalDeliveryForm');
  const modalPickupForm = document.getElementById('modalPickupForm');
  const modalOrderTypeRadios = document.querySelectorAll('input[name="modal_order_type"]');

  // Toggle cart panel visibility
  cartSummary.addEventListener('click', () => {
    const visible = cartPanel.getAttribute('aria-hidden') === 'false';
    if (visible) {
      cartPanel.setAttribute('aria-hidden', 'true');
      cartPanel.classList.remove('show');
      cartSummary.focus();
    } else {
      populateCartPanel();
      cartPanel.setAttribute('aria-hidden', 'false');
      cartPanel.classList.add('show');
    }
  });

  closeCartBtn.addEventListener('click', () => {
    cartPanel.setAttribute('aria-hidden', 'true');
    cartPanel.classList.remove('show');
    cartSummary.focus();
  });

  checkoutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    if (Object.values(cart).reduce((a, b) => a + b.qty, 0) < 1) {
      alert('Add at least one product to cart.');
      return;
    }

    const selectedType = Array.from(modalOrderTypeRadios).find(r => r.checked)?.value || '';

    // When checkout is clicked, open modal for user details (implement your modal open here)
    if (selectedType === '') {
      alert('Please select order type (delivery or pickup) before proceeding.');
      return;
    }

    // Validate modal form fields on submit, not before modal open
    let formIsValid = true;
    let form, missingFields = [];

    if (selectedType === 'delivery' && modalDeliveryForm) {
      const requiredFields = ['modalDeliveryName', 'modalDeliveryPhone', 'modalDeliveryDate', 'modalDeliveryCity', 'modalDeliveryArea', 'modalDeliveryTime'];

      requiredFields.forEach(id => {
        const input = modalDeliveryForm.querySelector('#' + id);
        if (!input || input.value.trim() === '') {
          formIsValid = false;
          missingFields.push(id);
        }
      });
      form = modalDeliveryForm;
    } else if (selectedType === 'pickup' && modalPickupForm) {
      const requiredFields = ['modalPickupName', 'modalPickupPhone', 'modalPickupDate', 'modalPickupLicense', 'modalPickupTime'];

      requiredFields.forEach(id => {
        const input = modalPickupForm.querySelector('#' + id);
        if (!input || input.value.trim() === '') {
          formIsValid = false;
          missingFields.push(id);
        }
      });
      form = modalPickupForm;
    }

    if (!formIsValid) {
      alert('Please fill out all required details: ' + missingFields.join(', '));
      return;
    }

    // Build the message string for WhatsApp and webhook
    let msg = `Hello! I placed a ${selectedType} order:\n\n`;

    if (selectedType === 'delivery') {
      msg += `Name: ${modalDeliveryForm.querySelector('#modalDeliveryName').value.trim()}\n`;
      msg += `Phone: ${modalDeliveryForm.querySelector('#modalDeliveryPhone').value.trim()}\n`;
      msg += `Date: ${modalDeliveryForm.querySelector('#modalDeliveryDate').value}\n`;
      msg += `City: ${modalDeliveryForm.querySelector('#modalDeliveryCity').value}\n`;
      msg += `Area: ${modalDeliveryForm.querySelector('#modalDeliveryArea').value.trim()}\n`;
      msg += `Time: ${modalDeliveryForm.querySelector('#modalDeliveryTime').value}\n\n`;
    } else {
      msg += `Name: ${modalPickupForm.querySelector('#modalPickupName').value.trim()}\n`;
      msg += `Phone: ${modalPickupForm.querySelector('#modalPickupPhone').value.trim()}\n`;
      msg += `Date: ${modalPickupForm.querySelector('#modalPickupDate').value}\n`;
      msg += `License Plate: ${modalPickupForm.querySelector('#modalPickupLicense').value.trim()}\n`;
      msg += `Time: ${modalPickupForm.querySelector('#modalPickupTime').value}\n\n`;
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
        cart: cart,
      }),
    }).then(() => {
      window.open(whatsappUrl, "_blank");
      cartPanel.setAttribute("aria-hidden", "true");
      cartPanel.classList.remove("show");
      alert("Order sent! Redirecting to WhatsApp.");
    }).catch((e) => {
      console.error("Webhook error:", e);
      alert("Failed to send order. Please try again.");
    });
  });

  updateCartSummary();
});
