


const placeOrderBtn = document.getElementById("placeOrderBtn");

placeOrderBtn.addEventListener("click", async () => {

  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ items: cart })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to place order");
    }

    alert("Order placed successfully! ✅");

    // Clear cart
    localStorage.removeItem("cart");
    cart = [];
    renderCart();

    // Redirect to orders page
    window.location.href = "/frontend/profile.html";

  } catch (error) {
    console.error("Order error:", error);
    alert("Something went wrong ❌");
  }
});