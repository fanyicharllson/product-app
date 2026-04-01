import express, { Application } from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

// Parse incoming JSON bodies — so req.body works for POST requests with JSON
app.use(express.json());

// Parse URL-encoded bodies — so HTML form submissions work (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Session middleware — manages login state across requests.
// Each user gets a cookie (connect.sid) with a unique session ID.
// The actual session data (userId) lives on the SERVER, not in the cookie.
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret", // Signs the cookie to prevent tampering
    resave: false, // Don't save session if nothing changed
    saveUninitialized: false, // Don't create a session until something is stored (e.g. login)
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true, // JS in the browser can't read this cookie — prevents XSS
      maxAge: 1000 * 60 * 60 * 24, // Session lasts 24 hours (in milliseconds)
    },
  }),
);

app.use(express.static(path.join(__dirname, "../../public")));

// ─── ROUTES

// Mount auth routes at /auth — becomes /auth/signup, /auth/login, /auth/logout
app.use("/auth", authRoutes);
// Mount product routes at /products — becomes /products/search, /products
app.use("/products", productRoutes);

// Visiting / redirects to login page
app.get("/", (_req, res) => {
  res.redirect("/login.html");
});

export default app;
