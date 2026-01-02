const mongoose = require("mongoose");

const BusSchema = new mongoose.Schema(
  {
    image: {
      data: { type: Buffer, required: true },      
      contentType: { type: String, required: true }, 
    },
    route: {
      type: String,
      required: true,
    },
    regNo: {
      type: String,
      required: true,
      unique: true,
    },
    seats: {
      type: Number,
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Invalid phone number"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bus", BusSchema);