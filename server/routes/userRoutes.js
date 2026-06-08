const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

//  GET USER PROFILE
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE USER PROFILE
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      //user.name = req.body.name || user.name;
      //user.email = req.body.email || user.email;
        // UPDATE NAME
        if (req.body.name !== undefined) {
          user.name = req.body.name;
        }

        // UPDATE EMAIL (FIX)
        if (req.body.email !== undefined) {
          user.email = req.body.email;
        }

      if (req.body.password) {

          const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

          if (!passwordRegex.test(req.body.password)) {
            return res.status(400).json({
              message: "Password must be at least 6 characters and include letters and numbers"
            });
          }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
      }
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });

    } else {
      res.status(404).json({ message: "User not found" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;