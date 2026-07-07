// filters.js — a small illustrative demo of the brand-side matching filters.
// Numbers are indicative only (the platform is in early development) and
// exist purely to show how filtering down to a shortlist will feel.
(function () {
  const POOL_SIZE = 2600;

  const WEIGHTS = {
    niche: {
      Fashion: 0.22, Tech: 0.16, Gaming: 0.14, Fitness: 0.18, Beauty: 0.2, Food: 0.19, Finance: 0.09,
    },
    platform: {
      Instagram: 0.62, YouTube: 0.34, "Blog / Newsletter": 0.16,
    },
    size: {
      "Nano (1K–10K)": 0.4, "Micro (10K–100K)": 0.34, "Mid (100K–500K)": 0.16, "Macro (500K+)": 0.08,
    },
  };

  function computeCount(active) {
    let factor = 1;
    Object.keys(WEIGHTS).forEach((group) => {
      const chosen = active[group];
      if (!chosen || chosen.length === 0) return;
      const sum = chosen.reduce((acc, key) => acc + (WEIGHTS[group][key] || 0.15), 0);
      factor *= Math.min(sum, 1);
    });
    return Math.max(6, Math.round(POOL_SIZE * factor));
  }

  function initFilters() {
    const panel = document.getElementById("filterDemo");
    if (!panel) return;

    const active = { niche: [], platform: [], size: [] };
    const countEl = panel.querySelector("[data-count]");

    panel.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const group = chip.dataset.group;
        const value = chip.dataset.value;
        const list = active[group];
        const idx = list.indexOf(value);

        if (idx > -1) {
          list.splice(idx, 1);
          chip.classList.remove("active");
        } else {
          list.push(value);
          chip.classList.add("active");
        }

        const count = computeCount(active);
        countEl.textContent = count.toLocaleString("en-IN");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", initFilters);
})();
