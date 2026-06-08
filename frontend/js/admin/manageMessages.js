const token = localStorage.getItem("token");

async function loadMessages() {

try {

const res = await fetch("/api/contact", {
headers:{
Authorization:`Bearer ${token}`
}
});

const messages = await res.json();

const table = document.getElementById("messageTable");

table.innerHTML = "";

messages.forEach(msg => {

table.innerHTML += `
<tr>

<td>${msg.name}</td>

<td>${msg.email}</td>

<td>${msg.message}</td>

<td>${new Date(msg.createdAt).toLocaleDateString("en-GB")}</td>

</tr>
`;

});

}
catch(error){

console.log("Messages error", error);

}

}

loadMessages();