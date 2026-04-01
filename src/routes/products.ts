import { Router, Request, Response } from "express";
import pool from "../db.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

// ─── SEARCH PRODUCTS ──────────────────────────────────────────────────────────
// GET /products/search?q=phone
// Protected — only logged-in users can search.
// requireAuth runs first; if it passes, the handler below runs.
router.get("/search", requireAuth, async (req: Request, res: Response): Promise<void> => {
  // Query params come from the URL: /products/search?q=phone → req.query.q = "phone"
  const query = (req.query.q as string)?.trim();

  if (!query) {
    res.status(400).json({ error: "Search query cannot be empty." });
    return;
  }

  try {
    // LIKE with % wildcards = partial match search.
    // '%phone%' matches "smartphone", "phone case", "old phone", etc.
    // We use ? placeholders — NEVER string-concatenate user input into SQL (SQL injection).
    const searchTerm = `%${query}%`;

    const [rows]: any = await pool.execute(
      `SELECT id, name, description
       FROM products
       WHERE name LIKE ? OR description LIKE ?
       ORDER BY name ASC`,
      [searchTerm, searchTerm]
    );

    res.status(200).json({ results: rows });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed. Please try again." });
  }
});

// ─── GET ALL PRODUCTS (useful for testing) ────────────────────────────────────
// GET /products
router.get("/", requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.execute(
      "SELECT id, name, description FROM products ORDER BY name ASC"
    );
    res.status(200).json({ results: rows });
  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({ error: "Could not fetch products." });
  }
});

export default router;