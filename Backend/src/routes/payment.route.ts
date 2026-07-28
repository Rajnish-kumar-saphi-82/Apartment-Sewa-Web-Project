import { Router, Request, Response } from "express";
import { KhaltiService } from "../services/khalti.service.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";
import { authorizedMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
const khaltiService = new KhaltiService();

router.post("/khalti/initiate", authorizedMiddleware, async (req: Request, res: Response) => {
  try {
    const { billId } = req.body;
    if (!billId) {
      return ApiResponseHelper.error(res, "billId is required", 400);
    }
    const result = await khaltiService.initiatePayment(billId);
    return ApiResponseHelper.success(res, result, "Payment initiated");
  } catch (error: any) {
    return ApiResponseHelper.error(res, error.message, 500);
  }
});

router.post("/khalti/verify", authorizedMiddleware, async (req: Request, res: Response) => {
  try {
    const { pidx } = req.body;
    if (!pidx) {
      return ApiResponseHelper.error(res, "pidx is required", 400);
    }
    const result = await khaltiService.verifyPayment(pidx);
    return ApiResponseHelper.success(res, result, "Payment verified successfully");
  } catch (error: any) {
    return ApiResponseHelper.error(res, error.message, 500);
  }
});

export default router;
