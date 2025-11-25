const pool = require("../db/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10;

async function register(req, res) {
    // Register endpoint is for customers only. Admins must be created by an existing admin.
    const { firstName, lastName, birthDate, username, password } = req.body;
    const role = "customer";
    if (!username || !password) {
        return res
            .status(400)
            .json({ error: "username and password are required" });
    }

    try {
        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        const [result] = await pool.execute(
            "INSERT INTO Users (UserFirstName, UserLastName, UserBirthDate, UserName, UserPassword, UserRole) VALUES (?, ?, ?, ?, ?, ?)",
            [
                firstName || null,
                lastName || null,
                birthDate || null,
                username,
                hashed,
                role,
            ]
        );

        const userId = result.insertId;
        const token = jwt.sign({ userId, username, role }, JWT_SECRET, {
            expiresIn: "8h",
        });

        res.status(201).json({ userId, username, role, token });
    } catch (err) {
        if (err && err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "username already exists" });
        }
        console.error(err);
        res.status(500).json({ error: "internal server error" });
    }
}

// Admin-only: create another admin
async function createAdmin(req, res) {
    // must be called by an authenticated admin
    const requester = req.user;
    if (!requester || requester.role !== "admin")
        return res.status(403).json({ error: "forbidden" });

    const { firstName, lastName, birthDate, username, password } = req.body;
    const role = "admin";
    if (!username || !password)
        return res
            .status(400)
            .json({ error: "username and password required" });

    try {
        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        const [result] = await pool.execute(
            "INSERT INTO Users (UserFirstName, UserLastName, UserBirthDate, UserName, UserPassword, UserRole) VALUES (?, ?, ?, ?, ?, ?)",
            [
                firstName || null,
                lastName || null,
                birthDate || null,
                username,
                hashed,
                role,
            ]
        );
        res.status(201).json({ userId: result.insertId, username, role });
    } catch (err) {
        if (err && err.code === "ER_DUP_ENTRY")
            return res.status(409).json({ error: "username already exists" });
        console.error(err);
        res.status(500).json({ error: "internal server error" });
    }
}

// Admin-only: delete a user (admin or customer)
async function deleteUser(req, res) {
    const requester = req.user;
    if (!requester || requester.role !== "admin")
        return res.status(403).json({ error: "forbidden" });

    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: "invalid user id" });

    try {
        const [result] = await pool.execute(
            "DELETE FROM Users WHERE UserID = ?",
            [id]
        );
        if (result.affectedRows === 0)
            return res.status(404).json({ error: "user not found" });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "internal server error" });
    }
}

async function login(req, res) {
    const { username, password } = req.body;
    if (!username || !password)
        return res
            .status(400)
            .json({ error: "username and password required" });

    try {
        const [rows] = await pool.execute(
            "SELECT * FROM Users WHERE UserName = ?",
            [username]
        );
        const user = rows[0];
        if (!user)
            return res.status(401).json({ error: "invalid credentials" });

        const ok = await bcrypt.compare(password, user.UserPassword);
        if (!ok) return res.status(401).json({ error: "invalid credentials" });

        const token = jwt.sign(
            {
                userId: user.UserID,
                username: user.UserName,
                role: user.UserRole,
            },
            JWT_SECRET,
            { expiresIn: "8h" }
        );
        res.json({
            token,
            userId: user.UserID,
            username: user.UserName,
            role: user.UserRole,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "internal server error" });
    }
}

async function me(req, res) {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "not authenticated" });
    res.json({ user });
}

module.exports = { register, login, me, createAdmin, deleteUser };
