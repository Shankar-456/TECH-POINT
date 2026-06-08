const token = localStorage.getItem("token");

if (!token) {
  alert("Admin login required");
  window.location.href = "/login.html";
}

async function loadReviews() {

  try {

    const res = await fetch("/api/products");
    const data = await res.json();

    const products = data.products || data;

    const table = document.getElementById("reviewsTable");

    table.innerHTML = "";

    products.forEach(product => {

      product.reviews.forEach(review => {

        table.innerHTML += `
        <tr>

        <td>${product.name}</td>

        <td>${review.name}</td>

        <td>${review.rating}</td>

        <td>${review.comment}</td>

        <td>

        <button onclick="deleteReview('${product._id}','${review._id}')">
        Delete
        </button>

        </td>

        </tr>
        `;

      });

    });

  } 
  catch (error) {

    console.log("Review load error", error);

  }

}

async function deleteReview(productId, reviewId) {

  if (!confirm("Delete this review?")) return;

  try {

    const res = await fetch(`/api/products/${productId}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {

      alert("Review deleted");

      loadReviews();

    }

  } 
  catch (error) {

    console.log("Delete review error", error);

  }

}

function logoutAdmin() {

  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");

  window.location.href = "/login.html";

}

loadReviews();