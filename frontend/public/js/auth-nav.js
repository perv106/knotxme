// auth-nav.js — populates the #authArea container added to the existing header.
// Purely additive: does not touch any other part of the existing design.
(function () {
  function render() {
    const area = document.getElementById("authArea");
    if (!area || !window.KnotxmeAPI) return;

    const user = window.KnotxmeAPI.getUser();

    if (!user) {
      area.innerHTML =
        '<a href="login.html">Login</a>' +
        '<a href="signup.html" class="btn btn-gold">Sign Up</a>';
      return;
    }

    const dashboardHref =
      user.role === "brand"
        ? "brand-dashboard.html"
        : user.role === "creator"
        ? "creator-dashboard.html"
        : "admin-dashboard.html";

    area.innerHTML =
      '<a href="' + dashboardHref + '" class="btn btn-outline">Dashboard</a>';
  }

  document.addEventListener("DOMContentLoaded", render);
  document.addEventListener("knotxme:navready", render);
})();
