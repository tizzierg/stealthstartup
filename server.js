require("dotenv").config();

const express = require("express");
const path = require("path");
const contactHandler = require("./api/contact");

const app = express();
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));

app.get("/", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.post("/api/contact", (req, res) => contactHandler(req, res));

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
