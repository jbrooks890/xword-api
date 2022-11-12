const mongoose = require("mongoose");
const { Schema } = mongoose;

const User = new Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    roles: {
      User: {
        type: Number,
        default: 2001,
      },
      Editor: Number,
      Admin: Number,
    },
    refreshToken: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", User);
