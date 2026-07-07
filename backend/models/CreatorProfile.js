const mongoose = require("mongoose");

const creatorProfileSchema = new mongoose.Schema(
  {
    loginId: { type: mongoose.Schema.Types.ObjectId, ref: "Login", required: true, unique: true },
    name: { type: String, default: "" },
    username: { type: String, default: "" },
    socialLinks: { type: [String], default: [] },
    platforms: { type: [String], default: [] },
    niche: { type: String, default: "" },
    categories: { type: [String], default: [] },
    followers: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    pricing: { type: String, default: "" },
    languages: { type: [String], default: [] },
    location: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    acceptedCampaigns: { type: [mongoose.Schema.Types.ObjectId], ref: "CampaignRequirement", default: [] },
    completedCampaigns: { type: [mongoose.Schema.Types.ObjectId], ref: "CampaignRequirement", default: [] },
    availability: { type: String, enum: ["Available", "Busy", "Not Available"], default: "Available" },
    status: { type: String, enum: ["Active", "Blocked", "Suspended", "Pending"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CreatorProfile", creatorProfileSchema);
