




const User = require("../models/User");
const Product = require("../models/Product");

// ADD TO CART
exports.addToCart = async (req, res) => {
  try {

    const { productId, quantity } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if product already in cart
    const existingItem = user.cart.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      user.cart.push({
        product: productId,
        quantity: quantity || 1
      });
    }

    await user.save();

    res.json({
      message: "Product added to cart",
      cart: user.cart
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET CART
exports.getCart = async (req, res) => {
  try {

    const user = await User.findById(req.user._id)
      .populate("cart.product");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //  Remove products that no longer exist
    user.cart = user.cart.filter(item => item.product !== null);

    await user.save();

    res.json({
      cart: user.cart
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE QUANTITY
exports.updateCartQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    const item = user.cart.find(
      item => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.quantity = quantity;
    await user.save();

    res.json({ message: "Cart updated" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// REMOVE ITEM
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(
      item => item.product.toString() !== productId
    );

    await user.save();

    res.json({ message: "Item removed" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};