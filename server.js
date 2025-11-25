require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/auth");

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.json({ status: "ok", message: "Library management backend" });
});

const ensureAdmin = require("./scripts/ensureAdmin");
const PORT = process.env.PORT || 3000;

(async () => {
    await ensureAdmin();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`http://localhost:${PORT}/`);
    });
})();

module.exports = app;
