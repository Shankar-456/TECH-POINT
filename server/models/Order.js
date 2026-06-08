
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ],

    totalAmount: {
      type: Number,
      required: true
    },
///////////////////////////
    gstAmount: {
  type: Number,
  default: 0
},

finalAmount: {
  type: Number,
  default: 0
},
//////////////////////////
    deliveryAddress: {
      type: String,
      required: true
    },

    mobileNumber: {
      type: String,
      required: true
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "CARD"],
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending"
    },

    orderStatus: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered"],
      default: "Processing"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);