const mongoose = require("mongoose");

const campaignRequirementSchema = new mongoose.Schema(
  {
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "BrandProfile", required: true },
    campaignName: { type: String, required: true },
    budget: { type: Number, required: true },
    platform: { type: String, required: true },
    niche: { type: String, required: true },
    followersRequired: { type: String, default: "" },
    description: { type: String, required: true },
    deliverables: { type: String, default: "" },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ["Open", "Pending", "Accepted", "In Progress", "Completed", "Closed"],
      default: "Open",
    },
    dateCreated: { type: Date, default: Date.now },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "CreatorProfile", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CampaignRequirement", campaignRequirementSchema);
