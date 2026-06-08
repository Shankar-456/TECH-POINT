
const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const PDFDocument = require("pdfkit");

const { protect, admin } = require("../middleware/authMiddleware");


   //CREATE ORDER

router.post("/", protect, async (req, res) => {

  try {

    const { deliveryAddress, mobileNumber, paymentMethod } = req.body;

    const user = await User.findById(req.user._id).populate("cart.product");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    let totalAmount = 0;
    let gstAmount = 0;
    let finalAmount = 0;

    const GST_RATE = 0.18; // 18%

    const orderItems = [];

    for (const item of user.cart) {

      const product = item.product;

      if (!product) {
        return res.status(404).json({ message: "Product missing in cart" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`
        });
      }

      totalAmount += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity
      });

      // reduce stock
      product.stock -= item.quantity;
      await product.save();

    }
    gstAmount = totalAmount * GST_RATE;
    finalAmount = totalAmount + gstAmount;

    const order = new Order({

      user: req.user._id,

      orderItems,

      totalAmount,

      gstAmount,

      finalAmount,

      deliveryAddress,

      mobileNumber,

      paymentMethod,

      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",

      orderStatus: "Processing"

    });

    const createdOrder = await order.save();

    // clear cart after order
    user.cart = [];
    await user.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: createdOrder
    });

  }
  catch (error) {

    console.log("ORDER ERROR:", error);

    res.status(500).json({
      message: error.message
    });

  }

});


   //GET USER ORDERS

router.get("/myorders", protect, async (req, res) => {

  try {

    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product");

    res.json(orders);

  }
  catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


   //ADMIN - GET ALL ORDERS

router.get("/", protect, admin, async (req, res) => {

  try {

    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product");

    res.json(orders);

  }
  catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


//ADMIN - UPDATE ORDER / PAYMENT STATUS 

router.put("/:id", protect, admin, async (req, res) => {

  try {

    const order = await Order.findById(req.params.id);

    if (!order) {

      return res.status(404).json({
        message: "Order not found"
      });

    }

    // UPDATE ORDER STATUS 

    if (req.body.orderStatus) {

      order.orderStatus = req.body.orderStatus;

    }

    // UPDATE PAYMENT STATUS 

    if (req.body.paymentStatus) {

      order.paymentStatus = req.body.paymentStatus;

    }

    await order.save();

    res.json({
      message: "Order updated",
      order
    });

  }
  catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


  // ADMIN DASHBOARD STATS

router.get("/dashboard/stats", protect, admin, async (req, res) => {

  try {

    const totalProducts = await Product.countDocuments();

    const totalOrders = await Order.countDocuments();

    const totalUsers = await User.countDocuments();

    const orders = await Order.find();

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    res.json({

      totalProducts,

      totalOrders,

      totalUsers,

      totalRevenue

    });

  }
  catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});








// ==============================
// ADMIN MONTHLY REPORT
// ==============================

router.get("/monthly-report", protect, admin, async (req, res) => {

  try {

    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Month and year are required"
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const orders = await Order.find({
      createdAt: {
        $gte: startDate,
        $lt: endDate
      }
    }).populate("orderItems.product");

    // TOTAL ORDERS
    const totalOrders = orders.length;

    // TOTAL REVENUE
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    // TOTAL CUSTOMERS
    const uniqueUsers = new Set(
      orders.map(order => order.user.toString())
    );

    const totalCustomers = uniqueUsers.size;

    // ==============================
    // TOP PRODUCTS
    // ==============================

    const productSales = {};

    orders.forEach(order => {

      order.orderItems.forEach(item => {

        const productName = item.product.name;

        if (!productSales[productName]) {
          productSales[productName] = 0;
        }

        productSales[productName] += item.quantity;

      });

    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(product => ({
        name: product[0],
        sold: product[1]
      }));


    // ==============================
    // RESPONSE
    // ==============================

    res.json({
      month,
      year,
      totalOrders,
      totalRevenue,
      totalCustomers,
      topProducts
    });

  } 
  catch (error) {

    console.error("Monthly report error:", error);

    res.status(500).json({
      message: "Failed to generate report"
    });

  }

});



// ==============================
// ADMIN MONTHLY REPORT PDF
// ==============================


// ADMIN MONTHLY REPORT PDF
router.get("/monthly-report/pdf", protect, admin, async (req, res) => {

try{

const {month,year} = req.query;

const startDate = new Date(year,month-1,1);
const endDate = new Date(year,month,1);

const orders = await Order.find({
createdAt:{
$gte:startDate,
$lt:endDate
}
}).populate("orderItems.product");

// TOTAL ORDERS
const totalOrders = orders.length;

// TOTAL REVENUE

let subtotal = 0;
let totalGST = 0;
let finalRevenue = 0;

const GST_RATE = 0.18;

orders.forEach(o => {

  const sub = Number(o.totalAmount) || 0;

  const gst = (o.gstAmount !== undefined && o.gstAmount !== null)
    ? Number(o.gstAmount)
    : sub * GST_RATE;

  const final = (o.finalAmount !== undefined && o.finalAmount !== null)
    ? Number(o.finalAmount)
    : sub + gst;

  subtotal += sub;
  totalGST += gst;
  finalRevenue += final;

});


// TOTAL CUSTOMERS
const uniqueUsers = new Set(orders.map(o=>o.user.toString()));
const totalCustomers = uniqueUsers.size;


// TOP PRODUCTS
const productSales = {};

orders.forEach(order=>{
order.orderItems.forEach(item=>{

const name = item.product.name;

if(!productSales[name]){
productSales[name]=0;
}

productSales[name]+=item.quantity;

});
});

const topProducts = Object.entries(productSales)
.sort((a,b)=>b[1]-a[1])
.slice(0,3);


// MONTH NAME
const months=[
"January","February","March","April","May","June",
"July","August","September","October","November","December"
];

const monthName = months[month-1];


// CREATE PDF
const doc = new PDFDocument({margin:50});

res.setHeader("Content-Type","application/pdf");
res.setHeader("Content-Disposition","attachment; filename=techpoint-sales-report.pdf");

doc.pipe(res);


// TITLE
doc.fontSize(22).text("TECHPOINT SALES REPORT",{align:"center"});
doc.moveDown();

doc.text("======================================");
doc.moveDown();

doc.fontSize(14);
doc.text(`Month: ${monthName}`);
doc.text(`Year : ${year}`);

doc.moveDown();

doc.text("----------------------------------");
doc.moveDown();


doc.text(`Total Orders : ${totalOrders}`);
doc.text("Subtotal : Rs " + subtotal.toLocaleString("en-IN"));
doc.text("GST Collected : Rs " + totalGST.toLocaleString("en-IN"));
doc.text("Total Revenue (With GST) : Rs " + finalRevenue.toLocaleString("en-IN"));
doc.text(`Total Customers : ${totalCustomers}`);


doc.moveDown();

doc.text("----------------------------------");
doc.moveDown();

doc.text("Top Products");
doc.moveDown();

topProducts.forEach((p,i)=>{
doc.text(`${i+1}. ${p[0]}        ${p[1]} sold`);
});

doc.moveDown();

doc.text("----------------------------------");
doc.moveDown();

doc.text("Generated By: TechPoint Admin");
doc.text(`Generated On: ${new Date().toDateString()}`);

doc.moveDown();
doc.text("==================================");

doc.end();

}catch(error){

console.log("PDF ERROR:",error);
res.status(500).send("PDF generation failed");

}

});


// GET SINGLE ORDER (FOR BILL / INVOICE)

router.get("/:id", protect, async (req, res) => {

  try {

    const order = await Order.findById(req.params.id)
      .populate("orderItems.product")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json(order);

  }
  catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});





// DELETE ORDER (ADMIN)
router.delete("/:id", protect, admin, async (req, res) => {

  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    await order.deleteOne();

    res.json({
      message: "Order deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});




module.exports = router;