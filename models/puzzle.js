const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const Review = {
  author: { type: ObjectId, ref: "user", required: true },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    required: true,
  },
  review: String,
};

const Puzzle = new Schema(
  {
    author: { type: ObjectId, ref: "user", required: true },
    name: {
      type: String,
      required: function () {
        return !this.isDraft;
      },
    },
    type: { type: String, required: true },
    description: {
      type: String,
      required: function () {
        return !this.isDraft;
      },
    },
    cols: { type: Number, required: true },
    rows: { type: Number, required: true },
    version: { type: Number, required: true, default: 0.1 },
    editorMode: {
      active: { type: Boolean, default: false },
      phase: { type: Number, default: 0 },
    },
    isDraft: { type: Boolean, default: true },
    isMature: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    answerKey: { type: Map, of: String },
    answers: [
      {
        name: { type: String, required: true },
        dir: { type: String, enum: ["across", "down"], required: true },
        group: [String],
        sum: { type: String, required: true },
        clue: {
          type: String,
          required: function () {
            return !this.parent().isDraft;
          },
        },
      },
    ],
    likes: [{ type: ObjectId, ref: "user", required: false }],
    comments: [{ type: ObjectId, ref: "comment", required: false }],
    reviews: [Review],
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("puzzle", Puzzle);
