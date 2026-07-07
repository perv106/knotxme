// api.js — tiny fetch wrapper shared by login/signup/dashboard pages.
// Depends on config.js being loaded first.
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
    createRequirement: (payload) => request("/brand/requirements", { method: "POST", body: payload }),
    getMyRequirements: () => request("/brand/requirements"),
    getBrandStats: () => request("/brand/stats"),

    // ---- Creator ----
    getCreatorProfile: () => request("/creator/profile"),
    updateCreatorProfile: (payload) => request("/creator/profile", { method: "PUT", body: payload }),
    getOpportunities: (query) => request("/creator/opportunities" + (query || "")),
    acceptCampaign: (id) => request("/creator/opportunities/" + id + "/accept", { method: "POST" }),
    getMyCampaigns: () => request("/creator/campaigns"),
    getCreatorStats: () => request("/creator/stats"),

    // ---- Admin ----
    getAdminStats: () => request("/admin/stats"),
    getAllUsers: (query) => request("/admin/users" + (query || "")),
    getAllBrands: () => request("/admin/brands"),
    getAllCreators: () => request("/admin/creators"),
    getAllCampaigns: () => request("/admin/campaigns"),
    updateUserStatus: (id, status) => request("/admin/users/" + id + "/status", { method: "PUT", body: { status } }),
    deleteUser: (id) => request("/admin/users/" + id, { method: "DELETE" }),
    exportData: (type) => BASE + "/admin/export/" + type, // returns a URL to hit directly (file download)
  };
})();
