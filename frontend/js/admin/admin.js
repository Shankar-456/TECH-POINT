

const token = localStorage.getItem("token");

// If no token → go to login
if (!token) {
  alert("Admin login required");
  window.location.href = "/login.html";
}

async function loadDashboard() {

  try {

    const res = await fetch("/api/orders/dashboard/stats", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    console.log("Dashboard Data:", data);

    if (!res.ok) {
      console.log("API error:", data.message);
      return;
    }

    document.getElementById("totalProducts").innerText = data.totalProducts;
    document.getElementById("totalOrders").innerText = data.totalOrders;
    document.getElementById("totalUsers").innerText = data.totalUsers;
    document.getElementById("totalRevenue").innerText = "₹" + data.totalRevenue;

  } catch (error) {

    console.log("Dashboard error:", error);

  }

}

loadDashboard();


function adminLogout(){

localStorage.removeItem("token");
localStorage.removeItem("userInfo");

window.location.href="/login.html";

}

