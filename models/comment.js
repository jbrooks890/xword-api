const mongoose = require("mongoose");
const { Schema } = mongoose;

const Comment = new Schema(
  {
    user: {
      name: { type: String, required: true },
      ip_addr: { type: String, required: true },
      type: { type: String, required: true, enum: ["person", "guest"] },
    },
    content: { type: String, required: true },
    ownerType: {
      type: String,
      enum: ["puzzle", "comment"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      refPath: "ownerType",
    },
    thread: [{ type: Schema.Types.ObjectId, ref: "comment", required: false }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("comment", Comment);
