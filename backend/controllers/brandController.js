const BrandProfile = require("../models/BrandProfile");
const CampaignBrief = require("../models/CampaignBrief");

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

async function createBrief(req, res, next) {
  try {
    const profile = await BrandProfile.findOne({ loginId: req.user._id });
    if (!profile) return res.status(404).json({ message: "Complete your brand profile first." });

    const { title, description, deliverables, platform, budget, timeline, guidelines, ndaNotes } = req.body;

    if (!title || !description || !platform || !budget) {
      return res.status(400).json({ message: "Title, description, platform, and budget are required." });
    }

    const brief = await CampaignBrief.create({
      brandId: profile._id,
      title,
      description,
      deliverables: deliverables || "",
      platform,
      budget: Number(budget),
      timeline: timeline || "",
      guidelines: guidelines || "",
      ndaNotes: ndaNotes || "",
      status: "Submitted",
    });

    profile.briefs.push(brief._id);
    await profile.save();

    res.status(201).json(brief);
  } catch (err) {
    next(err);
  }
}

async function getMyBriefs(req, res, next) {
  try {
    const profile = await BrandProfile.findOne({ loginId: req.user._id });
    if (!profile) return res.json([]);
    const briefs = await CampaignBrief.find({ brandId: profile._id }).sort({ dateCreated: -1 });
    res.json(briefs);
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const profile = await BrandProfile.findOne({ loginId: req.user._id });
    if (!profile) return res.json({ totalBriefs: 0, activeBriefs: 0, completedBriefs: 0 });

    const briefs = await CampaignBrief.find({ brandId: profile._id });
    res.json({
      totalBriefs: briefs.length,
      activeBriefs: briefs.filter((b) => ["Submitted", "Under Review", "Matched", "In Progress"].includes(b.status)).length,
      completedBriefs: briefs.filter((b) => b.status === "Completed").length,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, createBrief, getMyBriefs, getStats };
