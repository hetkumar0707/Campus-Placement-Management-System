require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./src/config/db");
const { migrate } = require("./src/utils/migrate");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Copy .env.example to .env and set a value.");
  process.exit(1);
}

const app = express();

app.use(cors({ origin: (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",") }));
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", database: err.message });
  }
});

app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/students", require("./src/routes/students"));
app.use("/api/recruiters", require("./src/routes/recruiters"));
app.use("/api/jobs", require("./src/routes/jobs"));
app.use("/api/applications", require("./src/routes/applications"));
app.use("/api/notifications", require("./src/routes/notifications"));
app.use("/api/admin", require("./src/routes/admin"));
app.use("/api/recommendations", require("./src/routes/recommendations"));

app.use("/api", (req, res) => res.status(404).json({ message: "Route not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;

db.query("SELECT 1")
  .then(() => migrate(db)) // adds the AI-matching columns to an older database automatically
  .then((added) => {
    if (added.length) console.log("Database upgraded: added " + added.join(", "));
    console.log("Local job recommendations and resume analysis are ready.");
    app.listen(PORT, () => console.log(`CPMS API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Could not connect to MySQL:", err.message);
    console.error("Check DB_* values in backend/.env and run: npm run db:init");
    process.exit(1);
  });
