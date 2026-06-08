


const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}


// LOAD PROFILE
async function loadProfile() {

  const res = await fetch("/api/users/profile", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const user = await res.json();

  document.getElementById("profileName").value = user.name;
  document.getElementById("profileMobile").value = user.mobile;
  //document.getElementById("profileEmail").value = user.email || "Not Provided";
  document.getElementById("profileEmail").value = user.email || "";
}




document
.getElementById("updateProfileBtn")
.addEventListener("click", async () => {

  const name = document.getElementById("profileName").value.trim();
  const email = document.getElementById("profileEmail").value.trim();
  const password = document.getElementById("profilePassword").value.trim();

  // EMAIL VALIDATION (optional)
  if (email !== "") {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(email)) {
      alert("Enter a valid email address");
      return;
    }

  }

  const bodyData = {
    name,
    email
  };

  // Only send password if user typed one
  if (password !== "") {
    bodyData.password = password;
  }

  const res = await fetch("/api/users/profile", {

    method: "PUT",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },

    body: JSON.stringify(bodyData)

  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  alert("Profile updated successfully");

});


// LOAD ORDERS
async function loadOrders() {

  try {

    const res = await fetch("/api/orders/myorders", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const orders = await res.json();

    const container = document.getElementById("orderList");

    if (!orders || orders.length === 0) {
      container.innerHTML = "<p>No orders yet</p>";
      return;
    }

    container.innerHTML = "";

    orders.forEach(order => {

      if (!order.orderItems) return;

      order.orderItems.forEach(item => {

        if (!item || !item.product) return;

        const div = document.createElement("div");
        div.className = "order-item";



        let billButton = "";

if(order.paymentStatus === "Paid" || order.orderStatus === "Delivered"){
  billButton = `<button onclick="viewBill('${order._id}')">View Bill</button>`;
}

div.innerHTML = `
  <img src="${item.product.image}" />

  <div class="order-info">

    <h4>${item.product.name}</h4>

    <p>Price: ₹${item.product.price}</p>

    <p>Quantity: ${item.quantity}</p>

    <p>Item Total: ₹${item.product.price * item.quantity}</p>

    <p>GST (18%): ₹${order.gstAmount ? order.gstAmount.toFixed(2) : 0}</p>

    <p><strong>Final: ₹${order.finalAmount ? order.finalAmount.toFixed(2) : (item.product.price * item.quantity)}</strong></p>

    <p>Status: ${order.orderStatus}</p>

    <p>Payment: ${order.paymentStatus}</p>

    ${billButton}

  </div>
`;

        container.appendChild(div);

      });

    });

  } catch (error) {

    console.error("Order load error:", error);

    document.getElementById("orderList").innerHTML =
      "<p>Unable to load orders</p>";

  }

}


loadProfile();
loadOrders();


function viewBill(orderId) {

  window.location.href = `bill.html?id=${orderId}`;

}