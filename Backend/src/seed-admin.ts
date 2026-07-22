import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/apartment-rental";

//  Admin Credentials (change these before production!) 
const ADMIN_NAME    = "Super Admin";
const ADMIN_EMAIL   = "admin@apartmentsewa.com";
const ADMIN_PASSWORD = "Admin@12345";
const ADMIN_PHONE   = "9800000000";
const ADMIN_COUNTRY_CODE = "+977";


const UserSchema = new mongoose.Schema(
  {
    full_name:          { type: String,  required: true },
    email:              { type: String,  required: true, unique: true },
    password:           { type: String,  required: true },
    role:               { type: String,  required: true },
    country_code:       { type: String,  required: true },
    phone:              { type: String,  required: true },
    profile_image:      { type: String,  default: null },
    verification_token: { type: String,  default: null },
    is_verified:        { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const UserModel = mongoose.model("User", UserSchema);

async function seedAdmin() {
  await mongoose.connect(MONGODB_URL);
  console.log("[Seed] MongoDB connected");

  const existing = await UserModel.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`[Seed] Admin already exists:`);
    console.log(`   Email   : ${existing.email}`);
    console.log(`   Role    : ${existing.role}`);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await (UserModel as any).create({
    full_name:    ADMIN_NAME,
    email:        ADMIN_EMAIL,
    password:     hashedPassword,
    role:         "Admin",
    country_code: ADMIN_COUNTRY_CODE,
    phone:        ADMIN_PHONE,
    is_verified:  true,            // Admin is pre-verified
    verification_token: null,
  }) as any;

  console.log("[Seed] Admin user created successfully!\n");
  console.log("──────────────────────────────────");
  console.log(`  Name     : ${admin.full_name}`);
  console.log(`  Email    : ${ADMIN_EMAIL}`);
  console.log(`  Password : ${ADMIN_PASSWORD}`);
  console.log(`  Role     : Admin`);
  console.log(`  Verified : true`);
  console.log("──────────────────────────────────\n");

  await mongoose.disconnect();
  console.log("[Seed] Done. You can now login with the credentials above.");
}

seedAdmin().catch((err) => {
  console.error("[Seed] Seed failed:", err);
  process.exit(1);
});
