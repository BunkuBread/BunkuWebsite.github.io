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
    if (deliveryFee) {
      total += deliveryFee;
    }
  }

  let deliveryText = "";
  if (deliveryRadio && deliveryRadio.value === 'delivery') {
    if (getDeliveryFee(document.getElementById('modalDeliveryCity').value)) {
      deliveryText = `+${deliveryFee} AED delivery`;
    } else if (document.getElementById('modalDeliveryCity').value !== "") {
      deliveryText = "Delivery charge determined on checkout";
    }
  }

  const summaryEl = document.getElementById('cartSummary');
  summaryEl.innerHTML =
    `Cart: ${count} item${count !== 1 ? 's' : ''} <span id="cartTotal">${total} AED</span>`;
    
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
  btn.addEventListener('click', () => {
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

function populateCartPanel() {
  cartList.innerHTML = '';
  const items = Object.entries(cart);
  if (items.length === 0) {
    cartList.innerHTML = '<li>Your cart is empty.</li>';
    return;
  }
  let total = 0;

  items.forEach(([name, {qty, price}]) => {
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
    const city = document.getElementById('modalDeliveryCity').value;
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
  cartPanel.setAttribute('aria-hidden', visible ? 'true' : 'false');
  cartPanel.classList.toggle('show');
});

closeCartBtn.addEventListener('click', () => {
  cartPanel.setAttribute('aria-hidden', 'true');
  cartPanel.classList.remove('show');
});

updateCartSummary();
