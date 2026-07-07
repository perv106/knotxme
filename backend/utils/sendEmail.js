const nodemailer = require("nodemailer");

async function sendEmail({ to, subject, html }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    // No SMTP configured — log to console so local development still works.
    console.log("\n📧  (SMTP not configured — logging email instead)");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Body:", html);
    console.log("");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject,
    html,
  });
}

module.exports = sendEmail;
