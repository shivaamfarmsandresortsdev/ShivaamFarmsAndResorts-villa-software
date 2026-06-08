import express from "express";
import { loginUser, logoutUser, getMe } from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// POST /api/auth/login  — public
router.post("/login", loginUser);

// POST /api/auth/logout — requires valid session
router.post("/logout", authenticate, logoutUser);

// GET /api/auth/me — returns current user from JWT
router.get("/me", authenticate, getMe);

export default router;
