import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/auth.middleware.js";
import { uploadDashboardImage, uploadProfileImage } from "../middlewares/upload.middleware.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";

const router = Router();

router.use(authorizedMiddleware);

router.post(
  "/",
  uploadDashboardImage.fields([{ name: "image", maxCount: 1 }, { name: "file", maxCount: 1 }]),
  (req, res) => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const file = files?.image?.[0] || files?.file?.[0];

    if (!file) return ApiResponseHelper.error(res, "Image is required", 400);

    const url = `${req.protocol}://${req.get("host")}/uploads/dashboard/${file.filename}`;
    return ApiResponseHelper.success(res, { url, image: url }, "Image uploaded successfully", 201);
  },
);

router.post(
  "/apartment-photos",
  uploadDashboardImage.fields([{ name: "photos", maxCount: 10 }, { name: "image", maxCount: 1 }]),
  (req, res) => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const uploadedFiles = [...(files?.photos || []), ...(files?.image || [])];

    if (uploadedFiles.length === 0) return ApiResponseHelper.error(res, "At least one image is required", 400);

    const urls = uploadedFiles.map((file) => `${req.protocol}://${req.get("host")}/uploads/dashboard/${file.filename}`);
    return ApiResponseHelper.success(res, { urls, photos: urls }, "Apartment photos uploaded successfully", 201);
  },
);

router.post(
  "/profile-photo",
  uploadProfileImage.fields([{ name: "profileImage", maxCount: 1 }, { name: "image", maxCount: 1 }]),
  (req, res) => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const file = files?.profileImage?.[0] || files?.image?.[0];

    if (!file) return ApiResponseHelper.error(res, "Profile image is required", 400);

    const url = `${req.protocol}://${req.get("host")}/uploads/profile-images/${file.filename}`;
    return ApiResponseHelper.success(res, { url, profileImage: url }, "Profile photo uploaded successfully", 201);
  },
);

export default router;
