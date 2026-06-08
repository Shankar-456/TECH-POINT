const token = localStorage.getItem("token");

let reportData = null;

if(!token){
alert("Admin login required");
window.location.href="login.html";
}


// LOAD REPORT
async function loadReport(){

const month = document.getElementById("month").value;
const year = document.getElementById("year").value;

try{

const res = await fetch(`/api/orders/monthly-report?month=${month}&year=${year}`,{
headers:{
Authorization:`Bearer ${token}`
}
});

const data = await res.json();

reportData = data;

const container = document.getElementById("reportResult");

if(!data || data.totalOrders === undefined){
container.innerHTML = "<p>No report data found.</p>";
return;
}

let productsHTML = "";

data.topProducts.forEach((p,i)=>{
productsHTML += `<p>${i+1}. ${p.name} - ${p.sold} sold</p>`;
});

container.innerHTML = `

<h3>Total Orders: ${data.totalOrders}</h3>
<h3>Total Revenue: ₹${data.totalRevenue}</h3>
<h3>Total Customers: ${data.totalCustomers}</h3>

<h4>Top Products</h4>
${productsHTML}

<button onclick="downloadPDF()">Download PDF</button>

`;

}
catch(error){

console.log("Report error:",error);

}

}



// DOWNLOAD PDF
async function downloadPDF(){

const month = document.getElementById("month").value;
const year = document.getElementById("year").value;

const res = await fetch(`/api/orders/monthly-report/pdf?month=${month}&year=${year}`,{
headers:{
Authorization:`Bearer ${token}`
}
});

const blob = await res.blob();

const url = window.URL.createObjectURL(blob);

const a = document.createElement("a");
a.href = url;
a.download = "techpoint-sales-report.pdf";
document.body.appendChild(a);
a.click();
a.remove();

}