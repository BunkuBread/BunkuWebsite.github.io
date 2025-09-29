const cart = {};
function updateCartSummary() {
  let count = Object.values(cart).reduce((a,b) => a + b.qty, 0);
  let total = Object.values(cart).reduce((a,b) => a + b.qty*b.price, 0);
  document.getElementById('cartSummary').innerHTML = `Cart: ${count} item${count!==1?'s':''} <span id="cartTotal">${total?`${total} AED`:''}</span>`;
}

document.querySelectorAll('.add-cart').forEach(btn => {
  btn.onclick = function() {
    const name = btn.getAttribute('data-name');
    const price = Number(btn.getAttribute('data-price'));
    const qty = Number(btn.previousElementSibling.value);
    if (qty<1) {alert('Select at least one box.');return;}
    cart[name] = { qty: qty, price: price };
    updateCartSummary();
  };
});

document.getElementById('orderForm').onsubmit = function(e) {
  e.preventDefault();
  let count = Object.values(cart).reduce((a,b) => a + b.qty, 0);
  if (count < 1) {
    alert('Add at least one product to cart.');
    return;
  }
  let msg = `Hello! Here's my Bunku Bread order:\n\n`;
  Object.keys(cart).forEach(k=>msg+=`${k}: ${cart[k].qty} box(es)\n`);
  msg += `\nTotal: ${Object.values(cart).reduce((a,b) => a + b.qty*b.price, 0)} AED`;
  window.open(`https://wa.me/971544588113?text=${encodeURIComponent(msg)}`,'_blank');
};
updateCartSummary();
