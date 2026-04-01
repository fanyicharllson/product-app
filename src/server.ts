import app from "./app";
import pool from "./db";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

// ─── DATABASE INIT
// Runs when the server starts — creates tables if they don't already exist.
const initDatabase = async (): Promise<void> => {
  const conn = await pool.getConnection();
  try {
    // Users table — stores registered accounts
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        username    VARCHAR(100) NOT NULL,
        email       VARCHAR(150) NOT NULL UNIQUE,
        password    VARCHAR(255) NOT NULL,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table — what users will search
    // A product has: unique id, name, description
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(200) NOT NULL,
        description TEXT,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed some sample products if the table is empty
    const [rows]: any = await conn.execute(
      "SELECT COUNT(*) AS count FROM products",
    );
    if (rows[0].count === 0) {
      await conn.execute(`
        INSERT INTO products (name, description) VALUES
        ('MacBook Pro 16"', 'Apple laptop with M3 Pro chip, 18GB RAM, 512GB SSD'),
        ('Samsung Galaxy S25', 'Android smartphone with 200MP camera and Snapdragon 8 Elite'),
        ('Sony WH-1000XM6', 'Industry-leading noise cancelling wireless headphones'),
        ('Dell UltraSharp 27" Monitor', '4K IPS display with USB-C 90W charging'),
        ('Logitech MX Master 3S', 'Advanced wireless mouse with 8K DPI sensor'),
        ('iPad Pro 13"', 'Apple tablet with M4 chip and Ultra Retina XDR display'),
        ('Mechanical Keyboard Keychron K8', 'Tenkeyless wireless mechanical keyboard'),
        ('Anker 65W USB-C Charger', 'Compact GaN charger with 3 ports'),
        ('Elgato Stream Deck MK.2', '15 LCD key customizable controller for creators'),
        ('WD 2TB External SSD', 'Portable NVMe SSD with 2000MB/s read speed')
      `);
      console.log("Sample products seeded.");
    }

    console.log("Database tables ready.");
  } finally {
    // Always release the connection back to the pool
    conn.release();
  }
};

// ─── START SERVER
// We wait for the DB to be ready before starting to accept requests.
const startServer = async (): Promise<void> => {
  let retries = 10;

  while (retries > 0) {
    try {
      await initDatabase();
      break; // DB is ready — exit the retry loop
    } catch (err) {
      retries--;
      console.log(`⏳ Waiting for database... (${retries} retries left)`);
      // Wait 3 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 3000));
      if (retries === 0) {
        console.error("❌ Could not connect to database. Exiting.");
        process.exit(1);
      }
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
};

startServer();
