const pool = require("../db/connection");
const bcrypt = require("bcrypt");

const DEFAULT_ADMIN_USERNAME = "Muhammed_Mahmoud";
const DEFAULT_ADMIN_PASSWORD = "admin123";
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10;

async function ensureAdmin() {
    try {
        // Check for admin existence by username OR ID = 1
        const [rows] = await pool.execute(
            "SELECT * FROM Users WHERE UserID = 1 OR UserName = ?",
            [DEFAULT_ADMIN_USERNAME]
        );

        if (rows.length > 0) {
            console.log("Default admin already exists.");
            return;
        }

        const hashed = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, SALT_ROUNDS);

        // Always use proper date format YYYY-MM-DD
        const birthDate = "2004-07-19";

        const [result] = await pool.execute(
            `
            INSERT INTO Users 
            (UserID, UserFirstName, UserLastName, UserBirthDate, UserName, UserPassword, UserRole) 
            VALUES 
            (1, ?, ?, ?, ?, ?, ?)
            `,
            [
                "Muhammed",
                "Mahmoud",
                birthDate,
                DEFAULT_ADMIN_USERNAME,
                hashed,
                "admin",
            ]
        );

        console.log("Default admin created with id", result.insertId);
    } catch (err) {
        console.error("Error ensuring default admin:", err.message || err);
    }
}

module.exports = ensureAdmin;
