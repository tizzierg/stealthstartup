const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/contact", async (req, res) => {
  try {
    const { name, email, message, _gotcha } = req.body;
    if (_gotcha) return res.json({ success: true });

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.FROM_EMAIL || !process.env.TO_EMAIL) {
      console.warn("SMTP environment variables missing; returning success in dev mode.");
      return res.json({ success: true, warning: "SMTP not configured" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      replyTo: email,
      subject: `New message from ${name} (AGENTIC)`,
      text: message
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Email failed:", err);
    const message = err && err.message ? err.message : "Email failed";
    res.status(500).json({ success: false, error: `Email failed: ${message}` });
  }
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contact.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Openclaw server running → http://localhost:${PORT}`);
});

module.exports = app;
