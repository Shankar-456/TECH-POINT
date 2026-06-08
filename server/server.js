

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();

   //MIDDLEWARE

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

   //API ROUTES

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));

   //SERVE FRONTEND

const frontendPath = path.join(__dirname, "../frontend");

app.use(express.static(frontendPath));

   //DEFAULT HOME PAGE

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

   //HANDLE UNKNOWN ROUTES

app.use((req, res, next) => {

  // If API route not found
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({
      success: false,
      message: "API route not found"
    });
  }

  // Otherwise return index.html
  res.sendFile(path.join(frontendPath, "index.html"));

});

  // GLOBAL ERROR HANDLER

app.use((err, req, res, next) => {

  console.error("GLOBAL ERROR:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
  });

});

 //  DATABASE CONNECTION

mongoose.connect(process.env.MONGO_URI)
.then(() => {

  console.log("MongoDB Connected ✅");

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

})
.catch((err) => {
  console.error("MongoDB connection error:", err);
});