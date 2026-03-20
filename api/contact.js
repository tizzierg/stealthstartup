const nodemailer = require("nodemailer");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, message, barriers } = req.body || {};

  const trimmedName = typeof name === "string" ? name.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim() : "";
  const trimmedMessage = typeof message === "string" ? message.trim() : "";
  const normalizedBarriers = Array.isArray(barriers)
    ? barriers.filter(Boolean)
    : barriers
      ? [barriers]
      : [];

  if (!trimmedName || !trimmedEmail || !trimmedMessage) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!trimmedEmail.includes("@")) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: `New message from ${trimmedName}`,
      text: `
    Name: ${trimmedName}
    Email: ${trimmedEmail}
    Barriers: ${normalizedBarriers.length ? normalizedBarriers.join(", ") : "none provided"}
    Message: ${trimmedMessage}
      `
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("EMAIL ERROR:", error);
    return res.status(500).json({ message: "Error sending email" });
  }
};
