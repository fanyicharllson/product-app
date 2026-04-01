import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";


const router = Router();

// SIGNUP
router.post("/signup", async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  // Basic validation — all fields must be present
  if (!username || !email || !password) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  try {
    // Check if email already exists — we don't want duplicates
    const [rows]: any = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      res.status(409).json({ error: "Email already registered." });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    await pool.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: "Account created. You can now log in." });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

//  LOGIN 
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  try {
    // Fetch user by email
    const [rows]: any = await pool.execute(
      "SELECT id, username, password FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    // Credentials valid — create a session.
    req.session.userId = user.id;

    res.status(200).json({
      message: "Login successful.",
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// LOGOUT 
router.post("/logout", (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Could not log out." });
      return;
    }
    // Clear the session cookie from the browser too
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out." });
  });
});

export default router;