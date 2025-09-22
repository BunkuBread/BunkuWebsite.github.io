```javascript
const CONFIG = {
SUPABASE_URL: "your-supabase-url",
SUPABASE_KEY: "your-supabase-key",
TELEGRAM_BOT: "your-telegram-bot",
ACTIVEPIECES_URL: "your-activepieces-url"
};


const products = [
{ name: "Bunku OG", desc: "Classic original flavor", price: 10, img: "https://via.placeholder.com/120" },
{ name: "Zaatar", desc: "Herby Middle Eastern flavor", price: 12, img: "https://via.placeholder.com/120" },
{ name: "Berry Blast", desc: "Sweet & tangy berry mix", price: 15, img: "https://via.placeholder.com/120" },
{ name: "Strawberry Haven", desc: "Strawberry delight", price: 15, img: "https://via.placeholder.com/120" },
{ name: "Diabetes", desc: "Super sweet indulgence", price: 20, img: "https://via.placeholder.com/120" },
];


let cart = [];


function renderProducts() {
const container = document.getElementById("products");
container.innerHTML = "";
products.forEach((p, idx) => {
const div = document.createElement("div");
div.className = "product";
div.innerHTML = `
<img src="${p.img}" alt="${p.name}" />
<div class="product-info">
<h3>${p.name}</h3>
<p>${p.desc}</p>
<p>AED ${p.price}</p>
</div>
<div class="product-actions">
<input type="number" min="0" value="0" id="qty-${idx}" />
<button onclick="addToCart(${idx})">Add</button>
</div>`;
container.appendChild(div);
});
}


function addToCart(idx) {
const qty = parseInt(document.getElementById(`qty-${idx}`).value);
if (qty > 0) {
const existing = cart.find(item => item.name === products[idx].name);
if (existing) {
existing.qty += qty;
} else {
cart.push({ ...products[idx], qty });
}
updateCart();
}
}


function updateCart() {
const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
document.getElementById("cart-summary").textContent = `Cart: ${totalItems} items`;
}


// Modal logic
const modal = document.getElementById("checkout-modal");
document.getElementById("checkout-btn").onclick = () => {
modal.style.display = "flex";
};
document.getElementById("close-modal").onclick = () => {
modal.style.display = "none";
};


// Checkout form submission
document.getElementById("checkout-form").addEventListener("submit", e => {
e.preventDefault();
alert("Order submitted! (dummy for now)");
modal.style.display = "none";
cart = [];
updateCart();
});


renderProducts();
```
