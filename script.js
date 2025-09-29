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

document.querySelectorAll('.add-cart').forEach((btn) => {
