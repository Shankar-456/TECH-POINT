const token = localStorage.getItem("token");

if(!token){
alert("Admin login required");
window.location.href="/login.html";
}

async function loadProducts(){

try{

const res = await fetch("/api/products");
const data = await res.json();

const products = data.products || data;

const table = document.getElementById("productTable");

table.innerHTML="";

products.forEach(product=>{


table.innerHTML += `
<tr>

<td>
<img src="${product.image}" width="60">
</td>

<td>${product.name}</td>

<td>₹${product.price}</td>

<td>${product.stock}</td>

<td>
<button onclick="editProduct('${product._id}')">
Edit
</button>
</td>

<td>
<button onclick="deleteProduct('${product._id}')">
Delete
</button>
</td>

</tr>
`;


});

}
catch(error){

console.log("Load products error",error);

}

}

async function deleteProduct(id){

if(!confirm("Delete this product?")) return;

try{

const res = await fetch("/api/products/"+id,{
method:"DELETE",
headers:{
Authorization:`Bearer ${token}`
}
});

const data = await res.json();

if(res.ok){

alert("Product deleted");

loadProducts();

}
else{

alert(data.message || "Delete failed");

}

}
catch(error){

console.log("Delete error",error);

}

}

function logoutAdmin(){

localStorage.removeItem("token");
localStorage.removeItem("userInfo");

window.location.href="/login.html";

}

loadProducts();

function editProduct(id){

window.location.href = "/admin/edit-product.html?id=" + id;

}