

const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const Order = require("../models/Order");


   //ADD PRODUCT (ADMIN)

router.post(
  "/",
  protect,
  admin,
  upload.single("image"),
  async (req, res) => {
    try {
      const price = Number(req.body.price);
      if (isNaN(price) || price <= 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be greater than zero",
        });
      }


      const stock = Number(req.body.stock);

    if (isNaN(stock) || stock < 0) {
        return res.status(400).json({
            success: false,
            message: "Stock cannot be negative",
        });
    }


      const product = new Product({
        name: req.body.name,
        description: req.body.description,
        price,
        brand: req.body.brand,
        category: req.body.category,
        stock: stock,
        image: req.file ? `/uploads/${req.file.filename}` : null,
      });

      const createdProduct = await product.save();

      res.status(201).json({
        success: true,
        data: createdProduct,
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


  // GET ALL PRODUCTS (NO LIMIT)

router.get("/", async (req, res) => {
  try {

    // 🔍 Search
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: "i" } }
      : {};

    // 📂 Category filter
    const category = req.query.category
      ? { category: req.query.category }
      : {};

    // 💰 Price filter
    const priceFilter =
      req.query.minPrice && req.query.maxPrice
        ? {
            price: {
              $gte: Number(req.query.minPrice),
              $lte: Number(req.query.maxPrice),
            },
          }
        : {};

    const filter = { ...keyword, ...category, ...priceFilter };

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


   //GET SINGLE PRODUCT

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




// UPDATE PRODUCT (ADMIN)

router.put("/:id", protect, admin, async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ PRICE VALIDATION
    if (req.body.price !== undefined) {
      const price = Number(req.body.price);

      if (isNaN(price) || price <= 0) {
        return res.status(400).json({
          message: "Price must be greater than zero",
        });
      }

      product.price = price;
    }

    // ✅ STOCK VALIDATION
    if (req.body.stock !== undefined) {
      const stock = Number(req.body.stock);

      if (isNaN(stock) || stock < 0) {
        return res.status(400).json({
          message: "Stock cannot be negative",
        });
      }

      product.stock = stock;
    }

    // ✅ OTHER FIELDS (NO CHANGE)
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.brand = req.body.brand || product.brand;
    product.category = req.body.category || product.category;
    product.image = req.body.image || product.image;

    const updatedProduct = await product.save();

    res.json(updatedProduct);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});




  // CREATE REVIEW (ONLY PURCHASED & PAID)

router.post("/:id/reviews", protect, async (req, res) => {
  try {

    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" });
    }

    const order = await Order.findOne({
      user: req.user._id,
      paymentStatus: "Paid",
      "orderItems.product": req.params.id,
    });

    if (!order) {
      return res.status(403).json({
        message: "You can review only purchased & paid products",
      });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({ message: "Review added successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


  // ADMIN DELETE REVIEW

router.delete("/:productId/reviews/:reviewId",
  protect,
  admin,
  async (req, res) => {
    try {

      const product = await Product.findById(req.params.productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      product.reviews = product.reviews.filter(
        (r) => r._id.toString() !== req.params.reviewId
      );

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.length > 0
          ? product.reviews.reduce((acc, item) => acc + item.rating, 0) /
            product.reviews.length
          : 0;

      await product.save();

      res.json({ message: "Review deleted by admin" });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);


   //DELETE PRODUCT (ADMIN)
router.delete("/:id", protect, admin, async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});





// DELETE ORDER (ADMIN)
router.delete("/order/:id", protect, admin, async (req, res) => {

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
