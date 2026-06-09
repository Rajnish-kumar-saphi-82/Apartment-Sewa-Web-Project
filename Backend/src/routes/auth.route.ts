// import { Router } from "express";
// import { AuthController } from "../controllers/auth.controller.js";

// const router = Router();
// const controller = new AuthController();

// router.post("/register", controller.register);
// router.post("/login", controller.login);

// export default router;



import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
const authController = new AuthController();

/**
 * Authentication Routes
 * Base path: /api/auth
 * Similar to teacher's userRouter
 */

// POST /api/auth/register - Register new user
router.post("/register", (req, res) => 
  authController.register(req, res)
);

// POST /api/auth/login - Login user
router.post("/login", (req, res) => 
  authController.login(req, res)
);

// GET /api/auth/me - Get current user profile (protected)
router.get("/me", authMiddleware, (req, res) => 
  authController.getCurrentUser(req, res)
);

export default router;