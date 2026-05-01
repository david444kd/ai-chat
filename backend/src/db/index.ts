import { Database } from "bun:sqlite";

let db: Database;

export function getDB(): Database {
  if (!db) {
    try {
      db = new Database(process.env.DB_PATH ?? "chat.db", { create: true });
      db.run("PRAGMA journal_mode = WAL");
      db.run("PRAGMA foreign_keys = ON");
    } catch (err) {
      console.error("Failed to initialize database:", err);
      process.exit(1);
    }
  }
  return db;
}
