const CreatorProfile = require("../models/CreatorProfile");
const CreatorPost = require("../models/CreatorPost");
const CampaignBrief = require("../models/CampaignBrief");

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

// Creator Posts CRUD
async function createPost(req, res, next) {
  try {
    const profile = await CreatorProfile.findOne({ loginId: req.user._id });
    if (!profile) return res.status(404).json({ message: "Complete your creator profile first." });

    const { title, caption, platform, mediaUrl, externalPostUrl, status } = req.body;
    if (!title || !platform) {
      return res.status(400).json({ message: "Title and platform are required." });
    }

    const post = await CreatorPost.create({
      creatorId: profile._id,
      title,
      caption: caption || "",
      platform,
      mediaUrl: mediaUrl || "",
      externalPostUrl: externalPostUrl || "",
      status: status || "Published",
    });

    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}

async function getMyPosts(req, res, next) {
  try {
    const profile = await CreatorProfile.findOne({ loginId: req.user._id });
    if (!profile) return res.json([]);

    const posts = await CreatorPost.find({ creatorId: profile._id }).sort({ dateCreated: -1 });
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

async function updatePost(req, res, next) {
  try {
    const profile = await CreatorProfile.findOne({ loginId: req.user._id });
    if (!profile) return res.status(403).json({ message: "Unauthorized." });

    const post = await CreatorPost.findOne({ _id: req.params.id, creatorId: profile._id });
    if (!post) return res.status(404).json({ message: "Post not found." });

    const allowed = ["title", "caption", "platform", "mediaUrl", "externalPostUrl", "status"];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) post[k] = req.body[k];
    });

    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
}

async function deletePost(req, res, next) {
  try {
    const profile = await CreatorProfile.findOne({ loginId: req.user._id });
    if (!profile) return res.status(403).json({ message: "Unauthorized." });

    const result = await CreatorPost.deleteOne({ _id: req.params.id, creatorId: profile._id });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Post not found." });

    res.json({ message: "Post deleted successfully." });
  } catch (err) {
    next(err);
  }
}

// Assigned Campaigns (Privacy-safe: only assigned/matched briefs)
async function getMyCampaigns(req, res, next) {
  try {
    const profile = await CreatorProfile.findOne({ loginId: req.user._id });
    if (!profile) return res.json([]);

    const briefs = await CampaignBrief.find({ assignedCreators: profile._id })
      .select("title platform budget status dateCreated deliverables guidelines timeline")
      .sort({ dateCreated: -1 });

    res.json(briefs);
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const profile = await CreatorProfile.findOne({ loginId: req.user._id });
    if (!profile) return res.json({ assignedCampaigns: 0, publishedPosts: 0, profileCompletion: 0 });

    const [assignedCount, postCount] = await Promise.all([
      CampaignBrief.countDocuments({ assignedCreators: profile._id }),
      CreatorPost.countDocuments({ creatorId: profile._id }),
    ]);

    const fields = ["name", "username", "niche", "followers", "location", "portfolio"];
    const filled = fields.filter((f) => profile[f] && String(profile[f]).length > 0).length;
    const profileCompletion = Math.round((filled / fields.length) * 100);

    res.json({
      assignedCampaigns: assignedCount,
      publishedPosts: postCount,
      profileCompletion,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile, updateProfile,
  createPost, getMyPosts, updatePost, deletePost,
  getMyCampaigns, getStats,
};
