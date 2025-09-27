document.getElementById("orderForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const order = {
    first_name: document.getElementById("firstName").value,
    last_name: document.getElementById("lastName").value,
    phone: document.getElementById("phone").value,
    date: document.getElementById("date").value,
    zaatar_bomb_boxes: document.getElementById("zaatarBombBoxes").value,
    og_bunku_boxes: document.getElementById("ogBunkuBoxes").value,
    diabetes_boxes: document.getElementById("diabetesBoxes").value,
    strawberry_haven_boxes: document.getElementById("strawberryHavenBoxes").value,
    berry_blast_boxes: document.getElementById("berryBlastBoxes").value,
    more_sauce: document.getElementById("moreSauce").value
  };

  try {
    await fetch("https://hook.activepieces.com/YOUR_WEBHOOK_URL", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    document.getElementById("orderForm").classList.add("hidden");
    document.getElementById("confirmation").classList.remove("hidden");
  } catch (error) {
    alert("There was an error submitting your order. Please try again.");
    console.error(error);
  }
});
