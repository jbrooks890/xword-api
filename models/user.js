const mongoose = require("mongoose");
const { Schema } = mongoose,
  { ObjectId, Map } = Schema.Types;
const Puzzle = require("../models/puzzle");

// console.log({ puzzle: Puzzle.schema });

const userRoles = { User: 8737, Editor: 3348, Admin: 2366 };

const Game = new Schema(
  {
    // puzzle: { type: ObjectId, ref: "puzzle", required: true },
    input: {
      type: Map,
      of: String,
      required: true,
    },
    assists: [String],
    startTime: { type: Date, required: true },
    completeTime: Date,
  },
  {
    toObject: { virtuals: true, getters: true },
    toJSON: { virtuals: true, getters: true },
    timestamps: true,
  }
);

const Draft = new Schema(
  {
    puzzle: {
      name: String,
      type: { type: String, default: "crossword" },
      description: String,
      cols: { type: Number, required: true },
      rows: { type: Number, required: true },
      version: { type: Number, default: 0.1 },
      answerKey: { type: Map, of: String },
      answers: [
        {
          name: { type: String, required: true },
          dir: { type: String, enum: ["across", "down"], required: true },
          group: [String],
          sum: { type: String, required: true },
          clue: String,
        },
      ],
      tags: [String],
    },
    wordBank: {
      type: Map,
      of: {
        name: String,
        dir: { type: String, enum: ["across", "down"], default: "across" },
        group: [String],
        clue: String,
      },
      required: true,
    },
  },
  { timestamps: true }
);

const User = new Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    firstName: String,
    lastName: String,
    email: { type: String, required: true },
    roles: {
      type: [{ type: Number, enum: Object.values(userRoles) }],
      default: [userRoles.User],
    },
    record: { type: Map, of: Game },
    drafts: {
      type: [Draft],
      max: 3,
    },
    refreshToken: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", User);
