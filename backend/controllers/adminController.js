const Login = require("../models/Login");
const BrandProfile = require("../models/BrandProfile");
const CreatorProfile = require("../models/CreatorProfile");
const CampaignRequirement = require("../models/CampaignRequirement");
const { sendExcel } = require("../utils/exportExcel");

async function getStats(req, res, next) {
  try {
    const [totalUsers, totalBrands, totalCreators, totalCampaigns, activeUsers, blockedUsers] = await Promise.all([
      Login.countDocuments(),
      Login.countDocuments({ role: "brand" }),
      Login.countDocuments({ role: "creator" }),
      CampaignRequirement.countDocuments(),
      Login.countDocuments({ accountStatus: "Active" }),
      Login.countDocuments({ accountStatus: "Blocked" }),
    ]);

    const recentRegistrations = await Login.find().sort({ createdDate: -1 }).limit(5).select("email role createdDate");
    const recentRequirements = await CampaignRequirement.find().sort({ dateCreated: -1 }).limit(5).select("campaignName budget dateCreated");

    // Monthly registrations for the last 6 months
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleString("default", { month: "short" }) });
    }
    const monthlyRegistrations = await Promise.all(
      months.map(async (m) => {
        const start = new Date(m.year, m.month, 1);
        const end = new Date(m.year, m.month + 1, 1);
        const count = await Login.countDocuments({ createdDate: { $gte: start, $lt: end } });
        return { month: m.label, count };
      })
    );

    res.json({
      totalUsers, totalBrands, totalCreators, totalCampaigns, activeUsers, blockedUsers,
      recentRegistrations, recentRequirements, monthlyRegistrations,
    });
  } catch (err) {
    next(err);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const { q, role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (q) filter.email = new RegExp(q, "i");

    const users = await Login.find(filter).select("-password -resetPasswordToken -resetPasswordExpires").sort({ createdDate: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!["Active", "Blocked", "Suspended", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    const user = await Login.findByIdAndUpdate(req.params.id, { accountStatus: status }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const user = await Login.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    await BrandProfile.deleteOne({ loginId: user._id });
    await CreatorProfile.deleteOne({ loginId: user._id });
    res.json({ message: "User deleted." });
  } catch (err) {
    next(err);
  }
}

async function getAllBrands(req, res, next) {
  try {
    const brands = await BrandProfile.find().sort({ createdAt: -1 });
    res.json(brands);
  } catch (err) {
    next(err);
  }
}

async function getAllCreators(req, res, next) {
  try {
    const creators = await CreatorProfile.find().sort({ createdAt: -1 });
    res.json(creators);
  } catch (err) {
    next(err);
  }
}

async function getAllCampaigns(req, res, next) {
  try {
    const campaigns = await CampaignRequirement.find()
      .populate("brandId", "companyName brandName")
      .sort({ dateCreated: -1 });
    const shaped = campaigns.map((c) => ({
      _id: c._id,
      campaignName: c.campaignName,
      brandName: c.brandId ? c.brandId.companyName || c.brandId.brandName : "—",
      platform: c.platform,
      budget: c.budget,
      status: c.status,
      dateCreated: c.dateCreated,
    }));
    res.json(shaped);
  } catch (err) {
    next(err);
  }
}

// ---------- Excel Exports ----------

async function exportCreators(req, res, next) {
  try {
    const creators = await CreatorProfile.find();
    const rows = creators.map((c) => ({
      name: c.name, username: c.username, niche: c.niche,
      platforms: (c.platforms || []).join(", "), followers: c.followers,
      engagementRate: c.engagementRate, pricing: c.pricing,
      languages: (c.languages || []).join(", "), location: c.location,
      availability: c.availability, status: c.status,
    }));
    await sendExcel(res, "creator-data.xlsx", [
      { header: "Name", key: "name" }, { header: "Username", key: "username" },
      { header: "Niche", key: "niche" }, { header: "Platforms", key: "platforms" },
      { header: "Followers", key: "followers" }, { header: "Engagement Rate", key: "engagementRate" },
      { header: "Pricing", key: "pricing" }, { header: "Languages", key: "languages" },
      { header: "Location", key: "location" }, { header: "Availability", key: "availability" },
      { header: "Status", key: "status" },
    ], rows);
  } catch (err) {
    next(err);
  }
}

async function exportBrands(req, res, next) {
  try {
    const brands = await BrandProfile.find();
    const rows = brands.map((b) => ({
      companyName: b.companyName, brandName: b.brandName, industry: b.industry,
      website: b.website, contactPerson: b.contactPerson, phone: b.phone,
      location: b.location, status: b.status,
    }));
    await sendExcel(res, "brand-data.xlsx", [
      { header: "Company Name", key: "companyName" }, { header: "Brand Name", key: "brandName" },
      { header: "Industry", key: "industry" }, { header: "Website", key: "website" },
      { header: "Contact Person", key: "contactPerson" }, { header: "Phone", key: "phone" },
      { header: "Location", key: "location" }, { header: "Status", key: "status" },
    ], rows);
  } catch (err) {
    next(err);
  }
}

async function exportLogins(req, res, next) {
  try {
    const logins = await Login.find().select("-password -resetPasswordToken -resetPasswordExpires");
    const rows = logins.map((l) => ({
      email: l.email, role: l.role, accountStatus: l.accountStatus,
      createdDate: l.createdDate ? l.createdDate.toISOString() : "",
      lastLogin: l.lastLogin ? l.lastLogin.toISOString() : "",
    }));
    await sendExcel(res, "login-data.xlsx", [
      { header: "Email", key: "email" }, { header: "Role", key: "role" },
      { header: "Account Status", key: "accountStatus" }, { header: "Created Date", key: "createdDate" },
      { header: "Last Login", key: "lastLogin" },
    ], rows);
  } catch (err) {
    next(err);
  }
}

async function exportCampaigns(req, res, next) {
  try {
    const campaigns = await CampaignRequirement.find().populate("brandId", "companyName brandName");
    const rows = campaigns.map((c) => ({
      campaignName: c.campaignName,
      brandName: c.brandId ? c.brandId.companyName || c.brandId.brandName : "",
      budget: c.budget, platform: c.platform, niche: c.niche,
      followersRequired: c.followersRequired, status: c.status,
      dateCreated: c.dateCreated ? c.dateCreated.toISOString() : "",
    }));
    await sendExcel(res, "campaign-requirements.xlsx", [
      { header: "Campaign Name", key: "campaignName" }, { header: "Brand", key: "brandName" },
      { header: "Budget", key: "budget" }, { header: "Platform", key: "platform" },
      { header: "Niche", key: "niche" }, { header: "Followers Required", key: "followersRequired" },
      { header: "Status", key: "status" }, { header: "Date Created", key: "dateCreated" },
    ], rows);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStats, getAllUsers, updateUserStatus, deleteUser,
  getAllBrands, getAllCreators, getAllCampaigns,
  exportCreators, exportBrands, exportLogins, exportCampaigns,
};
