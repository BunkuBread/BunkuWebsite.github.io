// --- Dummy Product Data ---
const products = [
  { id: 1, name: "Bunku OG", desc: "Original Garlic Bread with 5 Types of Cheese", price: 50, img: "placeholder1.jpg" },
  { id: 2, name: "Zaatar", desc: "Zaatar Spices with Cheese", price: 55, img: "placeholder2.jpg" },
  { id: 3, name: "Berry Blast", desc: "Blackberry Mix with Cheese", price: 55, img: "placeholder3.jpg" },
  { id: 4, name: "Strawberry Haven", desc: "Strawberries Mix with Cheese", price: 55, img: "placeholder4.jpg" },
  { id: 5, name: "Diabetes", desc: "Nutella with Chocolate & Marshmallows", price: 55, img: "placeholder5.jpg" }
];

let cart = [];

// --- Render Products ---
const productsContainer = document.getElementById("products");

function renderProducts() {
  productsContainer.innerHTML = "";
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="price">${p.price} AED</div>
      <input type="number" min="0" value="0" id="qty-${p.id}" />
      <button data-id="${p.id}">Add to Cart</button>
    `;
    productsContainer.appendChild(card);
  });
}

renderProducts();

// --- Cart Functionality ---
function updateCart() {
  const cartSummary = document.getElementById("cart-summary");
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  cartSummary.textContent = `Cart: ${totalItems} item${totalItems !== 1 ? "s" : ""}`;
}

productsContainer.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    const id = parseInt(e.target.getAttribute("data-id"));
    const qtyInput = document.getElementById(`qty-${id}`);
    const qty = parseInt(qtyInput.value) || 0;
    if (qty > 0) {
      const existing = cart.find(item => item.id === id);
      if (existing) {
        existing.qty += qty;
      } else {
        const product = products.find(p => p.id === id);
        cart.push({ ...product, qty });
      }
      qtyInput.value = 0;
      updateCart();
    }
  }
});

// --- Checkout Modal ---
const checkoutBtn = document.getElementById("checkout-btn");
const modal = document.getElementById("checkout-modal");
const closeModal = document.getElementById("close-modal");
const checkoutForm = document.getElementById("checkout-form");

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Please add at least one product to your cart.");
    return;
  }
  modal.style.display = "flex";
});

closeModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

// --- Handle Checkout Submission ---
checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const method = checkoutForm.method.value;

  let total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  if (method === "delivery") total += 35; // dummy delivery fee

  // Dummy placeholders for Supabase/Activepieces/Telegram integration
  console.log("Order submitted:", { name, phone, address, method, cart, total });

  // Dummy WhatsApp link
  let msg = `Hello! I want to order:\n`;
  cart.forEach(item => { msg += `${item.name} x${item.qty}\n`; });
  msg += `Total: ${total} AED\nName: ${name}\nPhone: ${phone}\n`;
  if (method === "delivery") msg += `Address: ${address}\n`;

  window.open(`https://wa.me/971544588113?text=${encodeURIComponent(msg)}`, "_blank");

  cart = [];
  updateCart();
  modal.style.display = "none";
  checkoutForm.reset();
});
