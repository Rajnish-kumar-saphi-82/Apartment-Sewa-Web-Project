import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authorizedMiddleware } from "../middlewares/auth.middleware.js";
import { uploadProfileImage } from "../middlewares/upload.middleware.js";

const router = Router();
const authController = new AuthController();

// POST /api/v1/auth/register - Register new user
router.post("/register", (req, res) => authController.register(req, res));

// POST /api/v1/auth/login - Login user
router.post("/login", (req, res) => authController.login(req, res));

// GET /api/v1/auth/whoami - Detail of logged-in user (protected)
router.get("/whoami", authorizedMiddleware, (req, res) =>
  authController.getCurrentUser(req, res),
);

// PUT /api/v1/auth/update - Update profile detail + optional image upload (protected)
router.put(
  "/update",
  authorizedMiddleware,
  uploadProfileImage.single("profileImage"),
  (req, res) => authController.updateProfile(req, res),
);
// PUT /api/v1/auth/change-password - Change password (protected)

router.put("/change-password", authorizedMiddleware, (req, res) =>
  authController.changePassword(req, res),
);

export default router;
