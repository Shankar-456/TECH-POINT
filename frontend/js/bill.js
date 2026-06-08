const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");

const token = localStorage.getItem("token");

async function loadBill(){

  try{

    const res = await fetch(`/api/orders/${orderId}`,{
      headers:{
        Authorization:`Bearer ${token}`
      }
    });

    const order = await res.json();

    const container = document.getElementById("invoiceContainer");

    let productHTML = "";

    order.orderItems.forEach(item=>{

      const product = item.product;

      const price = product.price * item.quantity;

      productHTML += `
        <tr>
          <td>${product.name}</td>
          <td>${item.quantity}</td>
          <td>₹${product.price}</td>
          <td>₹${price}</td>
        </tr>
      `;
    });

    const subtotal = order.totalAmount;

    const gst = subtotal * 0.18;

    const total = subtotal + gst;

    container.innerHTML = `

    <div class="invoice-card">

      <h2>TECH POINT</h2>

      <p><strong>Order ID:</strong> ${order._id}</p>

      <p><strong>Mobile:</strong> ${order.mobileNumber}</p>

      <p><strong>Address:</strong> ${order.deliveryAddress}</p>

      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-GB")}</p>

      <table class="invoice-table">

        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
        </tr>

        ${productHTML}

      </table>

      <hr>
<p class="subtotal">Subtotal: ₹${subtotal.toFixed(2)}</p>

<p class="gst">GST (18%): ₹${gst.toFixed(2)}</p>

<h3 class="grand">Grand Total: ₹${total.toFixed(2)}</h3>

      <button onclick="downloadPDF()">Download Bill (PDF)</button>

      <p>Payment Method: ${order.paymentMethod}</p>

      <p>Status: ${order.orderStatus}</p>

    </div>

    `;

  }
  catch(error){

    console.log("Invoice error:",error);

  }

}

loadBill();




function downloadPDF(){

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;

  doc.setFontSize(18);
  doc.text("TECH POINT INVOICE", 60, y);

  y += 15;

  const orderId = document.querySelector(".invoice-card p:nth-of-type(1)").innerText;
  const mobile = document.querySelector(".invoice-card p:nth-of-type(2)").innerText;
  const address = document.querySelector(".invoice-card p:nth-of-type(3)").innerText;
  const date = document.querySelector(".invoice-card p:nth-of-type(4)").innerText;

  doc.setFontSize(12);

  doc.text(orderId, 20, y); y+=8;
  doc.text(mobile, 20, y); y+=8;
  doc.text(address, 20, y); y+=8;
  doc.text(date, 20, y); y+=12;

  doc.line(20, y, 190, y);

  y += 10;

  doc.text("Product", 20, y);
  doc.text("Qty", 110, y);
  doc.text("Price", 140, y);
  doc.text("Total", 170, y);

  y += 5;

  doc.line(20, y, 190, y);

  y += 10;

  const rows = document.querySelectorAll(".invoice-table tr");

  rows.forEach((row,index)=>{

    if(index===0) return;

    const cols = row.querySelectorAll("td");

    const product = cols[0].innerText;
    const qty = cols[1].innerText;
    const price = cols[2].innerText.replace(/[₹']/g,"");
    const total = cols[3].innerText.replace(/[₹']/g,"");

    doc.text(product,20,y);
    doc.text(qty,110,y);
    doc.text(price,140,y);
    doc.text(total,170,y);

    y += 10;

  });

  y += 10;

  const subtotal = document.querySelector(".subtotal").innerText.replace(/[₹']/g,"");
  const gst = document.querySelector(".gst").innerText.replace(/[₹']/g,"");
  const grand = document.querySelector(".grand").innerText.replace(/[₹']/g,"");

  doc.text(subtotal,20,y); y+=8;
  doc.text(gst,20,y); y+=8;

  doc.setFontSize(14);
  doc.text(grand,20,y);

  doc.save("TechPoint-Invoice.pdf");

}