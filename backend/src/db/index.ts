import { Database } from "bun:sqlite";

let db: Database;

export function getDB(): Database {
  if (!db) {
    db = new Database(process.env.DB_PATH ?? "chat.db", { create: true });
    db.run("PRAGMA journal_mode = WAL");
    db.run("PRAGMA foreign_keys = ON");
  }
  return db;
}
