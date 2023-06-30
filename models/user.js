const mongoose = require("mongoose");
const { Schema } = mongoose,
  { ObjectId } = Schema.Types;

const Game = new Schema(
  {
    puzzle: { type: ObjectId, ref: "puzzle" },
    input: { type: Map, of: String, required: true },
    assists: [String],
    startTime: String,
    lastSave: { type: Date, required: true },
  },
  { timestamps: true }
);

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
        default: 8737,
      },
      Editor: Number,
      Admin: Number,
    },
    record: [Game],
    refreshToken: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", User);
