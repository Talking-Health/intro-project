const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const ENV = process.env.NODE_ENV || "development";

require("dotenv").config({
  path: path.resolve(__dirname, `../.env.${ENV}`),
});

const dbPath = process.env.DATABASE_PATH;

if (!dbPath) {
  throw new Error("DATABASE_PATH not set in .env file");
}

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to database:", err.message);
    process.exit(1);
  } else {
    console.log(`Connected to database at ${dbPath}`);
  }
});

module.exports = db;
