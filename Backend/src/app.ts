// import express from 'express';
// import dotenv from "dotenv"
// import authRoutes from './routes/auth.route.js';
// import { PORT } from './configs/constant.js';

// import dashboardRoutes from "./routes/dashboard.route.js"

// dotenv.config();

// const app = express();


// app.use(express.json());

// app.use("/api/auth",authRoutes);

// app.use("/api/dashboard", dashboardRoutes);

// app.get("/", (req, res) => {
//     res.send("Apartment Sewa API Running");
// });

// app.listen(PORT, ()=> {
//     console.log(`Service running on ${PORT}`);
// });


import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PORT } from "./configs/constant.js";
import authRoutes from "./routes/auth.route.js";
import { connectToMongoDB } from "./database/mongodb.js";


dotenv.config();

const app: Application = express();

/**
 * CORS Configuration
 */
const corsOptions = {
  origin: [
    "http://localhost:8000",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(cors(corsOptions));

/**
 * Middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Routes
 */
app.use("/api/auth", authRoutes);

/**
 * Health Check Endpoint
 */
app.get("/", (req: Request, res: Response) => {
  return res.json({
    message: " Apartment Sewa API is running!",
    version: "1.0.0",
    status: "healthy",
    endpoints: {
      auth: "/api/auth"
    }
  });
});

/**
 * 404 Handler
 */
app.use((req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.path
  });
});

/**
 * Global Error Handler
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message
  });
});

const startServer = async () => {
  try {
    await connectToMongoDB();

    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
  }
};

startServer();

/**
 * Start Server
 */
// app.listen(PORT, () => {
//   console.log(`\n Server running on http://localhost:${PORT}`);
//   console.log(`\n Available Endpoints:`);
//   console.log(`   POST   http://localhost:${PORT}/api/auth/register`);
//   console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
//   console.log(`   GET    http://localhost:${PORT}/api/auth/me\n`);
// });

export default app;