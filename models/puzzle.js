const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

function isDraft() {
  return this.isDraft;
}

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
      required: !isDraft,
    },
    type: { type: String, required: true },
    description: { type: String, required: !isDraft },
    cols: { type: Number, required: true },
    rows: { type: Number, required: true },
    version: { type: Number, required: true, default: 0.1 },
    editorMode: {
      active: { type: Boolean, default: false, required: true },
      phase: { type: Number, default: 0, required: true },
    },
    isDraft: { type: Boolean, default: true },
    isMature: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    answerKey: { type: Map, of: String },
    answers: [
      {
        name: { type: String, required: true },
        dir: { type: String, required: true },
        group: [{ type: String, required: true }],
        sum: { type: String, required: true },
        hint: { type: String, required: true },
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
