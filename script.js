const products = [
  { id: 1, name: "Bunku OG", desc: "Original Garlic Bread with 5 Types of Cheese", price: 50, img: "images/BUNKUOG.JPG" },
  { id: 2, name: "Zaatar", desc: "Zaatar Spices with Cheese", price: 55, img: "images/ZAATAR.JPEG" },
  { id: 3, name: "Berry Blast", desc: "Blackberry Mix with Cheese", price: 55, img: "images/BERRYBLAST.JPEG" },
  { id: 4, name: "Strawberry Haven", desc: "Strawberries Mix with Cheese", price: 55, img: "images/STRAWBERRYHAVEN.JPG" },
  { id: 5, name: "Diabetes", desc: "Nutella with Chocolate & Marshmallows", price: 55, img: "images/DIABETES.JPG" }
];

let cart = [];

const productsContainer = document.getElementById("products");

function renderProducts() {
  productsContainer.innerHTML = "";
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" />
      <div>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="price">${p.price} AED</div>
        <input type="number" min="0" value="0" id="qty-${p.id}" />
        <button data-id="${p.id}">Add to Cart</button>
      </div>
    `;
    productsContainer.appendChild(card);
  });
}

renderProducts();

function updateCart() {
  const cartSummary = document.getElementById("cart-summary");
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  cartSummary.textContent = `Cart: ${totalItems} item${totalItems !== 1 ? "s" : ""}`;
}

productsContainer.addEventListener("click", e => {
  if (e.target.tagName === "BUTTON") {
    const id = parseInt(e.target.dataset.id);
    const qtyInput = document.getElementById(`qty-${id}`);
    const qty = parseInt(qtyInput.value) || 0;
    if (qty > 0) {
      const existing = cart.find(item => item.id === id);
      if (existing) existing.qty += qty;
      else cart.push({ ...products.find(p => p.id === id), qty });
      qtyInput.value = 0;
      updateCart();
    }
  }
});

// Checkout Modal
const checkoutBtn = document.getElementById("checkout-btn");
const modal = document.getElementById("checkout-modal");
const closeModal = document.getElementById("close-modal");
const checkoutForm = document.getElementById("checkout-form");

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return alert("Please add products to your cart.");
  modal.style.display = "flex";
});

closeModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

checkoutForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const method = checkoutForm.method.value;

  let total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  if (method === "delivery") total += 35;

  let msg = `Hello! I want to order:\n`;
  cart.forEach(item => msg += `${item.name} x${item.qty}\n`);
  msg += `Total: ${total} AED\nName: ${name}\nPhone: ${phone}\n`;
  if (method === "delivery") msg += `Address: ${address}\n`;

  window.open(`https://wa.me/971544588113?text=${encodeURIComponent(msg)}`, "_blank");

  cart = [];
  updateCart();
  modal.style.display = "none";
  checkoutForm.reset();
});
