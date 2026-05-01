import { getDB } from "../db";
import { completion } from "./openrouter";

export async function generateTitle(
  userId: string,
  chatId: string,
  firstMessage: string,
): Promise<void> {
  const db = getDB();

  let title: string;
  try {
    const raw = await completion([
      {
        role: "user",
        content: `Generate a short title (max 5 words) for a conversation that starts with: ${firstMessage}. Reply with the title only, no quotes.`,
      },
    ]);
    title = raw.trim().replace(/^["']|["']$/g, "") || firstMessage.slice(0, 50);
  } catch {
    title = firstMessage.slice(0, 50);
  }

  db.run("UPDATE chats SET title = ?, updated_at = ? WHERE id = ? AND user_id = ?", [
    title,
    Date.now(),
    chatId,
    userId,
  ]);
}
