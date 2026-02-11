const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/batch", async (req, res) => {
  const { logs } = req.body;
  for (const e of logs) {
    await db.execute(
      `INSERT INTO assessment_logs
       (attempt_id,event_type,question_id,metadata,timestamp)
       VALUES (?,?,?,?,?)`,
      [
        e.attemptId,
        e.eventType,
        e.questionId || null,
        JSON.stringify(e.metadata),
        e.timestamp,
      ],
    );
  }
  res.sendStatus(200);
});

module.exports = router;
