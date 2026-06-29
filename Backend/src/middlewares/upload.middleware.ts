import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads", "profile-images");

// ensure the folder exists before multer tries to write into it
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
