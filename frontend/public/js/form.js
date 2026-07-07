// form.js — validates and handles the early access / contact form.
// This is a static prototype: submissions are not yet wired to a backend,
// so we validate client-side and show a clear confirmation state.
(function () {
  function initForm() {
    const form = document.getElementById("accessForm");
    if (!form) return;
    const msg = document.getElementById("formMsg");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = form.querySelector("#f-name");
      const email = form.querySelector("#f-email");
      const role = form.querySelector("#f-role");
      const message = form.querySelector("#f-message");

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());

      if (!name.value.trim() || !emailOk || !role.value || !message.value.trim()) {
        msg.textContent = "Please fill in your name, a valid email, your role, and a short message.";
        msg.className = "form-msg show err";
        return;
      }

      msg.textContent = `Thanks, ${name.value.trim().split(" ")[0]} — that's noted. We're onboarding our first cohort of ${role.value.toLowerCase()}s and will reach out at ${email.value.trim()} soon.`;
      msg.className = "form-msg show ok";
      form.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", initForm);
})();
