


const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

// ADD TO CART
router.post("/", protect, addToCart);

// GET CART
router.get("/", protect, getCart);

// UPDATE QUANTITY
router.put("/:productId", protect, updateCartQuantity);

// REMOVE ITEM
router.delete("/:productId", protect, removeFromCart);

module.exports = router;