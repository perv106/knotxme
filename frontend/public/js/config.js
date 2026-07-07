// config.js — single place to point the frontend at your backend API.
// Local development: leave as-is (assumes backend on port 5000).
// Production (Netlify): replace API_BASE_URL with your deployed backend URL,
// e.g. "https://knotxme-api.onrender.com/api"
window.KNOTXME_CONFIG = {
  API_BASE_URL: (function () {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5000/api";
    }
    // ⚠️ UPDATE THIS after you deploy your backend (see DEPLOYMENT.md)
    return "https://knotxme-backend.onrender.com//api";
  })(),
};
