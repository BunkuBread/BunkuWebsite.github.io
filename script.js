// --- Cart Logic ---
const cart = {
  items: {},
  total: 0
};

function updateCartSummary() {
  let count = 0;
  let total = 0;
  Object.keys(cart.items).forEach(key => {
    count += cart.items[key].quantity;
    total += cart.items[key].quantity * cart.items[key].price;
  });

  document.getElementById('cartSummary').innerHTML = `Cart: ${count} item${count !== 1 ? 's' : ''} <span id="cartTotal">${total ? `${total} AED` : ''}</span>`;
}

document.querySelectorAll('.add-cart-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const cardInput = this.parentNode.querySelector('.card-input');
    const name = this.getAttribute('data-name');
    const price = Number(this.getAttribute('data-price'));
    const qty = Number(cardInput.value);

    if (qty < 1) {
      alert('Select at least one box.');
      return;
    }
    cart.items[name] = { quantity: qty, price: price };
    updateCartSummary();
  });
});

document.getElementById('orderForm').addEventListener('submit', function (e) {
  e.preventDefault();
  let count = 0;
  Object.keys(cart.items).forEach(key => count += cart.items[key].quantity);
  if (count < 1) {
    alert('Add at least one product to cart.');
    return;
  }
  // Compose WhatsApp message
  let msg = `Hello! Here's my Bunku Bread order:\n\n`;
  Object.keys(cart.items).forEach(key => {
    msg += `${key}: ${cart.items[key].quantity} box(es)\n`;
  });
  msg += `\nTotal: ${Object.values(cart.items).reduce((acc, cur) => acc + cur.quantity * cur.price, 0)} AED`;
  const waLink = `https://wa.me/971544588113?text=${encodeURIComponent(msg)}`;
  window.open(waLink, '_blank');
});

updateCartSummary();
