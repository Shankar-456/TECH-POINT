


const token = localStorage.getItem("token");

if(!token){
alert("Admin login required");
window.location.href="/login.html";
}

const form = document.getElementById("addProductForm");

form.addEventListener("submit", async function(e){

e.preventDefault();



// ✅ GET VALUES
  const price = Number(document.getElementById("price").value);
  const stock = Number(document.getElementById("stock").value);

  // ✅ FRONTEND VALIDATION
  if (price <= 0) {
    alert("Price must be greater than 0");
    return;
  }

  if (stock < 0) {
    alert("Stock cannot be negative");
    return;
  }



const formData = new FormData();

formData.append("name", document.getElementById("name").value);
formData.append("description", document.getElementById("description").value);
formData.append("price", document.getElementById("price").value);
formData.append("brand", document.getElementById("brand").value);
formData.append("category", document.getElementById("category").value);
formData.append("stock", document.getElementById("stock").value);
formData.append("image", document.getElementById("image").files[0]);

try{

const res = await fetch("/api/products", {
method:"POST",
headers:{
Authorization:`Bearer ${token}`
},
body:formData
});

const data = await res.json();

if(res.ok){

alert("Product Added Successfully ✅");

form.reset();

}
else{

alert(data.message || "Error adding product");

}

}
catch(error){

console.log("Add product error",error);

}

});
