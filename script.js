// Cart object to track items by name with quantity and price
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

  const deliveryRadio = document.querySelector('input[name="modal_order_type"]:checked');
  let deliveryFee = 0;
  if (deliveryRadio && deliveryRadio.value === 'delivery') {
    const city = document.getElementById('modalDeliveryCity')?.value || "";
    deliveryFee = getDeliveryFee(city);
    total += deliveryFee;
  }

  const summaryEl = document.getElementById('cartSummary');
  summaryEl.innerHTML = `Cart: ${count} item${count !== 1 ? 's' : ''} <span id="cartTotal">${total} AED</span>`;
}

// Update or remove items in cart object and refresh UI summary
function updateCartItem(name, qty, price) {
  if (qty <= 0) {
    delete cart[name];
  } else {
    cart[name] = { qty, price };
  }
  updateCartSummary();
}

// Populate cart detail panel with current items and extras
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
    li.textContent = `${name}: ${item.qty} box(es) - ${item.qty * item.price} AED`;
    cartList.appendChild(li);
    total += item.qty * item.price;
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

  const deliveryRadio = document.querySelector('input[name="modal_order_type"]:checked');
  if (deliveryRadio && deliveryRadio.value === 'delivery') {
    const city = document.getElementById('modalDeliveryCity')?.value || "";
    const deliveryFee = getDeliveryFee(city);
    if (deliveryFee) {
      const li = document.createElement("li");
      li.textContent = `Delivery fee: +${deliveryFee} AED`;
      cartList.appendChild(li);
      total += deliveryFee;
    } else if (city) {
      const li = document.createElement("li");
      li.textContent = "Delivery charge determined on checkout";
      cartList.appendChild(li);
    }
  }

  const totalLi = document.createElement("li");
  totalLi.textContent = `Total: ${total} AED`;
  totalLi.style.fontWeight = 'bold';
  cartList.appendChild(totalLi);
}

// Show/hide modal form for order details
function showOrderModal() {
  document.getElementById('orderDetailsModal').style.display = 'flex';
}

function hideOrderModal() {
  document.getElementById('orderDetailsModal').style.display = 'none';
}

// Initialize event listeners and UI updates on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Attach quantity input listeners
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
    });
  });

  // Attach plus/minus buttons listeners for quantity updates
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
    });
  });

  // Extras checkboxes update cart summary and panel
  ['extra_garlic_og', 'extra_garlic_zaatar', 'extra_choc_diabetes'].forEach(id => {
    const cb = document.getElementById(id);
    if (cb) cb.addEventListener('change', () => {
      updateCartSummary();
      populateCartPanel();
    });
  });

  const cartSummary = document.getElementById('cartSummary');
  const cartPanel = document.getElementById('cartPanel');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');

  // Toggle cart panel visibility
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

  // Checkout: open modal for details after validation of cart
  checkoutBtn.addEventListener('click', (event) => {
    event.preventDefault();

    if (Object.values(cart).reduce((a, b) => a + b.qty, 0) < 1) {
      alert("Your cart is empty. Please add at least one item.");
      return;
    }
    showOrderModal();
  });

  // Logic for showing/hiding delivery/pickup fields in modal
  document.getElementsByName('modal_order_type').forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked && radio.value === 'delivery') {
        document.querySelector('.delivery-fields').style.display = '';
        document.querySelector('.pickup-fields').style.display = 'none';
      } else if (radio.checked && radio.value === 'pickup') {
        document.querySelector('.delivery-fields').style.display = 'none';
        document.querySelector('.pickup-fields').style.display = '';
      }
      populateCartPanel(); // To show delivery fee if delivery is chosen
    });
  });

  // Modal close button
  document.getElementById('closeModalBtn').addEventListener('click', hideOrderModal);

  // Modal form submit: validate and open WhatsApp with order details
  document.getElementById('orderDetailsForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const form = e.target;

    // Simple form validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const selectedOrderType = Array.from(document.getElementsByName('modal_order_type')).find(r => r.checked)?.value || '';

    let message = `Hello! I placed a ${selectedOrderType} order:\n\n`;

    if (selectedOrderType === 'delivery') {
      message += `Name: ${form.querySelector('#modalDeliveryName').value.trim()}\n`;
      message += `Phone: ${form.querySelector('#modalDeliveryPhone').value.trim()}\n`;
      message += `Date: ${form.querySelector('#modalDeliveryDate').value}\n`;
      message += `City: ${form.querySelector('#modalDeliveryCity').value}\n`;
      message += `Area: ${form.querySelector('#modalDeliveryArea').value.trim()}\n`;
      message += `Time: ${form.querySelector('#modalDeliveryTime').value}\n\n`;
    } else {
      message += `Name: ${form.querySelector('#modalPickupName').value.trim()}\n`;
      message += `Phone: ${form.querySelector('#modalPickupPhone').value.trim()}\n`;
      message += `Date: ${form.querySelector('#modalPickupDate').value}\n`;
      message += `License Plate: ${form.querySelector('#modalPickupLicense').value.trim()}\n`;
      message += `Time: ${form.querySelector('#modalPickupTime').value}\n\n`;
    }

    message += "Orders:\n";
    let total = 0;
    for (const [name, item] of Object.entries(cart)) {
      message += `${name}: ${item.qty} box(es)\n`;
      total += item.qty * item.price;
    }

    if (document.getElementById('extra_garlic_og').checked) {
      message += "Extra garlic sauce (OG Bunku): Yes (+5 AED)\n";
      total += 5;
    }
    if (document.getElementById('extra_garlic_zaatar').checked) {
      message += "Extra garlic sauce (Zaatar Bomb): Yes (+5 AED)\n";
      total += 5;
    }
    if (document.getElementById('extra_choc_diabetes').checked) {
      message += "Extra chocolate sauce (Diabetes): Yes (+5 AED)\n";
      total += 5;
    }

    if (selectedOrderType === 'delivery') {
      const city = form.querySelector('#modalDeliveryCity').value;
      const deliveryFee = getDeliveryFee(city);
      if (deliveryFee) {
        message += `Delivery Fee: +${deliveryFee} AED\n`;
        total += deliveryFee;
      } else {
        message += "Delivery charge determined on checkout\n";
      }
    }

    message += `\nTotal: ${total} AED`;

    hideOrderModal();
    alert("Order ready! Redirecting to WhatsApp.");
    const whatsappUrl = `https://api.whatsapp.com/send?phone=971544588113&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  });

  // Initialize summary and cart panel on load
  updateCartSummary();
  populateCartPanel();
});
