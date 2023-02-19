const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectID } = Schema.Types;

const userRoles = { user: 8737, admin: 2366, editor: 3348 };

const Game = new Schema(
  {
    puzzle: {
      type: ObjectID,
      ref: "puzzle",
    },
    game: {},
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
      type: [{ type: Number, enum: Object.values(userRoles) }],
      default: [8737],
    },
    progress: [Game],
    refreshToken: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", User);
