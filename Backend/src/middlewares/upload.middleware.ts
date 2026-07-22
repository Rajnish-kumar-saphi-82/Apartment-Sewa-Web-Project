import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads", "profile-images");
const dashboardUploadDir = path.join(process.cwd(), "uploads", "dashboard");


if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(dashboardUploadDir)) {
  fs.mkdirSync(dashboardUploadDir, { recursive: true });
}

const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // authMiddleware must run BEFORE this middleware so req.user exists here
    const userId = (req as any).user?.userId || "unknown";
    const ext = path.extname(file.originalname);
    const uniqueName = `${userId}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (!ACCEPTED_MIME_TYPES.includes(file.mimetype)) {
    cb(new Error("Only .jpg, .jpeg, .png and .webp formats are supported"));
    return;
  }
  cb(null, true);
};

export const uploadProfileImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

<<<<<<< Updated upstream
=======
const dashboardUploadDir = path.join(process.cwd(), "uploads", "dashboard");
if (!fs.existsSync(dashboardUploadDir)) {
  fs.mkdirSync(dashboardUploadDir, { recursive: true });
}
>>>>>>> Stashed changes
const dashboardStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dashboardUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
<<<<<<< Updated upstream
    const uniqueName = `dashboard-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
=======
    const uniqueName = `dashboard-${Date.now()}${ext}`;
>>>>>>> Stashed changes
    cb(null, uniqueName);
  },
});

export const uploadDashboardImage = multer({
  storage: dashboardStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
