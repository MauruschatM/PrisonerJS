#!/usr/bin/env node

/**
 * Database migration script for Better Auth
 * This creates the necessary tables for Better Auth to function
 */

const Database = require("better-sqlite3");
const path = require("path");

console.log("🔄 Running Better Auth database migration...\n");

// Open database connection
const dbPath = path.join(process.cwd(), "auth.db");
console.log(`📂 Database path: ${dbPath}`);

const db = new Database(dbPath);

try {
  // Enable WAL mode for better concurrency
  db.pragma("journal_mode = WAL");

  console.log("📋 Creating tables...\n");

  // Create user table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      emailVerified BOOLEAN DEFAULT FALSE,
      name TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      image TEXT
    );
  `);
  console.log("✅ User table created");

  // Create session table
  db.exec(`
    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      expiresAt DATETIME NOT NULL,
      ipAddress TEXT,
      userAgent TEXT,
      userId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES user (id) ON DELETE CASCADE
    );
  `);
  console.log("✅ Session table created");

  // Create account table
  db.exec(`
    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      accountId TEXT NOT NULL,
      providerId TEXT NOT NULL,
      userId TEXT NOT NULL,
      accessToken TEXT,
      refreshToken TEXT,
      idToken TEXT,
      expiresAt DATETIME,
      password TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES user (id) ON DELETE CASCADE
    );
  `);
  console.log("✅ Account table created");

  // Create verification table
  db.exec(`
    CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expiresAt DATETIME NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Verification table created");

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_user_email ON user(email);
    CREATE INDEX IF NOT EXISTS idx_session_userId ON session(userId);
    CREATE INDEX IF NOT EXISTS idx_account_userId ON account(userId);
    CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification(identifier);
  `);
  console.log("✅ Indexes created");

  console.log("\n🎉 Database migration completed successfully!");

  // Display table info
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all();
  console.log("\n📊 Created tables:");
  tables.forEach((table) => {
    console.log(`   - ${table.name}`);
  });
} catch (error) {
  console.error("❌ Migration failed:", error.message);
  process.exit(1);
} finally {
  db.close();
}
