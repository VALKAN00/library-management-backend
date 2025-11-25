const express = require("express");
const router = express.Router();
const {
    register,
    login,
    me,
    createAdmin,
    deleteUser,
} = require("../controllers/authController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

// Public: customers can register
router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);

// Admin-only: create other admins
router.post("/admins", authenticate, authorize("admin"), createAdmin);
// Admin-only: delete any user by id
router.delete("/users/:id", authenticate, authorize("admin"), deleteUser);

module.exports = router;
