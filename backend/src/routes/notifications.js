const express = require("express");
const db = require("../config/db");
const { auth } = require("../middleware/auth");

const router = express.Router();
router.use(auth);

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 50",
      [req.user.id]
    );
    res.json(rows.map((n) => ({ ...n, is_read: !!n.is_read })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load notifications" });
  }
});

router.patch("/read-all", async (req, res) => {
  try {
    await db.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [req.user.id]);
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update notifications" });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    await db.query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update notification" });
  }
});

module.exports = router;
