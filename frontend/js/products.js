





const productList = document.getElementById("product-list");
const categoryBar = document.getElementById("category-bar");

let allProducts = [];

async function loadProducts() {
  try {

    // Get search keyword from URL
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get("keyword") || "";

    // Call backend API
    const res = await fetch(`/api/products?keyword=${keyword}`);
    const products = await res.json();

    console.log("Products:", products);

    allProducts = products;

    // show products
    showProducts(products);

    // create categories only if category bar exists
    if (categoryBar) {
      createCategories(products);
    }

  } catch (error) {
    console.error("Error loading products:", error);
  }
}


// SHOW PRODUCTS
function showProducts(products) {

  if (!productList) return;

  productList.innerHTML = "";

  if (!products || products.length === 0) {
    productList.innerHTML = "<h2>No product found</h2>";
    return;
  }

  products.forEach(product => {

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>${product.brand}</p>
      <p class="price">₹${product.price}</p>
      <a href="product.html?id=${product._id}">View Details</a>
    `;

    productList.appendChild(card);

  });

}


// CREATE CATEGORY BUTTONS
function createCategories(products) {

  const categories = ["All"];

  products.forEach(product => {

    if (!categories.includes(product.category)) {
      categories.push(product.category);
    }

  });

  categoryBar.innerHTML = "";

  categories.forEach(cat => {

    const btn = document.createElement("button");
    btn.textContent = cat;

    btn.onclick = () => {

      if (cat === "All") {
        showProducts(allProducts);
      } else {

        const filtered = allProducts.filter(
          p => p.category === cat
        );

        showProducts(filtered);

      }

    };

    categoryBar.appendChild(btn);

  });

}


loadProducts();


// Search button function
function searchProducts() {

  const keyword = document.getElementById("searchInput").value.trim();

  if (!keyword) {
    window.location.href = "index.html";
    return;
  }

  window.location.href = `index.html?keyword=${keyword}`;
}