
const cartContainer = document.getElementById("cartContainer");
const totalPriceEl = document.getElementById("totalPrice");
const totalSection = document.getElementById("totalSection");
const checkoutBtn = document.getElementById("checkoutBtn");


// LOAD CART
async function loadCart() {

  const token = localStorage.getItem("token");

  if (!token) {
    cartContainer.innerHTML = "<p>Please login first</p>";
    totalSection.style.display = "none";
    return;
  }

  try {

    const res = await fetch("/api/cart", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await res.json();
    const cart = data.cart;

    // EMPTY CART
    if (!cart || cart.length === 0) {
      cartContainer.innerHTML = "<p>Your cart is empty</p>";
      totalPriceEl.textContent = "0";
      totalSection.style.display = "none";
      return;
    }

    cartContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {

      const product = item.product;
      if (!product) return;

      const price = product.price * item.quantity;
      total += price;

      const div = document.createElement("div");
      div.className = "cart-item";

      div.innerHTML = `
        <div class="cart-left-wrapper">

          <img src="${product.image}" alt="${product.name}">

          <div class="cart-info">

            <h3>${product.name}</h3>

            <p class="price">Price: ₹${product.price}</p>

            <div class="qty-box">
              <button onclick="changeQty('${product._id}', ${item.quantity - 1})">-</button>
              <span>${item.quantity}</span>
              <button onclick="changeQty('${product._id}', ${item.quantity + 1})">+</button>
            </div>

            <button class="remove-btn" onclick="removeItem('${product._id}')">
              Remove
            </button>

          </div>

        </div>
      `;

      cartContainer.appendChild(div);

    });

    // UPDATE TOTAL PRICE
    totalPriceEl.textContent = total;

    // SHOW TOTAL SECTION
    totalSection.style.display = "block";

  } catch (error) {

    console.error("Cart error:", error);
    cartContainer.innerHTML = "<p>Error loading cart</p>";
    totalSection.style.display = "none";

  }

}


// CHANGE QUANTITY
async function changeQty(productId, newQty) {

  const token = localStorage.getItem("token");

  if (newQty <= 0) {
    removeItem(productId);
    return;
  }

  await fetch(`/api/cart/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ quantity: newQty })
  });

  loadCart();
}


// REMOVE ITEM
async function removeItem(productId) {

  const token = localStorage.getItem("token");

  await fetch(`/api/cart/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token
    }
  });

  loadCart();
}


// CHECKOUT BUTTON
if (checkoutBtn) {

  checkoutBtn.addEventListener("click", function () {

    window.location.href = "checkout.html";

  });

}


// LOAD CART WHEN PAGE OPEN
loadCart();