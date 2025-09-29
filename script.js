// --- Product Price Data ---
const deliveryFee = 35;

const productPrices = {
  zaatar_bomb_boxes: 55,
  og_bunku_boxes: 50,
  diabetes_boxes: 55,
  strawberry_haven_boxes: 55,
  berry_blast_boxes: 55
};

// --- DOM Elements ---
const orderTypeRadios = document.querySelectorAll('input[name="order_type"]');
const pickupFields = document.getElementById('pickupFields');
const deliveryFields = document.getElementById('deliveryFields');
const totalPriceSpan = document.getElementById('totalPrice');
const orderSummaryDiv = document.getElementById('orderSummary');
const phoneInput = document.getElementById('phoneInput');
const orderDateInput = document.getElementById('orderDate');
const moreSauceCheckbox = document.getElementById('moreSauce');
const urgentDeliveryDiv = document.getElementById('urgentDeliveryDiv');
const urgentDeliveryCheckbox = document.getElementById('urgentDelivery');
const cityInput = document.getElementById('cityInput');
const pickupTimeInput = document.getElementById('pickupTime');

// --- Product Inputs ---
const zaatarBombBoxesInput = document.getElementById('zaatarBombBoxes');
const ogBunkuBoxesInput = document.getElementById('ogBunkuBoxes');
const diabetesBoxesInput = document.getElementById('diabetesBoxes');
const strawberryHavenBoxesInput = document.getElementById('strawberryHavenBoxes');
const berryBlastBoxesInput = document.getElementById('berryBlastBoxes');

// WhatsApp Modal Elements
const waModal = document.getElementById('whatsappModal');
const waTotal = document.getElementById('waTotal');
const waSendBtn = document.getElementById('waSendBtn');

// --- Phone Number Formatting and Validation ---
function formatPhoneNumber(value) {
  if (!value) return null;
  let digits = value.replace(/\D/g, '');
  if (!digits.startsWith('05') || digits.length !== 10) {
    return null;
  }
  return digits.slice(0,3) + ' ' + digits.slice(3,6) + '-' + digits.slice(6);
}
phoneInput.addEventListener('blur', () => {
  const formatted = formatPhoneNumber(phoneInput.value);
  if (formatted) {
    phoneInput.value = formatted;
    phoneInput.classList.remove('input-error');
  } else {
    phoneInput.classList.add('input-error');
  }
});

// --- FORM LOGIC ---
function updateFields() {
  const orderType = document.querySelector('input[name="order_type"]:checked').value;
  if (orderType === 'pickup') {
    pickupFields.style.display = 'block';
    deliveryFields.style.display = 'none';
    pickupTimeInput.required = true;
    document.getElementsByName('city')[0].required = false;
    document.getElementsByName('area')[0].required = false;
    document.getElementsByName('house_number')[0].required = false;
    document.getElementsByName('license_plate')[0].required = true;
    urgentDeliveryDiv.style.display = 'none';
  } else {
    pickupFields.style.display = 'none';
    deliveryFields.style.display = 'block';
    pickupTimeInput.required = false;
    document.getElementsByName('city')[0].required = true;
    document.getElementsByName('area')[0].required = true;
    document.getElementsByName('house_number')[0].required = true;
    document.getElementsByName('license_plate')[0].required = false;
    urgentDeliveryDiv.style.display = 'none';
  }
  updateTotal();
}
orderTypeRadios.forEach((radio) => radio.addEventListener('change', updateFields));
updateFields();

// --- Price Calculation ---
function updateTotal() {
  const zaatarBombBoxes = parseInt(zaatarBombBoxesInput.value, 10) || 0;
  const ogBunkuBoxes = parseInt(ogBunkuBoxesInput.value, 10) || 0;
  const diabetesBoxes = parseInt(diabetesBoxesInput.value, 10) || 0;
  const strawberryHavenBoxes = parseInt(strawberryHavenBoxesInput.value, 10) || 0;
  const berryBlastBoxes = parseInt(berryBlastBoxesInput.value, 10) || 0;
  const orderType = document.querySelector('input[name="order_type"]:checked').value;
  const moreSauce = moreSauceCheckbox.checked;

  let total = (zaatarBombBoxes * productPrices.zaatar_bomb_boxes) +
              (ogBunkuBoxes * productPrices.og_bunku_boxes) +
              (diabetesBoxes * productPrices.diabetes_boxes) +
              (strawberryHavenBoxes * productPrices.strawberry_haven_boxes) +
              (berryBlastBoxes * productPrices.berry_blast_boxes);

  if (orderType === 'delivery' &&
      (zaatarBombBoxes + ogBunkuBoxes + diabetesBoxes + strawberryHavenBoxes + berryBlastBoxes) > 0)
    total += deliveryFee;
  if (moreSauce)
    total += 5;

  totalPriceSpan.textContent = total;
  orderSummaryDiv.innerHTML =
    `Total: <span id="totalPrice">${total}</span> AED` +
    (orderType === 'delivery' && (zaatarBombBoxes + ogBunkuBoxes + diabetesBoxes + strawberryHavenBoxes + berryBlastBoxes) > 0
      ? `<br><span class="fee-note">Includes 35 AED delivery fee</span>` : '') +
    (moreSauce ? `<br><span class="fee-note">Includes 5 AED for extra sauce</span>` : '');
}
[zaatarBombBoxesInput, ogBunkuBoxesInput, diabetesBoxesInput, strawberryHavenBoxesInput, berryBlastBoxesInput].forEach(input => input.addEventListener('input', updateTotal));
moreSauceCheckbox.addEventListener('change', updateTotal);

// --- Urgent Delivery Logic ---
orderDateInput.addEventListener('change', checkUrgentDelivery);
cityInput.addEventListener('blur', checkUrgentDelivery);
function checkUrgentDelivery() {
  urgentDeliveryDiv.style.display = 'none';
  urgentDeliveryCheckbox.checked = false;
  urgentDeliveryCheckbox.required = false;
}

// --- ORDER FORM SUBMISSION & WHATSAPP MODAL ---
document.getElementById('orderForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  let orderData = {};
  formData.forEach((v, k) => orderData[k] = v);

  const zaatarBombBoxes = parseInt(zaatarBombBoxesInput.value, 10) || 0;
  const ogBunkuBoxes = parseInt(ogBunkuBoxesInput.value, 10) || 0;
  const diabetesBoxes = parseInt(diabetesBoxesInput.value, 10) || 0;
  const strawberryHavenBoxes = parseInt(strawberryHavenBoxesInput.value, 10) || 0;
  const berryBlastBoxes = parseInt(berryBlastBoxesInput.value, 10) || 0;

  if ((zaatarBombBoxes + ogBunkuBoxes + diabetesBoxes + strawberryHavenBoxes + berryBlastBoxes) === 0) {
    alert("Please order at least one box of bread.");
    return false;
  }

  const orderType = orderData['order_type'] || 'pickup';
  let now = new Date();
  let selectedDate = new Date(orderData['date']);
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);
  let isToday = selectedDate.getTime() === today.getTime();

  if (orderType === 'delivery' && isToday && now.getHours() >= 9) {
    alert("Since your order was placed after 9 AM, your delivery will be sent out the next day.");
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    orderData['date'] = `${yyyy}-${mm}-${dd}`;
    orderDateInput.value = orderData['date'];
    selectedDate = new Date(orderData['date']);
    isToday = false;
  }

  if (orderType === 'pickup' && !orderData['pickup_time']) {
    alert("Please enter your preferred pickup time.");
    return false;
  }

  if (orderData['pickup_time'] === '') {
    orderData['pickup_time'] = null;
  }

  orderData['more_sauce'] = moreSauceCheckbox.checked ? true : false;
  orderData['zaatar_bomb_boxes'] = zaatarBombBoxes;
  orderData['og_bunku_boxes'] = ogBunkuBoxes;
  orderData['diabetes_boxes'] = diabetesBoxes;
  orderData['strawberry_haven_boxes'] = strawberryHavenBoxes;
  orderData['berry_blast_boxes'] = berryBlastBoxes;

  let total = (zaatarBombBoxes * productPrices.zaatar_bomb_boxes) +
      (ogBunkuBoxes * productPrices.og_bunku_boxes) +
      (diabetesBoxes * productPrices.diabetes_boxes) +
      (strawberryHavenBoxes * productPrices.strawberry_haven_boxes) +
      (berryBlastBoxes * productPrices.berry_blast_boxes);

  if (orderType === 'delivery' && (zaatarBombBoxes + ogBunkuBoxes + diabetesBoxes + strawberryHavenBoxes + berryBlastBoxes) > 0) total += deliveryFee;
  if (orderData['more_sauce']) total += 5;
  orderData['total'] = total;

  // Show WhatsApp modal
  waTotal.textContent = total;
  waModal.classList.add('show');
  waModal.setAttribute('aria-hidden', 'false');

  waSendBtn.onclick = () => {
    let msg = `Hello! I just placed an order on the Bunku Bread website.\n\n`;
    msg += `Name: ${orderData['first_name'] || ''} ${orderData['last_name'] || ''}\n`;
    msg += `Phone: ${orderData['phone'] || ''}\n`;

    if (orderType === 'delivery') {
      msg += `Order Type: Delivery\n`;
      msg += `City: ${orderData['city'] || ''}\nArea: ${orderData['area'] || ''}\nHouse Number: ${orderData['house_number'] || ''}\n`;
    } else {
      msg += `Order Type: Pickup\n`;
      msg += `License Plate: ${orderData['license_plate'] || ''}\nPickup Time: ${orderData['pickup_time'] || ''}\n`;
    }

    msg += `\nOrders:\n`;
    if (zaatarBombBoxes > 0) msg += `Zaatar Bomb: ${zaatarBombBoxes} boxes\n`;
    if (ogBunkuBoxes > 0) msg += `OG Bunku: ${ogBunkuBoxes} boxes\n`;
    if (diabetesBoxes > 0) msg += `Diabetes: ${diabetesBoxes} boxes\n`;
    if (strawberryHavenBoxes > 0) msg += `Strawberry Haven: ${strawberryHavenBoxes} boxes\n`;
    if (berryBlastBoxes > 0) msg += `Berry Blast: ${berryBlastBoxes} boxes\n`;
    if (orderData['more_sauce']) msg += `Extra Sauce: Yes\n`;
    if (orderData['special']) msg += `Special Instructions: ${orderData['special']}\n`;

    msg += `Date: ${orderData['date']}\nTotal: ${total} AED`;

    const waLink = `https://wa.me/971544588113?text=${encodeURIComponent(msg)}`;
    window.open(waLink, '_blank');
  };
});
