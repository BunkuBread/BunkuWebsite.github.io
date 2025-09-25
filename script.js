const products = [
  { id:1, name:"Bunku OG", price:50, img:"images/BUNKUOG.JPG" },
  { id:2, name:"Zaatar", price:55, img:"images/ZAATAR.JPEG" },
  { id:3, name:"Berry Blast", price:55, img:"images/BERRYBLAST.JPEG" },
  { id:4, name:"Strawberry Haven", price:55, img:"images/STRAWBERRYHAVEN.JPG" },
  { id:5, name:"Diabetes", price:55, img:"images/DIABETES.JPG" }
];

let cart = [];

const productsContainer = document.getElementById("products");
const cartPanel = document.getElementById("cart-panel");
const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");

function renderProducts() {
  productsContainer.innerHTML = "";
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div>
        <h3>${p.name}</h3>
        <div class="price">AED ${p.price}</div>
        <input type="number" id="qty-${p.id}" value="1" min="1">
        <button data-id="${p.id}">Add to Cart</button>
      </div>
    `;
    productsContainer.appendChild(card);
  });
}

function addToCart(id){
  const qty = parseInt(document.getElementById(`qty-${id}`).value);
  const product = products.find(p=>p.id===id);
  const existing = cart.find(item=>item.id===id);
  if(existing) existing.qty+=qty;
  else cart.push({...product, qty});
  updateCart();
}

function removeFromCart(id){
  cart = cart.filter(item=>item.id!==id);
  updateCart();
}

function updateCart(){
  cartItems.innerHTML="";
  let total=0;
  cart.forEach(item=>{
    const li=document.createElement("li");
    li.innerHTML=`${item.name} x${item.qty} – AED ${item.price*item.qty} <button onclick="removeFromCart(${item.id})">×</button>`;
    cartItems.appendChild(li);
    total+=item.price*item.qty;
  });
  cartCount.textContent=cart.reduce((sum,i)=>sum+i.qty,0);
  cartTotal.textContent=`Total: AED ${total}`;
}

document.getElementById("toggle-cart").addEventListener("click", ()=>{
  cartPanel.classList.toggle("hidden");
});

productsContainer.addEventListener("click", e=>{
  if(e.target.tagName==="BUTTON" && e.target.dataset.id) addToCart(parseInt(e.target.dataset.id));
});

document.getElementById("checkout-btn").addEventListener("click", ()=>{
  if(cart.length===0) return alert("Your cart is empty!");
  let msg="Hello! I want to order:\n";
  cart.forEach(item=>{msg+=`${item.name} x${item.qty}\n`;});
  let total=cart.reduce((sum,i)=>sum+i.price*i.qty,0);
  msg+=`Total: AED ${total}`;
  window.open(`https://wa.me/971544588113?text=${encodeURIComponent(msg)}`,"_blank");
});

renderProducts();
