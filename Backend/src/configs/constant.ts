// import dotenv from "dotenv";

// dotenv.config();

// export const PORT: number = Number(process.env.PORT) || 8089;
// export const JWT_SECRET: string = process.env.JWT_SECRET || "defaultsecret";


import dotenv from "dotenv";

dotenv.config();

// Server Configuration
export const PORT: number = Number(process.env.PORT) || 8089;

// JWT Configuration
export const JWT_SECRET: string = process.env.JWT_SECRET || "defaultsecret";
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";

// // Log configuration (development only)
// if (process.env.NODE_ENV === "development") {
//   console.log("\n Configuration Loaded:");
//   console.log(`   Port: ${PORT}`);
//   console.log(`   JWT Expires In: ${JWT_EXPIRES_IN}\n`);
// }

export const MONGODB_URL: string =
  process.env.MONGODB_URL ||
  "mongodb://localhost:27017/apartment-sewa";