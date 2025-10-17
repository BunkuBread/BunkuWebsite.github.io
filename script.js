// Cart object to track items and quantities
const cart = {};

// Delivery fee based on city
function getDeliveryFee(city) {
  if (["Fujairah", "Ras Al Khaimah", "Abu Dhabi", "Al Ain"].includes(city)) {
    return 35;
  }
  return 0;
}

// Update sticky cart summary visible on all pages
function updateCartSummary() {
  const count = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  let total = Object.values(cart).reduce((sum, item) => sum + (item.qty * item.price), 0);

  if (document.getElementById('extra_garlic_og')?.checked) total += 5;
  if (document.getElementById('extra_garlic_zaatar')?.checked) total += 5;
  if (document.getElementById('extra_choc_diabetes')?.checked) total += 5;

  const deliveryRadio = document.querySelector('input[name="orderType"]:checked');
  let deliveryFee = 0;
  if (deliveryRadio && deliveryRadio.value === 'delivery') {
    const city = document.getElementById('deliveryCity')?.value || "";
    deliveryFee = getDeliveryFee(city);
    total += deliveryFee;
  }

  const summaryEl = document.getElementById('cartSummary');
  summaryEl.innerHTML = `Cart: ${count} item${count !== 1 ? 's' : ''} <span id="cartTotal">${total} AED</span>`;
}

// Update or remove items in cart object and sync inputs and update summary
function updateCartItem(name, qty, price) {
  if (qty <= 0) {
    delete cart[name];
    qty = 0;
  } else {
    cart[name] = { qty, price };
  }

  const productInput = document.querySelector(`#qty_${name.toLowerCase().replace(/ /g, '_')}`);
  if (productInput) productInput.value = qty;

  const cartPanelInputs = document.querySelectorAll(`#cartList input.qty-input`);
  cartPanelInputs.forEach(input => {
    if (input.getAttribute('aria-label') === `${name} quantity`) {
      input.value = qty;
    }
  });

  updateCartSummary();
}

// Populate cart detail panel with current items and extras with quantity adjustment controls
function populateCartPanel() {
  const cartPanel = document.getElementById('cartPanel');
  const cartList = cartPanel.querySelector('#cartList');
  cartList.innerHTML = "";
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    cartList.innerHTML = "<li>Your cart is empty.</li>";
    return;
  }

  let total = 0;
  for (const [name, item] of entries) {
    const li = document.createElement("li");
    li.className = "cart-item";

    const itemNameSpan = document.createElement("span");
    itemNameSpan.textContent = name + ": ";
    li.appendChild(itemNameSpan);

    const minusBtn = document.createElement("button");
    minusBtn.textContent = "-";
    minusBtn.className = "qty-btn minus";
    minusBtn.setAttribute("aria-label", `Reduce ${name} quantity`);
    li.appendChild(minusBtn);

    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.min = 0;
    qtyInput.max = 10;
    qtyInput.value = item.qty;
    qtyInput.className = "qty-input";
    qtyInput.setAttribute("aria-label", `${name} quantity`);
    li.appendChild(qtyInput);

    const plusBtn = document.createElement("button");
    plusBtn.textContent = "+";
    plusBtn.className = "qty-btn plus";
    plusBtn.setAttribute("aria-label", `Increase ${name} quantity`);
    li.appendChild(plusBtn);

    const priceSpan = document.createElement("span");
    priceSpan.textContent = ` - ${item.qty * item.price} AED`;
    priceSpan.className = "cart-item-price";
    li.appendChild(priceSpan);

    cartList.appendChild(li);
    total += item.qty * item.price;

    minusBtn.addEventListener("click", () => {
      let newQty = Math.max(0, item.qty - 1);
      updateCartItem(name, newQty, item.price);
      populateCartPanel();
    });

    plusBtn.addEventListener("click", () => {
      let newQty = Math.min(10, item.qty + 1);
      updateCartItem(name, newQty, item.price);
      populateCartPanel();
    });

    qtyInput.addEventListener("input", (e) => {
      let val = Math.max(0, Math.min(10, parseInt(e.target.value) || 0));
      updateCartItem(name, val, item.price);
      populateCartPanel();
    });
  }

  ['extra_garlic_og', 'extra_garlic_zaatar', 'extra_choc_diabetes'].forEach(id => {
    const chk = document.getElementById(id);
    if (chk?.checked) {
      const li = document.createElement("li");
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

  const deliveryRadio = document.querySelector('input[name="orderType"]:checked');
  if (deliveryRadio && deliveryRadio.value === 'delivery') {
    const city = document.getElementById('deliveryCity')?.value || "";
    const deliveryFee = getDeliveryFee(city);
    if (deliveryFee) {
      const li = document.createElement("li");
      li.textContent = `Delivery fee: +${deliveryFee} AED`;
      cartList.appendChild(li);
      total += deliveryFee;
    } else if (city) {
      const li = document.createElement("li");
      li.textContent = "Delivery charge estimated on message";
      cartList.appendChild(li);
    }
  }

  const totalLi = document.createElement("li");
  totalLi.textContent = `Total: ${total} AED`;
  totalLi.style.fontWeight = 'bold';
  cartList.appendChild(totalLi);
}

// Checkout/Order form logic and validation
document.addEventListener('DOMContentLoaded', () => {
  const orderTypeRadios = document.querySelectorAll('input[name="orderType"]');
  const deliveryFields = document.getElementById('deliveryFields');
  const pickupFields = document.getElementById('pickupFields');
  const deliveryChargeFieldset = document.getElementById('deliveryChargeFieldset');
  const deliveryChargeInfo = document.getElementById('deliveryChargeInfo');
  const deliveryCitySelect = document.getElementById('deliveryCity');

  function updateDeliveryCharge() {
    const city = deliveryCitySelect.value;
    if (["Fujairah", "Ras Al Khaimah", "Abu Dhabi", "Al Ain"].includes(city)) {
      deliveryChargeInfo.textContent = "35 AED";
    } else if (city) {
      deliveryChargeInfo.textContent = "Delivery charge estimated on message";
    } else {
      deliveryChargeInfo.textContent = "N/A";
    }
  }

  orderTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === "delivery" && radio.checked) {
        deliveryFields.classList.remove('hidden');
        pickupFields.classList.add('hidden');
        deliveryChargeFieldset.classList.remove('hidden');
        updateDeliveryCharge();
      } else if (radio.value === "pickup" && radio.checked) {
        pickupFields.classList.remove('hidden');
        deliveryFields.classList.add('hidden');
        deliveryChargeFieldset.classList.add('hidden');
      }
    });
  });

  if (deliveryCitySelect) {
    deliveryCitySelect.addEventListener('change', updateDeliveryCharge);
  }

  function dateValidation(inputElement, cityElement) {
    const city = cityElement.value.trim();
    const selectedDate = new Date(inputElement.value);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (!inputElement.value) return; 

    if (selectedDate < today) {
      inputElement.setCustomValidity('Date cannot be in the past');
    } else if (selectedDate.getTime() === today.getTime()) {
      if (!["Ajman", "Dubai", "Sharjah"].includes(city)) {
        inputElement.setCustomValidity('Same day delivery/pickup allowed only in Ajman, Dubai or Sharjah');
      } else {
        inputElement.setCustomValidity('');
      }
    } else {
      inputElement.setCustomValidity('');
    }
  }

  const deliveryDateInput = document.getElementById('deliveryDate');
  const pickupDateInput = document.getElementById('pickupDate');

  if (deliveryDateInput && deliveryCitySelect) {
    deliveryDateInput.addEventListener('input', () => dateValidation(deliveryDateInput, deliveryCitySelect));
    deliveryCitySelect.addEventListener('change', () => dateValidation(deliveryDateInput, deliveryCitySelect));
  }

  if (pickupDateInput) {
    pickupDateInput.addEventListener('input', () => {
      const city = ""; // no city selector for pickup
      const selectedDate = new Date(pickupDateInput.value);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (!pickupDateInput.value) return;
      if (selectedDate < today) {
        pickupDateInput.setCustomValidity('Date cannot be in the past');
      } else if (selectedDate.getTime() === today.getTime()) {
        if (!["Ajman", "Dubai", "Sharjah"].includes(city)) {
          pickupDateInput.setCustomValidity('Same day pickup allowed only in Ajman, Dubai or Sharjah');
        } else {
          pickupDateInput.setCustomValidity('');
        }
      } else {
        pickupDateInput.setCustomValidity('');
      }
    });
  }

  function renderCheckoutCartOverview() {
    const overview = document.getElementById('checkoutCartList');
    overview.innerHTML = "";
    const entries = Object.entries(cart);
    if (entries.length === 0) {
      overview.innerHTML = "<li>Your cart is empty.</li>";
      return;
    }
    entries.forEach(([name, item]) => {
      const li = document.createElement('li');
      li.textContent = `${name}: ${item.qty} box(es) - ${item.qty * item.price} AED`;
      overview.appendChild(li);
    });
  }

  renderCheckoutCartOverview();

  const orderForm = document.getElementById('orderForm');
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (Object.values(cart).reduce((a, b) => a + b.qty, 0) < 1) {
      alert("Your cart is empty. Please add at least one item.");
      return;
    }

    if (!orderForm.checkValidity()) {
      orderForm.reportValidity();
      return;
    }

    let message = "Hello! I placed an order:\n\n";
    message += "Order Type: ";
    const orderType = [...orderTypeRadios].find(r => r.checked)?.value;
    if (!orderType) {
      alert("Please select delivery or pick up.");
      return;
    }
    message += orderType.charAt(0).toUpperCase() + orderType.slice(1) + "\n\n";

    if (orderType === "delivery") {
      message += `Name: ${orderForm.deliveryName.value}\n`;
      message += `Phone: ${orderForm.deliveryPhone.value}\n`;
      message += `City: ${orderForm.deliveryCity.value}\n`;
      message += `Date: ${orderForm.deliveryDate.value}\n`;
      message += `Time: ${orderForm.deliveryTime.value}\n`;
      message += `Area: ${orderForm.deliveryArea.value}\n`;
      if (["Fujairah", "Ras Al Khaimah", "Abu Dhabi", "Al Ain"].includes(orderForm.deliveryCity.value)) {
        message += "Delivery charge: 35 AED\n";
      } else {
        message += "Delivery charge: Estimated on message\n";
      }
    } else {
      message += `Name: ${orderForm.pickupName.value}\n`;
      message += `Phone: ${orderForm.pickupPhone.value}\n`;
      message += `Plate Number: ${orderForm.pickupPlate.value}\n`;
      message += `Date: ${orderForm.pickupDate.value}\n`;
      message += `Time: ${orderForm.pickupTime.value}\n`;
    }

    message += "\nOrders:\n";
    let total = 0;
    Object.entries(cart).forEach(([name, item]) => {
      message += `${name}: ${item.qty} box(es)\n`;
      total += item.qty * item.price;
    });
    message += `\nTotal: ${total} AED`;

    alert(message);
  });

  // Attach quantity and button listeners on product cards for syncing cart quantity (existing logic)
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const name = e.target.dataset.name;
      const qty = Math.max(0, Math.min(10, parseInt(e.target.value) || 0));
      e.target.value = qty;
      const card = e.target.closest('.product-card');
      const priceText = card.querySelector('.card-price').textContent;
      const price = Number(priceText.replace(/\D/g, '')) || 0;
      updateCartItem(name, qty, price);
      populateCartPanel();
      renderCheckoutCartOverview();
    });
  });

  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const input = document.getElementById(`qty_${name.toLowerCase().replace(/ /g, '_')}`);
      if (!input) return;
      let qty = parseInt(input.value) || 0;
      if (btn.classList.contains('plus')) qty = Math.min(qty + 1, 10);
      if (btn.classList.contains('minus')) qty = Math.max(qty - 1, 0);
      input.value = qty;
      const card = input.closest('.product-card');
      const priceText = card.querySelector('.card-price').textContent;
      const price = Number(priceText.replace(/\D/g, '')) || 0;
      updateCartItem(name, qty, price);
      populateCartPanel();
      renderCheckoutCartOverview();
    });
  });

  // Extras checkbox handlers to update cart summary, panel, and checkout overview
  ['extra_garlic_og', 'extra_garlic_zaatar', 'extra_choc_diabetes'].forEach(id => {
    const cb = document.getElementById(id);
    if (cb) cb.addEventListener('change', () => {
      updateCartSummary();
      populateCartPanel();
      renderCheckoutCartOverview();
    });
  });

  // Cart summary toggle and close handlers (existing logic)
  const cartSummary = document.getElementById('cartSummary');
  const cartPanel = document.getElementById('cartPanel');
  const closeCartBtn = document.getElementById('closeCartBtn');

  cartSummary.addEventListener('click', () => {
    const isVisible = cartPanel.classList.contains('show');
    if (isVisible) {
      cartPanel.classList.remove('show');
      cartPanel.setAttribute('aria-hidden', 'true');
      cartSummary.focus();
    } else {
      populateCartPanel();
      cartPanel.classList.add('show');
      cartPanel.setAttribute('aria-hidden', 'false');
    }
  });

  closeCartBtn.addEventListener('click', () => {
    cartPanel.classList.remove('show');
    cartPanel.setAttribute('aria-hidden', 'true');
    cartSummary.focus();
  });

  // Initialize summary and panel on load
  updateCartSummary();
  populateCartPanel();
  renderCheckoutCartOverview();
});
