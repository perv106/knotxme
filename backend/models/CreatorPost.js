const mongoose = require("mongoose");

const creatorPostSchema = new mongoose.Schema(
  {
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "CreatorProfile", required: true },
    title: { type: String, required: true },
    caption: { type: String, default: "" },
    platform: { type: String, required: true },
    mediaUrl: { type: String, default: "" },
    externalPostUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Draft", "Scheduled", "Published"],
      default: "Published",
    },
    dateCreated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CreatorPost", creatorPostSchema);
