// import { Router } from "express";
// import { DasboardController } from "../controllers/dashboard.controller.js";
// import { authenticate, authorize } from "../middlewares/auth.middleware.js";

// const router = Router();
// const controller = new DasboardController();

// router.get(
//     "/admin",
//     authenticate,
//     authorize("ADMIN"),
//     controller.adminDashboard
// );

// router.get(
//     "/owner",
//     authenticate,
//     authorize("OWNER"),
//     controller.ownerDashboard
// );

// router.get(
//     "/tenant",
//     authenticate,
//     authorize("TENANT"),
//     controller.tenantDashboard
// );

// export default router;