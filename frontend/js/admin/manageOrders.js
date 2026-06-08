
const token = localStorage.getItem("token");

if (!token) {
  alert("Admin login required");
  window.location.href = "/login.html";
}

async function loadOrders() {

  try {

    const res = await fetch("/api/orders", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const orders = await res.json();

    const table = document.getElementById("ordersTable");

    table.innerHTML = "";

    orders.forEach(order => {

        // Build product list safely
        let products = order.orderItems.map(item => {

            const name = item.product?.name || item.name || "Deleted Product";

            return `${name} (x${item.quantity})`;

        }).join("<br>");

        table.innerHTML += `
        <tr>

  <td>${order._id}</td>

  <td>${order.user?.name || "User"}</td>

  <td>${products}</td>

  <td>${order.deliveryAddress || "N/A"}</td>

  <td>${order.mobileNumber || "N/A"}</td>

  <!--
  <td>₹${order.totalAmount}</td>
  -->

  <!--
  <td style="line-height:1.6;">
  Subtotal: ₹${order.totalAmount}<br>
  GST: ₹${order.gstAmount || 0}<br>
  <strong>Total: ₹${order.finalAmount || order.totalAmount}</strong>
  </td>
  -->

  <td style="line-height:1.6;">
  Subtotal: ₹${(order.totalAmount || 0).toFixed(2)}<br>
  GST: ₹${(order.gstAmount || 0).toFixed(2)}<br>
  <strong>Total: ₹${(order.finalAmount || order.totalAmount || 0).toFixed(2)}</strong>
  </td>
  




  <td>

  <select onchange="updatePayment('${order._id}', this.value)">
  <option ${order.paymentStatus==="Pending"?"selected":""}>Pending</option>
  <option ${order.paymentStatus==="Paid"?"selected":""}>Paid</option>
  </select>

  </td>

  <td>${order.orderStatus}</td>

  <td>

  <select onchange="updateStatus('${order._id}', this.value)">
  <option ${order.orderStatus==="Processing"?"selected":""}>Processing</option>
  <option ${order.orderStatus==="Shipped"?"selected":""}>Shipped</option>
  <option ${order.orderStatus==="Delivered"?"selected":""}>Delivered</option>
  </select>

  </td>



  <td>
  <button onclick="deleteOrder('${order._id}')">Delete</button>
</td>



  </tr>
  `;

});

  }
  catch (error) {

    console.log("Orders error", error);

  }

}

//loadOrders();


// UPDATE ORDER STATUS 

async function updateStatus(id, status) {

  try {

    const res = await fetch("/api/orders/" + id, {

      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },

      body: JSON.stringify({
        orderStatus: status
      })

    });

    if (res.ok) {

      alert("Order status updated");

      loadOrders();

    }

  }
  catch (error) {

    console.log("Update error", error);

  }

}


//UPDATE PAYMENT STATUS 

async function updatePayment(id, paymentStatus) {

  try {

    const res = await fetch("/api/orders/" + id, {

      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },

      body: JSON.stringify({
        paymentStatus: paymentStatus
      })

    });

    if (res.ok) {

      alert("Payment status updated");

      loadOrders();

    }

  }
  catch (error) {

    console.log("Payment update error", error);

  }

}


function logoutAdmin() {

  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");

  window.location.href = "/login.html";

}




async function deleteOrder(id) {

  if (!confirm("Delete this order?")) return;

  try {

    const res = await fetch("/api/orders/" + id, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      alert("Order deleted");
      loadOrders();
    }

  } catch (error) {
    console.log(error);
  }

}



loadOrders();