require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");

const rateLimiter = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");

const chatRoute = require("./routes/chat");
const translateRoute = require("./routes/translate");
const ttsRoute = require("./routes/tts");
const historyRoute = require("./routes/history");

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use("/api/", rateLimiter);
app.use(express.static(path.join(__dirname, "public"), {
  maxAge: "1h",
  etag: true,
}));

app.use("/api/chat", chatRoute);
app.use("/api/translate", translateRoute);
app.use("/api/tts", ttsRoute);
app.use("/api/history", historyRoute);

app.get("/api/health", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`VoteWise running on :${PORT}`));

module.exports = app;