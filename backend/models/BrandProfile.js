const mongoose = require("mongoose");

const brandProfileSchema = new mongoose.Schema(
  {
    loginId: { type: mongoose.Schema.Types.ObjectId, ref: "Login", required: true, unique: true },
    companyName: { type: String, default: "" },
    brandName: { type: String, default: "" },
    industry: { type: String, default: "" },
    website: { type: String, default: "" },
    contactPerson: { type: String, default: "" },
    phone: { type: String, default: "" },
    socialLinks: { type: [String], default: [] },
    location: { type: String, default: "" },
    currentRequirements: { type: [mongoose.Schema.Types.ObjectId], ref: "CampaignRequirement", default: [] },
    previousRequirements: { type: [mongoose.Schema.Types.ObjectId], ref: "CampaignRequirement", default: [] },
    campaignHistory: { type: [mongoose.Schema.Types.ObjectId], ref: "CampaignRequirement", default: [] },
    status: { type: String, enum: ["Active", "Blocked", "Suspended", "Pending"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BrandProfile", brandProfileSchema);
