const mongoose = require("mongoose");
const { Schema } = mongoose;
// const { ObjectId } = Schema;

const Puzzle = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    cols: { type: Number, required: true },
    rows: { type: Number, required: true },
    version: { type: Number, required: true },
    editorMode: {
      active: { type: Boolean, required: true },
      phase: { type: Number, required: true },
    },
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
    likes: { type: Number, required: false },
    comments: [
      { type: Schema.Types.ObjectId, ref: "comment", required: false },
    ],
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("puzzle", Puzzle);
