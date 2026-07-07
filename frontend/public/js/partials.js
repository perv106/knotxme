// partials.js — injects the same header/footer used on the main site
// into the new auth & dashboard pages, so the branding stays identical
// without duplicating markup in every file.
(function () {
  const HEADER = `
  <header class="site-header" id="siteHeader">
    <div class="header-inner">
      <a href="index.html" class="logo"><svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 10c4-6 12-6 16 0s-2 12-6 12-8-4-8-8 4-6 8-4 4 8-2 10-10-2-8-10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>KNOT<b>X</b>ME</a>
      <nav class="nav-links" id="navLinks">
        <a href="index.html#home">Home</a>
        <a href="index.html#about">About</a>
        <a href="index.html#platform">Platform</a>
        <a href="index.html#results">Results</a>
        <a href="index.html#contact">Connect</a>
      </nav>
      <div class="nav-cta">
        <div id="authArea" class="auth-area"></div>
        <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>`;

  const FOOTER = `
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <div class="footer-logo"><svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 10c4-6 12-6 16 0s-2 12-6 12-8-4-8-8 4-6 8-4 4 8-2 10-10-2-8-10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Knotxme</div>
          <p class="footer-tag">The tie between brands who need creators and creators who need brands. Built in India, currently in early development.</p>
        </div>
        <div>
          <h5>Company</h5>
          <a href="index.html#about">About</a>
          <a href="index.html#results">Results</a>
          <a href="index.html#contact">Connect</a>
        </div>
        <div>
          <h5>Product</h5>
          <a href="index.html#brands">For Brands</a>
          <a href="index.html#creators">For Creators</a>
          <a href="index.html#platform">Platform</a>
        </div>
        <div>
          <h5>Reach us</h5>
          <a href="mailto:hello@Knotxme.in">hello@Knotxme.in</a>
          <a href="index.html#contact">Early access form</a>
          <a href="index.html#contact">Instagram &amp; LinkedIn</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2026 Knotxme.IN — building the knot, one tie at a time.</span>
        <span>Thought by Kishu &middot; Made by Perv</span>
      </div>
    </div>
  </footer>`;

  document.addEventListener("DOMContentLoaded", function () {
    const hMount = document.getElementById("site-header-mount");
    const fMount = document.getElementById("site-footer-mount");
    if (hMount) hMount.outerHTML = HEADER;
    if (fMount) fMount.outerHTML = FOOTER;

    // re-run nav toggle + scroll-shrink behavior now that header exists
    const toggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");
    if (toggle && navLinks) {
      toggle.addEventListener("click", () => {
        const open = navLinks.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
    const header = document.getElementById("siteHeader");
    if (header) {
      const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 12);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    if (window.KnotxmeAPI && document.getElementById("authArea")) {
      // trigger auth-nav rendering logic manually since DOMContentLoaded already fired once
      const evt = new Event("knotxme:navready");
      document.dispatchEvent(evt);
    }
  });
})();
