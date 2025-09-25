const products = [
  { id: 1, name: "Bunku OG", price: 50, img: "images/BUNKUOG.JPG" },
  { id: 2, name: "Zaatar", price: 55, img: "images/ZAATAR.JPEG" },
  { id: 3, name: "Berry Blast", price: 55, img: "images/BERRYBLAST.JPEG" },
  { id: 4, name: "Strawberry Haven", price: 55, img: "images/STRAWBERRYHAVEN.JPG" },
  { id: 5, name: "Diabetes", price: 55, img: "images/DIABETES.JPG" }
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
        <div class="price">AED ${p.price}</div>
        <input type="number" min="1" value="1" id="qty-${p.id}" />
        <button data-id="${p.id}">Add to Cart</button>
      </div>
    `;
    productsContainer.appendChild(card);
  });
}

function addToCart(id) {
  const qty = parseInt(document.getElementById(`qty-${id}`).value);
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ ...product, qty });
  updateCart();
}

function updateCart() {
  const itemsList = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  itemsList.innerHTML = "";
  let total = 0;
  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} x${item.qty} – AED ${item.price * item.qty}`;
    itemsList.appendChild(li);
    total += item.price * item.qty;
  });
  totalEl.textContent = `Total: AED ${total}`;
}

document.getElementById("toggle-cart").addEventListener("click", () => {
  document.getElementById("cart-panel").classList.toggle("hidden");
});

productsContainer.addEventListener("click", e => {
  if (e.target.tagName === "BUTTON" && e.target.dataset.id) {
    addToCart(parseInt(e.target.dataset.id));
  }
});

renderProducts();
