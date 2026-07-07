const BrandProfile = require("../models/BrandProfile");
const CampaignRequirement = require("../models/CampaignRequirement");

async function getProfile(req, res, next) {
  try {
    const profile = await BrandProfile.findOne({ loginId: req.user._id });
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const allowed = [
      "companyName", "brandName", "industry", "website",
      "contactPerson", "phone", "socialLinks", "location",
    ];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const profile = await BrandProfile.findOneAndUpdate(
      { loginId: req.user._id },
      { $set: updates },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

// A brand never loses previous submissions — every requirement is a new record.
async function createRequirement(req, res, next) {
  try {
    const profile = await BrandProfile.findOne({ loginId: req.user._id });
    if (!profile) return res.status(404).json({ message: "Complete your brand profile first." });

    const { campaignName, budget, platform, niche, followersRequired, description, deliverables, deadline } = req.body;

    if (!campaignName || !budget || !platform || !niche || !description) {
      return res.status(400).json({ message: "Campaign name, budget, platform, niche and description are required." });
    }

    const requirement = await CampaignRequirement.create({
      brandId: profile._id,
      campaignName, budget, platform, niche,
      followersRequired, description, deliverables,
      deadline: deadline || undefined,
    });

    profile.currentRequirements.push(requirement._id);
    profile.campaignHistory.push(requirement._id);
    await profile.save();

    res.status(201).json(requirement);
  } catch (err) {
    next(err);
  }
}

async function getMyRequirements(req, res, next) {
  try {
    const profile = await BrandProfile.findOne({ loginId: req.user._id });
    if (!profile) return res.json([]);
    const reqs = await CampaignRequirement.find({ brandId: profile._id }).sort({ dateCreated: -1 });
    res.json(reqs);
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const profile = await BrandProfile.findOne({ loginId: req.user._id });
    if (!profile) return res.json({ totalCampaigns: 0, activeCampaigns: 0, completedCampaigns: 0 });

    const all = await CampaignRequirement.find({ brandId: profile._id });
    res.json({
      totalCampaigns: all.length,
      activeCampaigns: all.filter((c) => ["Open", "Pending", "Accepted", "In Progress"].includes(c.status)).length,
      completedCampaigns: all.filter((c) => c.status === "Completed").length,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, createRequirement, getMyRequirements, getStats };
