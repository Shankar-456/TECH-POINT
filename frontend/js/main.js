


document.addEventListener("DOMContentLoaded", function () {

     //FAQ TOGGLE (HELP PAGE)

  const questions = document.querySelectorAll(".faq-question");

  if (questions.length > 0) {

    questions.forEach(q => {

      q.addEventListener("click", function () {

        const answer = this.nextElementSibling;

        answer.style.display =
          answer.style.display === "block" ? "none" : "block";

      });

    });

  }



const helpForm = document.getElementById("helpForm");

if (helpForm) {

helpForm.addEventListener("submit", async function(e){

e.preventDefault();

const name = document.getElementById("helpName").value.trim();
const email = document.getElementById("helpEmail").value.trim();
const message = document.getElementById("helpMessage").value.trim();

if(!name || !email || !message){
alert("Please fill all fields");
return;
}

// ✅ EMAIL VALIDATION
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

if(!emailRegex.test(email)){
alert("Enter a valid email address");
return;
}

try{

const response = await fetch("/api/contact",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({name,email,message})
});

const data = await response.json();

if(!response.ok){
throw new Error(data.message || "Failed to send");
}

alert("Message sent successfully ✅");

helpForm.reset();

}
catch(error){

console.log(error);
alert("Something went wrong ❌");

}

});

}


     //LOGIN STATUS CHECK

  const token = localStorage.getItem("token");

  const loginLink = document.getElementById("loginLink");
  const logoutBtn = document.getElementById("logoutBtn");
  const profileLink = document.getElementById("profileLink");

  if (token) {

    if (loginLink) loginLink.style.display = "none";

  } else {

    if (logoutBtn) logoutBtn.style.display = "none";
    if (profileLink) profileLink.style.display = "none";

  }



   //  LOGOUT SYSTEM

  if (logoutBtn) {

    logoutBtn.addEventListener("click", function () {

      localStorage.removeItem("token");

      alert("Logged out successfully");

      window.location.href = "login.html";

    });

  }

});