const CreatorProfile = require("../models/CreatorProfile");
const BrandProfile = require("../models/BrandProfile");
const CampaignRequirement = require("../models/CampaignRequirement");

async function getProfile(req, res, next) {
  try {
    const profile = await CreatorProfile.findOne({ loginId: req.user._id });
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const allowed = [
      "name", "username", "socialLinks", "platforms", "niche", "categories",
      "followers", "engagementRate", "pricing", "languages", "location",
      "portfolio", "availability",
    ];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const profile = await CreatorProfile.findOneAndUpdate(
      { loginId: req.user._id },
      { $set: updates },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

// Privacy rule: creators only ever see OPEN campaign requirements (matched
// opportunities), never a directory of brands or their private information.
async function getOpportunities(req, res, next) {
  try {
    const { niche, platform, location, minBudget } = req.query;
    const filter = { status: "Open" };
    if (niche) filter.niche = new RegExp(niche, "i");
    if (platform) filter.platform = platform;
    if (minBudget) filter.budget = { $gte: Number(minBudget) };

    let requirements = await CampaignRequirement.find(filter).sort({ dateCreated: -1 }).limit(100);

    if (location) {
      const brandIds = (await BrandProfile.find({ location: new RegExp(location, "i") }).select("_id")).map((b) => String(b._id));
      requirements = requirements.filter((r) => brandIds.includes(String(r.brandId)));
    }

    res.json(requirements);
  } catch (err) {
    next(err);
  }
}

async function acceptCampaign(req, res, next) {
  try {
    const profile = await CreatorProfile.findOne({ loginId: req.user._id });
    if (!profile) return res.status(404).json({ message: "Complete your creator profile first." });

    const requirement = await CampaignRequirement.findById(req.params.id);
    if (!requirement) return res.status(404).json({ message: "Opportunity not found." });
    if (requirement.status !== "Open") {
      return res.status(409).json({ message: "This opportunity is no longer available." });
    }

    requirement.status = "Accepted";
    requirement.acceptedBy = profile._id;
    await requirement.save();

    profile.acceptedCampaigns.push(requirement._id);
    await profile.save();

    res.json(requirement);
  } catch (err) {
    next(err);
  }
}

async function getMyCampaigns(req, res, next) {
  try {
    const profile = await CreatorProfile.findOne({ loginId: req.user._id });
    if (!profile) return res.json([]);

    const campaigns = await CampaignRequirement.find({ acceptedBy: profile._id })
      .populate("brandId", "companyName brandName")
      .sort({ dateCreated: -1 });

    const shaped = campaigns.map((c) => ({
      _id: c._id,
      campaignName: c.campaignName,
      platform: c.platform,
      budget: c.budget,
      status: c.status,
      brandName: c.brandId ? c.brandId.companyName || c.brandId.brandName : "—",
    }));

    res.json(shaped);
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const profile = await CreatorProfile.findOne({ loginId: req.user._id });
    if (!profile) return res.json({ acceptedCampaigns: 0, completedCampaigns: 0, profileCompletion: 0 });

    const fields = ["name", "username", "niche", "followers", "location", "portfolio"];
    const filled = fields.filter((f) => profile[f] && String(profile[f]).length > 0).length;
    const profileCompletion = Math.round((filled / fields.length) * 100);

    res.json({
      acceptedCampaigns: profile.acceptedCampaigns.length,
      completedCampaigns: profile.completedCampaigns.length,
      profileCompletion,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, getOpportunities, acceptCampaign, getMyCampaigns, getStats };
