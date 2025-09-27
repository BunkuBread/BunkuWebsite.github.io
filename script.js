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
const zaatarBombBoxesInput = document.getElementById('zaatarBombBoxes');
const ogBunkuBoxesInput = document.getElementById('ogBunkuBoxes');
const diabetesBoxesInput = document.getElementById('diabetesBoxes');
const strawberryHavenBoxesInput = document.getElementById('strawberryHavenBoxes');
const berryBlastBoxesInput = document.getElementById('berryBlastBoxes');

// WhatsApp Modal Elements
const waModal = document.getElementById('whatsappModal');
const waTotal = document.getElementById('waTotal');
const waSendBtn = document.getElementById('waSendBtn');

let deliveryFee = 35;

// --- Phone Number Formatting and Validation ---
function formatPhoneNumber(value) {
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

  let total = (zaatarBombBoxes * 55) + (ogBunkuBoxes * 50) + 
              (diabetesBoxes * 55) + (strawberryHavenBoxes * 55) + (berryBlastBoxes * 55);

  if (orderType === 'delivery' && (zaatarBombBoxes + ogBunkuBoxes + diabetesBoxes + strawberryHavenBoxes + berryBlastBoxes) > 0) total += deliveryFee;
  if (moreSauce) total += 5;

  totalPriceSpan.textContent = total;
  orderSummaryDiv.innerHTML =
    `Total: <span id="totalPrice">${total}</span> AED` +
    (orderType === 'delivery' && (zaatarBombBoxes + ogBunkuBoxes + diabetesBoxes + strawberryHavenBoxes + berryBlastBoxes) > 0 ? `<br><span class="fee-note">Includes 35 AED delivery fee</span>` : '') +
    (moreSauce ? `<br><span class="fee-note">Includes 5 AED for extra sauce</span>` : '');
}

// --- LISTENERS ---
[zaatarBombBoxesInput, ogBunkuBoxesInput, diabetesBoxesInput, strawberryHavenBoxesInput, berryBlastBoxesInput, moreSauceCheckbox].forEach(el => {
  el.addEventListener('input', updateTotal);
});
urgentDeliveryCheckbox.addEventListener('change', updateTotal);

// --- FORM SUBMISSION ---
document.getElementById('orderForm').addEventListener('submit', (e) => {
  e.preventDefault();
  updateTotal();

  let message = `Order Details:\n`;
  message += `Name: ${document.getElementById('firstName').value} ${document.getElementById('lastName').value}\n`;
  message += `Phone: ${phoneInput.value}\n`;
  const orderType = document.querySelector('input[name="order_type"]:checked').value;
  message += `Order Type: ${orderType}\n`;
  if (orderType === 'pickup') {
    message += `License Plate: ${document.getElementById('licensePlate').value}\n`;
    message += `Pickup Time: ${pickupTimeInput.value}\n`;
  } else {
    message += `City: ${cityInput.value}\n`;
    message += `Area: ${document.getElementById('areaInput').value}\n`;
    message += `House Number: ${document.getElementById('houseNumber').value}\n`;
  }
  message += `Products:\n`;
  if (parseInt(zaatarBombBoxesInput.value, 10)) message += `Zataar Bomb: ${zaatarBombBoxesInput.value} boxes\n`;
  if (parseInt(ogBunkuBoxesInput.value, 10)) message += `OG: ${ogBunkuBoxesInput.value} boxes\n`;
  if (parseInt(diabetesBoxesInput.value, 10)) message += `Diabetes: ${diabetesBoxesInput.value} boxes\n`;
  if (parseInt(strawberryHavenBoxesInput.value, 10)) message += `Strawberry Haven: ${strawberryHavenBoxesInput.value} boxes\n`;
  if (parseInt(berryBlastBoxesInput.value, 10)) message += `Berry Blast: ${berryBlastBoxesInput.value} boxes\n`;
  if (moreSauceCheckbox.checked) message += `Extra Sauce: Yes\n`;
  message += `Special Instructions: ${document.getElementById('special').value}\n`;
  message += `Date: ${orderDateInput.value}\n`;
  if (urgentDeliveryCheckbox.checked) message += `Urgent Delivery: Yes\n`;
  message += `Total: ${totalPriceSpan.textContent} AED`;

  waTotal.textContent = totalPriceSpan.textContent;
  waSendBtn.onclick = () => {
    const waLink = `https://wa.me/971544588113?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
  };
  waModal.style.display = 'block';
});
