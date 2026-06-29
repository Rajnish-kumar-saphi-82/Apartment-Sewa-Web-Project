import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "uploads/profile";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req: any, file, cb) => {
    const userId = req.user?.userId;
    const ext = path.extname(file.originalname);
    cb(null, `${userId}-${Date.now()}${ext}`);
  },
});

export const uploadProfileImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
