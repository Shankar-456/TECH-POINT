
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// REGISTER
exports.register = async (req, res) => {
  try {

    const { name, mobile, email, password } = req.body;

    // MOBILE VALIDATION (10 digits)
    const mobileRegex = /^[0-9]{10}$/;

    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        message: "Mobile number must be exactly 10 digits"
      });
    }

    // EMAIL VALIDATION (optional)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: "Invalid email format"
        });
      }
    }

    // PASSWORD VALIDATION
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters with letters and numbers"
      });
    }

    // CHECK IF MOBILE EXISTS
const mobileExists = await User.findOne({ mobile });

if (mobileExists) {
  return res.status(400).json({
    message: "Mobile number already registered"
  });
}

// CHECK IF EMAIL EXISTS (only if email provided)
if (email) {

  const emailExists = await User.findOne({ email });

  if (emailExists) {
    return res.status(400).json({
      message: "Email already registered"
    });
  }

}

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
    name,
    mobile,
    email: email || null,
    password: hashedPassword
    });
    
    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ======================== LOGIN ========================
exports.login = async (req, res) => {

  try {

    const { mobile, password } = req.body;

    // FIND USER BY MOBILE
    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(400).json({
        message: "Invalid mobile or password"
      });
    }

    // CHECK PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid mobile or password"
      });
    }

    // CREATE TOKEN
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // SEND USER DATA
    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};