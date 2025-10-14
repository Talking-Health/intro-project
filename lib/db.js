// lib/db.js
const path = require("path")
const fs = require("fs")
const Database = require("better-sqlite3")

// allow overriding DB path in tests via env var
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data.sqlite")

// ensure parent dir exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

const db = new Database(DB_PATH)
db.pragma("foreign_keys = ON")

db.exec(`
CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL,
  email TEXT DEFAULT '',
  notes TEXT DEFAULT ''
);
`)

module.exports = db
