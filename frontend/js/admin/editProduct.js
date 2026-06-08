const token = localStorage.getItem("token");

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

async function loadProduct(){

const res = await fetch("/api/products/"+productId);
const product = await res.json();

document.getElementById("name").value = product.name;
document.getElementById("description").value = product.description;
document.getElementById("price").value = product.price;
document.getElementById("brand").value = product.brand;
document.getElementById("category").value = product.category;
document.getElementById("stock").value = product.stock;

}

document.getElementById("editForm").addEventListener("submit", async function(e){

e.preventDefault();



  // ✅ GET VALUES
  const price = Number(document.getElementById("price").value);
  const stock = Number(document.getElementById("stock").value);

  // ✅ VALIDATION
  if (price <= 0) {
    alert("Price must be greater than 0");
    return;
  }

  if (stock < 0) {
    alert("Stock cannot be negative");
    return;
  }



const updatedProduct = {

name: document.getElementById("name").value,
description: document.getElementById("description").value,
price: document.getElementById("price").value,
brand: document.getElementById("brand").value,
category: document.getElementById("category").value,
stock: document.getElementById("stock").value

};

const res = await fetch("/api/products/"+productId,{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body: JSON.stringify(updatedProduct)
});

if(res.ok){

alert("Product updated");

window.location.href="/admin/manage-products.html";

}
else{

alert("Update failed");

}

});

loadProduct();