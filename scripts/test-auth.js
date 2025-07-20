#!/usr/bin/env node

/**
 * Simple test script to verify Better Auth configuration
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Testing Better Auth Configuration...\n");

// Check if .env.local exists
const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local file not found!");
  console.log("📝 Please create .env.local with the following content:");
  console.log(`
# Better Auth Configuration
BETTER_AUTH_SECRET=your-super-secret-key-change-this-in-production-must-be-at-least-32-characters
BETTER_AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
  `);
  process.exit(1);
}

console.log("✅ .env.local found");

// Check if auth.ts exists
const authConfigPath = path.join(process.cwd(), "config", "auth.ts");
if (!fs.existsSync(authConfigPath)) {
  console.error("❌ config/auth.ts not found!");
  process.exit(1);
}

console.log("✅ config/auth.ts found");

// Check if API route exists
const apiRoutePath = path.join(
  process.cwd(),
  "app",
  "api",
  "auth",
  "[...all]",
  "route.ts"
);
if (!fs.existsSync(apiRoutePath)) {
  console.error("❌ API route app/api/auth/[...all]/route.ts not found!");
  process.exit(1);
}

console.log("✅ API route found");

// Check if auth client exists
const authClientPath = path.join(process.cwd(), "lib", "auth-client.ts");
if (!fs.existsSync(authClientPath)) {
  console.error("❌ lib/auth-client.ts not found!");
  process.exit(1);
}

console.log("✅ Auth client found");

// Check if better-sqlite3 is installed
try {
  require.resolve("better-sqlite3");
  console.log("✅ better-sqlite3 installed");
} catch (e) {
  console.error(
    "❌ better-sqlite3 not installed! Run: npm install better-sqlite3"
  );
  process.exit(1);
}

// Check if better-auth is installed
try {
  require.resolve("better-auth");
  console.log("✅ better-auth installed");
} catch (e) {
  console.error("❌ better-auth not installed! Run: npm install better-auth");
  process.exit(1);
}

console.log("\n🎉 All checks passed! Your Better Auth setup looks good.");
console.log("\n📋 Next steps:");
console.log("1. Run: npm run dev");
console.log("2. Open: http://localhost:3000");
console.log('3. Click "Anmelden" to test registration/login');
console.log("4. For production deployment, see DEPLOYMENT.md");
