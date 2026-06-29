import { Router } from "express";
import { AdminUserController } from "../controllers/admin-user.controller.js";
import {
  authorizedMiddleware,
  roleMiddleware,
} from "../middlewares/auth.middleware.js";
import { UserRole } from "../types/auth.type.js";

const router = Router();
const adminUserController = new AdminUserController();

router.use(authorizedMiddleware, roleMiddleware(UserRole.ADMIN));

router.get("/", (req, res) => adminUserController.getUsers(req, res));
router.get("/:id", (req, res) => adminUserController.getUserById(req, res));
router.post("/", (req, res) => adminUserController.createUser(req, res));
router.put("/:id", (req, res) => adminUserController.updateUser(req, res));
router.patch("/:id", (req, res) => adminUserController.updateUser(req, res));
router.delete("/:id", (req, res) => adminUserController.deleteUser(req, res));

export default router;
