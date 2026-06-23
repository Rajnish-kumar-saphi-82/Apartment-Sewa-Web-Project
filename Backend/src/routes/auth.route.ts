// import { Router } from "express";
// import { AuthController } from "../controllers/auth.controller.js";
// import { authMiddleware } from "../middlewares/auth.middleware.js";

// const router = Router();
// const authController = new AuthController();

// // POST /api/auth/register - Register new user
// router.post("/register", (req, res) => authController.register(req, res));

// // POST /api/auth/login - Login user
// router.post("/login", (req, res) => authController.login(req, res));

// export default router;


import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploadProfileImage } from "../middlewares/upload.middleware.js";

const router = Router();
const authController = new AuthController();

// POST /api/v1/auth/register - Register new user
router.post("/register", (req, res) => authController.register(req, res));

// POST /api/v1/auth/login - Login user
router.post("/login", (req, res) => authController.login(req, res));

// GET /api/v1/auth/whoami - Detail of logged-in user (protected)
router.get("/whoami", authMiddleware, (req, res) =>
  authController.getCurrentUser(req, res),
);

// PUT /api/v1/auth/update - Update profile detail + optional image upload (protected)
router.put(
  "/update",
  authMiddleware,                          // must run first — sets req.user for filename()
  uploadProfileImage.single("profileImage"), // field name the frontend FormData must use
  (req, res) => authController.updateProfile(req, res),
);
// PUT /api/v1/auth/change-password - Change password (protected)

router.put(
  "/change-password",
  authMiddleware,
  (req, res) => authController.changePassword(req, res),
);

export default router;