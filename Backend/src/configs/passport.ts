import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../models/auth.model.js";
import { UserRole } from "../types/auth.type.js";
import dotenv from "dotenv";
dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8090";

//Only register Google strategy if credentials are configured 
if (
  GOOGLE_CLIENT_ID &&
  GOOGLE_CLIENT_SECRET &&
  GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_HERE" &&
  GOOGLE_CLIENT_SECRET !== "YOUR_GOOGLE_CLIENT_SECRET_HERE"
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/api/v1/auth/google/callback`,
        passReqToCallback: true,  // ← allows us to read req inside strategy
      } as any,
      async (req: any, _accessToken: string, _refreshToken: string, profile: any, done: any) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email found in Google profile"), undefined);
          }

          // Find existing user or create a new one
          let user = await UserModel.findOne({ email });

          if (!user) {
            // Read role from the OAuth state (set in auth.route.ts before passport runs)
            // Only allow Tenant or Owner from Google signup; Admin must be assigned manually
            const requestedRole = req._oauthRole;
            const allowedRoles = [UserRole.TENANT, UserRole.OWNER];
            const role = allowedRoles.includes(requestedRole) ? requestedRole : UserRole.TENANT;

            user = await UserModel.create({
              full_name: profile.displayName || email.split("@")[0],
              email,
              password: `google_oauth_${profile.id}`,
              role,  // ← Now uses chosen role (Tenant or Owner)
              country_code: "+977",
              phone: "0000000000",
              profile_image: profile.photos?.[0]?.value || null,
              is_verified: true,
              verification_token: null,
              kyc_status: "not_submitted",
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err as Error, undefined);
        }
      }
    )
  );
  // Google OAuth strategy registered
} else {
  console.warn(
    "⚠️  Google OAuth is NOT configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable it."
  );
}

passport.serializeUser((user: any, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export const isGoogleConfigured =
  !!GOOGLE_CLIENT_ID &&
  !!GOOGLE_CLIENT_SECRET &&
  GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_HERE" &&
  GOOGLE_CLIENT_SECRET !== "YOUR_GOOGLE_CLIENT_SECRET_HERE";

export default passport;
