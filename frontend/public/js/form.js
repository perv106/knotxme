// form.js — handles contact/inquiry form submission.
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

      msg.textContent = `Thanks, ${name.value.trim().split(" ")[0]} — your message has been received! Our team will reach out at ${email.value.trim()} shortly to assist you.`;
      msg.className = "form-msg show ok";
      form.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", initForm);
})();
