

const express = require("express");
const router = express.Router();

const Contact = require("../models/Contact");
const { protect, admin } = require("../middleware/authMiddleware");



  // SEND MESSAGE (USER)

router.post("/", async (req, res) => {

  try {

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields required" });
    }

    const newMessage = new Contact({
      name,
      email,
      message
    });

    await newMessage.save();

    res.status(201).json({ message: "Message saved successfully" });

  } 
  catch (error) {

    res.status(500).json({ message: "Server error" });

  }

});



  // GET MESSAGES (ADMIN)

router.get("/", protect, admin, async (req, res) => {

  try {

    const messages = await Contact.find().sort({ createdAt: -1 });

    res.json(messages);

  } 
  catch (error) {

    res.status(500).json({ message: error.message });

  }

});



module.exports = router;