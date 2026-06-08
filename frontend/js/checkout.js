


const checkoutItems = document.getElementById("checkoutItems");
const checkoutTotal = document.getElementById("checkoutTotal");
const placeOrderBtn = document.getElementById("placeOrderBtn");

let total = 0;


// ======================== LOAD CART ========================
async function loadCheckout() {

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  try {

    const res = await fetch("/api/cart", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();

    if (!data.cart || data.cart.length === 0) {
      checkoutItems.innerHTML = "<p>Your cart is empty</p>";
      checkoutTotal.textContent = 0;
      return;
    }

    checkoutItems.innerHTML = "";
    total = 0;

    data.cart.forEach(item => {

      const product = item.product;
      const itemTotal = product.price * item.quantity;

      total += itemTotal;

      checkoutItems.innerHTML += `
        <p>${product.name} x ${item.quantity} - ₹${itemTotal}</p>
      `;
    });

    // ================== GST CALCULATION ==================
    const GST_RATE = 0.18;
    const gst = total * GST_RATE;
    const finalTotal = total + gst;

    // ================== SHOW BREAKDOWN ==================
    checkoutItems.innerHTML += `
      <hr>
      <p>Subtotal: ₹${total}</p>
      <p>GST (18%): ₹${gst.toFixed(2)}</p>
      <h3>Total: ₹${finalTotal.toFixed(2)}</h3>
    `;

    // Show final total
    

  } catch (error) {
    console.error(error);
  }

}

loadCheckout();


// ======================== PLACE ORDER ========================
placeOrderBtn.addEventListener("click", async () => {

  const address = document.getElementById("address").value.trim();
  const mobile = document.getElementById("mobile").value.trim();

  if (!address || !mobile) {
    alert("Please fill all fields");
    return;
  }

  //  INDIA MOBILE VALIDATION (+91XXXXXXXXXX)
  const phoneRegex = /^\+91[0-9]{10}$/;

  if (!phoneRegex.test(mobile)) {
    alert("Enter valid mobile number (+91XXXXXXXXXX)");
    return;
  }

  const token = localStorage.getItem("token");

  try {

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        deliveryAddress: address,
        mobileNumber: mobile,
        paymentMethod: "COD"
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    alert("Order placed successfully ✅");

    window.location.href = "profile.html";

  } catch (error) {

    alert(error.message);

  }

});