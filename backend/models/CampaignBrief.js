const mongoose = require("mongoose");

const campaignBriefSchema = new mongoose.Schema(
  {
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "BrandProfile", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    deliverables: { type: String, default: "" },
    platform: { type: String, required: true },
    budget: { type: Number, required: true },
    timeline: { type: String, default: "" },
    guidelines: { type: String, default: "" },
    ndaNotes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Matched", "In Progress", "Completed", "Closed"],
      default: "Submitted",
    },
    assignedCreators: [{ type: mongoose.Schema.Types.ObjectId, ref: "CreatorProfile" }],
    dateCreated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CampaignBrief", campaignBriefSchema);
