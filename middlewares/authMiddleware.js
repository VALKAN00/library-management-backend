const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ error: "authorization header missing" });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
        return res.status(401).json({ error: "invalid authorization header" });

    const token = parts[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: "invalid or expired token" });
    }
}

function authorize(roles = []) {
    if (typeof roles === "string") roles = [roles];
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ error: "not authenticated" });
        if (roles.length && !roles.includes(req.user.role))
            return res.status(403).json({ error: "forbidden" });
        next();
    };
}

module.exports = { authenticate, authorize };
