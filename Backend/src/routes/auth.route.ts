import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
const authController = new AuthController();

// POST /api/auth/register - Register new user
router.post("/register", (req, res) => authController.register(req, res));

// POST /api/auth/login - Login user
router.post("/login", (req, res) => authController.login(req, res));

export default router;
