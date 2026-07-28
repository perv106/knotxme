// api.js — fetch wrapper shared across login/signup/dashboard pages.
(function () {
  const BASE = window.KNOTXME_CONFIG.API_BASE_URL;

  function getToken() {
    return localStorage.getItem("knotxme_token");
  }
  function getUser() {
    try {
      return JSON.parse(localStorage.getItem("knotxme_user") || "null");
    } catch (e) {
      return null;
    }
  }
  function setSession(token, user) {
    localStorage.setItem("knotxme_token", token);
    localStorage.setItem("knotxme_user", JSON.stringify(user));
  }
  function clearSession() {
    localStorage.removeItem("knotxme_token");
    localStorage.removeItem("knotxme_user");
  }

  async function request(path, options) {
    options = options || {};
    const headers = Object.assign(
      { "Content-Type": "application/json" },
      options.headers || {}
    );
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;

    const res = await fetch(BASE + path, {
      method: options.method || "GET",
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      /* no body */
    }

    if (!res.ok) {
      const err = new Error((data && data.message) || "Request failed");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  window.KnotxmeAPI = {
    getToken,
    getUser,
    setSession,
    clearSession,
    isLoggedIn: () => !!getToken(),

    // ---- Auth ----
    signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
    login: (payload) => request("/auth/login", { method: "POST", body: payload }),
    adminLogin: (payload) => request("/auth/admin-login", { method: "POST", body: payload }),
    forgotPassword: (payload) => request("/auth/forgot-password", { method: "POST", body: payload }),
    resetPassword: (payload) => request("/auth/reset-password", { method: "POST", body: payload }),
    logout: () => request("/auth/logout", { method: "POST" }).finally(clearSession),

    // ---- Brand ----
    getBrandProfile: () => request("/brand/profile"),
    updateBrandProfile: (payload) => request("/brand/profile", { method: "PUT", body: payload }),
    createBrief: async (payload) => {
      try {
        return await request("/brand/briefs", { method: "POST", body: payload });
      } catch (err) {
        if (err.status === 404) {
          // Robust fallback for live backend during Render redeploy window
          return await request("/brand/requirements", {
            method: "POST",
            body: {
              campaignName: payload.title,
              budget: payload.budget,
              platform: payload.platform,
              niche: "General",
              description: payload.description,
              deliverables: payload.deliverables || payload.guidelines,
              deadline: payload.timeline,
            },
          });
        }
        throw err;
      }
    },
    getMyBriefs: async () => {
      try {
        return await request("/brand/briefs");
      } catch (err) {
        if (err.status === 404) {
          const reqs = await request("/brand/requirements");
          return (reqs || []).map((r) => ({
            _id: r._id,
            title: r.campaignName || r.title,
            platform: r.platform,
            budget: r.budget,
            status: r.status,
            description: r.description,
            dateCreated: r.dateCreated,
          }));
        }
        throw err;
      }
    },
    createRequirement: (payload) => request("/brand/briefs", { method: "POST", body: payload }),
    getMyRequirements: () => request("/brand/briefs"),
    getBrandStats: () => request("/brand/stats"),

    // ---- Creator ----
    getCreatorProfile: () => request("/creator/profile"),
    updateCreatorProfile: (payload) => request("/creator/profile", { method: "PUT", body: payload }),
    createCreatorPost: (payload) => request("/creator/posts", { method: "POST", body: payload }),
    getMyPosts: async () => {
      try {
        return await request("/creator/posts");
      } catch (err) {
        if (err.status === 404) return [];
        throw err;
      }
    },
    updateCreatorPost: (id, payload) => request("/creator/posts/" + id, { method: "PUT", body: payload }),
    deleteCreatorPost: (id) => request("/creator/posts/" + id, { method: "DELETE" }),
    getMyCampaigns: () => request("/creator/campaigns"),
    getCreatorStats: () => request("/creator/stats"),

    // ---- Admin ----
    getAdminStats: () => request("/admin/stats"),
    getAllBriefs: async () => {
      try {
        return await request("/admin/briefs");
      } catch (err) {
        if (err.status === 404) return await request("/admin/campaigns");
        throw err;
      }
    },
    getAllCampaigns: () => request("/admin/briefs"),
    updateBriefStatus: (id, payload) => request("/admin/briefs/" + id, { method: "PUT", body: payload }),
    getAllCreatorPosts: async () => {
      try {
        return await request("/admin/creator-posts");
      } catch (err) {
        if (err.status === 404) return [];
        throw err;
      }
    },
    getAllUsers: (query) => request("/admin/users" + (query || "")),
    getAllBrands: () => request("/admin/brands"),
    getAllCreators: () => request("/admin/creators"),
    updateUserStatus: (id, status) => request("/admin/users/" + id + "/status", { method: "PUT", body: { status } }),
    deleteUser: (id) => request("/admin/users/" + id, { method: "DELETE" }),
    exportData: (type) => BASE + "/admin/export/" + type,
  };
})();
