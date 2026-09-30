import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { db } from "./config/db.js";
import { registrationModel } from "./models/registrationModel.js";
import { userModel } from "./models/userModel.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { seedAdmin } from "./controllers/adminController.js";
import { apiRateLimiter } from "./middleware/auth.js";
import { sanitizeMiddleware } from "./middleware/sanitize.js";
import { paymentModel } from "./models/paymentModel.js";
import { userPaymentModel } from "./models/userPaymentModel.js";
import { startPaymentScheduler } from "./services/paymentScheduler.js";
import { settingsModel } from "./models/settingsModel.js";
import { conferenceConfigModel } from "./models/conferenceConfigModel.js";
import { startReviewReminderScheduler } from "./services/reviewReminderScheduler.js";

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import cookieParser from "cookie-parser";

dotenv.config();
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "Loaded" : "Missing");
console.log("JWT_SECRET used in server:", process.env.JWT_SECRET);

const PORT = process.env.PORT || 5800;
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
const BACKEND_URL = (process.env.BACKEND_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || `${BACKEND_URL}/icodses/auth/google/callback`;
const getOrigin = (url) => {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
};
const CORS_ORIGINS = (process.env.CORS_ORIGINS || FRONTEND_URL)
  .split(",")
  .map((origin) => origin.trim())
  .map(getOrigin)
  .filter(Boolean);

// The React app is served below /ICoDSES in both development and production.
// Accept FRONTEND_URL with or without that segment so an OAuth callback never
// creates the broken /ICoDSES/ICoDSES/... URL.
const FRONTEND_APP_URL = /\/ICoDSES$/i.test(FRONTEND_URL)
  ? FRONTEND_URL
  : `${FRONTEND_URL}/ICoDSES`;

// Initialize Models
const initializeModels = async () => {
  try {
    console.log("Initializing database models...");
    await userModel(db);
    await registrationModel(db);
    paymentModel.initializeTable();
    paymentModel.initializeAuditTable(); // Initialize audit logs table
    await userPaymentModel.initializeTable();
    await settingsModel.initializeTable();
    await conferenceConfigModel.initializeTable();
    console.log("All models initialized successfully.");
  } catch (error) {
    console.error("Model initialization failed:", error);
    process.exit(1);
  }
};

initializeModels().then(() => {
  // Start payment scheduler
  startPaymentScheduler();
  // Start reviewer reminder scheduler
  startReviewReminderScheduler();
  // Initialize visitor counter table
  db.query('CREATE TABLE IF NOT EXISTS visitor_counter (id INT AUTO_INCREMENT PRIMARY KEY, count INT DEFAULT 0)', (err) => {
    if (err) {
      console.error('Error creating visitor_counter table:', err);
    } else {
      console.log('✅ Visitor counter table ready');
      // Ensure there's at least one row
      db.query('INSERT IGNORE INTO visitor_counter (id, count) VALUES (1, 0)', (err2) => {
        if (err2) {
          console.error('Error initializing visitor count:', err2);
        }
      });
    }
  });

  const app = express();

  // Security
  app.use(helmet());
  
app.use(cookieParser());

  // CORS
  app.use(
    cors({
      origin: CORS_ORIGINS,
      credentials: true,
    })
  );

  // Parse the body before running validators/sanitizers.  The sanitizer reads
  // request body fields, so placing it first can leave POST handlers without
  // a parsed `req.body`.
  app.use(express.json({ limit: "10mb" }));
  app.use(sanitizeMiddleware);
  app.use("/uploads", express.static("uploads"));

  // Session setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "necadmin",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Set true if HTTPS reverse proxy
        httpOnly: true,
        sameSite: "lax",
      },
    })
  );

  // Passport initialization
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const googleId = profile.id;
            const email = profile.emails[0].value;
            const name = profile.displayName;

            db.query(
              "SELECT * FROM users WHERE googleId = ?",
              [googleId],
              (err, results) => {
                if (err) return done(err);
                if (results.length) return done(null, results[0]);

                db.query(
                  "SELECT * FROM users WHERE email = ?",
                  [email],
                  (err, results) => {
                    if (err) return done(err);
                    if (results.length) {
                      const user = results[0];
                      db.query(
                        "UPDATE users SET googleId = ? WHERE id = ?",
                        [googleId, user.id],
                        (err2) => {
                          if (err2) return done(err2);
                          user.googleId = googleId;
                          return done(null, user);
                        }
                      );
                    } else {
                      db.query(
                        "INSERT INTO users (name, email, googleId, role) VALUES (?, ?, ?, ?)",
                        [name, email, googleId, "user"],
                        (err3, res) => {
                          if (err3) return done(err3);
                          db.query(
                            "SELECT * FROM users WHERE id = ?",
                            [res.insertId],
                            (err4, user) => done(err4, user[0])
                          );
                        }
                      );
                    }
                  }
                );
              }
            );
          } catch (error) {
            done(error);
          }
        }
      )
    );
  }

  // Passport session handling
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
      done(err, results[0]);
    });
  });

  // Seed Admin (don't let it crash the server)
  seedAdmin().catch(err => {
    console.error('Error seeding admin:', err);
  });

  // Apply rate limiter to all APIs under /icodses
  app.use("/icodses", apiRateLimiter);

  // Routes
  app.use("/icodses/auth", authRoutes);
  app.use("/icodses/registration", registrationRoutes);
  app.use("/icodses/admin", adminRoutes);
  app.use("/icodses/visitors", visitorRoutes);
  app.use("/icodses/payment", paymentRoutes);

  // Google OAuth
  app.get(
    "/icodses/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  // Google OAuth Callback
  app.get(
    "/icodses/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login",
      session: true,
    }),
    (req, res) => {
      const JWT_SECRET = process.env.JWT_SECRET || "necadmin";

      const token = jwt.sign(
        {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          track: req.user.track,
          isFirstLogin: false,
          passwordChanged: true,
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Existing accounts keep their role when matched by email, so Google
      // OAuth works for participants, reviewers, chairpersons, and admins.
      // The frontend callback stores the token before it chooses the dashboard.
      const destination = "oauth/callback";
      res.redirect(
        `${FRONTEND_APP_URL}/${destination}?token=${encodeURIComponent(token)}`
      );
    }
  );

  console.log(`Attempting to start server on port ${PORT}`);
  app.listen(PORT, () =>
    console.log(`🚀 Server running on ${PORT}`)
  ).on('error', (err) => {
    console.error('Server failed to start:', err);
  });
});
