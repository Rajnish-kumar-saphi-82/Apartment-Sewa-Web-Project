import { Router, Request, Response } from "express";
import { ChatService } from "../services/chat.service.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";
import { authorizedMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
const chatService = new ChatService();

router.post("/", authorizedMiddleware, async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return ApiResponseHelper.error(res, "message is required", 400);
    }

    const user = (req as any).user;
    const userRole = user?.role || "Tenant";
    const userPhone = user?.phone || "";
    const userName = user?.full_name || "Guest";

    const result = await chatService.getResponse(
      message,
      history || [],
      userRole,
      userPhone,
      userName
    );

    return ApiResponseHelper.success(res, result, "Chat response generated");
  } catch (error: any) {
    return ApiResponseHelper.error(res, error.message, 500);
  }
});

export default router;
