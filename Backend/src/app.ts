import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { PORT } from "./configs/constant.js";
import authRoutes from "./routes/auth.route.js";
import { connectToMongoDB } from "./database/mongodb.js";
import { ApiResponseHelper } from "./utils/apihelper.util.js";

dotenv.config();

const app: Application = express();

const corsOptions = {
  origin: [
    "http://localhost:8000",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions)); // removed the duplicate second call that was here

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploaded profile images statically, e.g. GET /uploads/profile-images/<file>
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/v1/auth", authRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
  return res.json({
    message: "Apartment Sewa API is running!",
    version: "1.0.0",
    status: "healthy",
    endpoints: {
      auth: "/api/v1/auth",
    },
  });
});

app.use((req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.path,
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  const status = err?.status || 400;
  return ApiResponseHelper.error(
    res,
    err.message || "Internal Server Error",
    status,
  );
});

const startServer = async () => {
  try {
    await connectToMongoDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
  }
};

startServer();

export default app;
