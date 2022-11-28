const mongoose = require("mongoose");
const { Schema } = mongoose;

const Puzzle = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "user", required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    cols: { type: Number, required: true },
    rows: { type: Number, required: true },
    version: { type: Number, required: true },
    editorMode: {
      active: { type: Boolean, default: false, required: true },
      phase: { type: Number, default: 0, required: true },
    },
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
    likes: [{ type: Schema.Types.ObjectId, ref: "user", required: false }],
    comments: [
      { type: Schema.Types.ObjectId, ref: "comment", required: false },
    ],
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("puzzle", Puzzle);
