import { Router } from "express";
import { KycController, EmergencyController } from "../controllers/kyc-emergency.controller.js";
import { authorizedMiddleware, roleMiddleware } from "../middlewares/auth.middleware.js";
import { uploadDashboardImage } from "../middlewares/upload.middleware.js";
import { UserRole } from "../types/auth.type.js";

const router = Router();
const kycController = new KycController();
const emergencyController = new EmergencyController();

// KYC Routes
// All KYC routes require login
router.get("/kyc/mine", authorizedMiddleware, (req, res) => kycController.getMyKyc(req, res));
router.post("/kyc", authorizedMiddleware, uploadDashboardImage.fields([
  { name: "documentFront", maxCount: 1 },
  { name: "documentBack", maxCount: 1 },
  { name: "selfie", maxCount: 1 },
  { name: "ownershipCert", maxCount: 1 },
]), (req, res) => kycController.submitKyc(req, res));
router.get("/kyc", authorizedMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req, res) => kycController.getAllKyc(req, res));
router.patch("/kyc/:id/review", authorizedMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req, res) => kycController.reviewKyc(req, res));
router.delete("/kyc/:id", authorizedMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req, res) => kycController.deleteKyc(req, res));

// Emergency Directory Routes 
// Public read (still requires login for security)
router.get("/emergency", authorizedMiddleware, (req, res) => emergencyController.getContacts(req, res));

// Admin-only management
router.get("/emergency/all", authorizedMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req, res) => emergencyController.getAllContacts(req, res));
router.post("/emergency", authorizedMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req, res) => emergencyController.createContact(req, res));
router.patch("/emergency/:id", authorizedMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req, res) => emergencyController.updateContact(req, res));
router.delete("/emergency/:id", authorizedMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req, res) => emergencyController.deleteContact(req, res));

export default router;
