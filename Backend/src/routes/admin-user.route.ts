import { Router } from "express";
import { AdminUserController } from "../controllers/admin-user.controller.js";
import {
  authorizedMiddleware,
  roleMiddleware,
} from "../middlewares/auth.middleware.js";
import { UserRole } from "../types/auth.type.js";

const router = Router();
const adminUserController = new AdminUserController();

router.use(authorizedMiddleware);

router.get("/", roleMiddleware(UserRole.ADMIN, UserRole.OWNER), (req, res) => adminUserController.getUsers(req, res));
router.get("/:id", roleMiddleware(UserRole.ADMIN), (req, res) => adminUserController.getUserById(req, res));
router.post("/", roleMiddleware(UserRole.ADMIN), (req, res) => adminUserController.createUser(req, res));
router.put("/:id", roleMiddleware(UserRole.ADMIN), (req, res) => adminUserController.updateUser(req, res));
router.patch("/:id", roleMiddleware(UserRole.ADMIN), (req, res) => adminUserController.updateUser(req, res));
router.delete("/:id", roleMiddleware(UserRole.ADMIN), (req, res) => adminUserController.deleteUser(req, res));

export default router;
