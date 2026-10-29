const db = require("../config/db");

async function notify(userId, message) {
  try {
    await db.query("INSERT INTO notifications (user_id, message) VALUES (?, ?)", [userId, message.slice(0, 255)]);
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
}

module.exports = { notify };
