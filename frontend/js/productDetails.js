



// GET PRODUCT ID FROM URL

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");


// LOAD PRODUCT

async function loadProduct() {

  try {

    if (!productId) {
      document.getElementById("product-details").innerHTML =
        "<h2>Product not found</h2>";
      return;
    }

    const res = await fetch(`/api/products/${productId}`);

    if (!res.ok) throw new Error("Product not found");

    const data = await res.json();
    const product = data.product || data;

    const container = document.getElementById("product-details");
    container.innerHTML = `
      <div class="details-card">

    <div class="details-image">
      <img src="${product.image}" alt="${product.name}">
    </div>

    <div class="details-info">

      <h2>${product.name}</h2>

      <p class="price"><strong>Price:</strong>₹${product.price}</p>

      <p><strong>Brand:</strong> ${product.brand}</p>
      <p><strong>Category:</strong> ${product.category}</p>
      <p><strong>Stock:</strong> ${product.stock}</p>
      <p><strong>Rating:</strong> ⭐ ${product.rating || 0} (${product.numReviews || 0} reviews)</p>

      <button class="add-btn" onclick="addToCart('${product._id}')">
        ADD TO CART
      </button>

      <div class="description">
        <h3>Description</h3>
        <p>${product.description}</p>
      </div>

    </div>

  </div>
      <div class="review-section">

        <h2>Customer Reviews</h2>

        <div id="review-list"></div>

        <h3>Add Review</h3>

        <select id="rating">
          <option value="">Select Rating</option>
          <option value="1">1 ⭐</option>
          <option value="2">2 ⭐</option>
          <option value="3">3 ⭐</option>
          <option value="4">4 ⭐</option>
          <option value="5">5 ⭐</option>
        </select>

        <textarea id="comment" placeholder="Write your review"></textarea>

        <button onclick="submitReview()">Submit Review</button>

      </div>
    `;

    showReviews(product.reviews);

  } catch (error) {

    console.error("Product load error:", error);

    document.getElementById("product-details").innerHTML =
      "<h2>Error loading product</h2>";

  }

}

loadProduct();


// ADD TO CART

async function addToCart(productId) {

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  try {

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        productId: productId,
        quantity: 1
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Cart error");
    }

    alert("Product added to cart ✅");

  } catch (error) {

    console.error("Cart error:", error);
    alert(error.message || "Error adding product to cart");

  }

}


// SHOW REVIEWS

function showReviews(reviews) {

  const list = document.getElementById("review-list");

  if (!reviews || reviews.length === 0) {
    list.innerHTML = "<p>No reviews yet</p>";
    return;
  }

  list.innerHTML = reviews.map(r => `
    <div class="review-card">
      <strong>${r.name}</strong>
      <p>⭐ ${r.rating}</p>
      <p>${r.comment}</p>
    </div>
  `).join("");

}


// SUBMIT REVIEW

async function submitReview() {

  const rating = document.getElementById("rating").value;
  const comment = document.getElementById("comment").value;

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Login first");
    return;
  }

  if (!rating || !comment) {
    alert("Please fill rating and comment");
    return;
  }

  try {

    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        rating,
        comment
      })
    });

    const data = await res.json();

    alert(data.message);

    location.reload();

  } catch (error) {

    console.error("Review error:", error);
    alert("Error submitting review");

  }

}