import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authorizedMiddleware } from "../middlewares/auth.middleware.js";
import { uploadProfileImage } from "../middlewares/upload.middleware.js";
import passport from "../configs/passport.js";
import { JWTUtil } from "../utils/jwt.util.js";

const router = Router();
const authController = new AuthController();

// POST /api/v1/auth/register - Register new user
router.post("/register", (req, res) => authController.register(req, res));

// POST /api/v1/auth/login - Login user
router.post("/login", (req, res) => authController.login(req, res));

// GET /api/v1/auth - Detail of logged-in user (protected)
router.get("/", authorizedMiddleware, (req, res) =>
  authController.getCurrentUser(req, res),
);

// GET /api/v1/auth/whoami - Detail of logged-in user (protected)
router.get("/whoami", authorizedMiddleware, (req, res) =>
  authController.getCurrentUser(req, res),
);

// GET /api/v1/auth/me - Mobile-compatible current-user alias
router.get("/me", authorizedMiddleware, (req, res) =>
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

// PUT /api/v1/auth/password/update - Mobile-compatible password alias
router.put("/password/update", authorizedMiddleware, (req, res) =>
  authController.changePassword(req, res),
);

// POST /api/v1/auth/upload-image - Mobile-compatible image upload alias
router.post(
  "/upload-image",
  authorizedMiddleware,
  uploadProfileImage.single("profileImage"),
  (req, res) => authController.updateProfile(req, res),
);

// GET /api/v1/auth/verify-email - Verify user email
router.get("/verify-email", (req, res) => authController.verifyEmail(req, res));

// ── Google OAuth Routes ────────────────────────────────────────────────────────
import { isGoogleConfigured } from "../configs/passport.js";

// Step 1: Redirect user to Google's consent screen
// The frontend passes ?role=Tenant or ?role=Owner in the URL
router.get("/google", (req, res) => {
  if (!isGoogleConfigured) {
    return res.redirect("http://localhost:3000/login?error=google_not_configured");
  }
  // Accept role from query param (default to Tenant if not provided)
  const role = (req.query.role as string) || "Tenant";
  // Pass role inside the OAuth state so we can read it in the callback
  const state = Buffer.from(JSON.stringify({ role })).toString("base64");
  return passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state,
  } as any)(req, res, () => {});
});

// Step 2: Google redirects back here with a code
router.get(
  "/google/callback",
  (req, res, next) => {
    if (!isGoogleConfigured) {
      return res.redirect("http://localhost:3000/login?error=google_not_configured");
    }
    // Read role from state before passport strips it
    try {
      const stateRaw = req.query.state as string;
      if (stateRaw) {
        const stateObj = JSON.parse(Buffer.from(stateRaw, "base64").toString());
        (req as any)._oauthRole = stateObj.role || "Tenant";
      }
    } catch {
      (req as any)._oauthRole = "Tenant";
    }
    passport.authenticate("google", {
      session: false,
      failureRedirect: "http://localhost:3000/login?error=google_failed",
    })(req, res, next);
  },
  (req, res) => {
    try {
      const user = req.user as any;
      const token = JWTUtil.generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(
        `${FRONTEND_URL}/auth/google/success?token=${token}&userId=${user._id}&name=${encodeURIComponent(user.full_name)}&email=${encodeURIComponent(user.email)}&role=${user.role}`
      );
    } catch (err) {
      res.redirect("http://localhost:3000/login?error=google_failed");
    }
  }
);

export default router;

