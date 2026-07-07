// auth-guard.js — include on every protected page.
// Usage: <script>window.KNOTXME_REQUIRED_ROLE = "brand";</script> before this script.
(function () {
  const required = window.KNOTXME_REQUIRED_ROLE;
  const user = window.KnotxmeAPI ? window.KnotxmeAPI.getUser() : null;
  const token = window.KnotxmeAPI ? window.KnotxmeAPI.getToken() : null;

  if (!token || !user) {
    window.location.href = "login.html";
    return;
  }
  if (required && user.role !== required) {
    // logged in, but wrong dashboard — send them to their own
    const map = {
      brand: "brand-dashboard.html",
      creator: "creator-dashboard.html",
      admin: "admin-dashboard.html",
    };
    window.location.href = map[user.role] || "login.html";
  }
})();

function knotxmeWireLogout(buttonId) {
  const btn = document.getElementById(buttonId || "logoutBtn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    try {
      await window.KnotxmeAPI.logout();
    } catch (e) {
      window.KnotxmeAPI.clearSession();
    }
    window.location.href = "login.html";
  });
}
