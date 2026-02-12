const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/batch", async (req, res) => {
  const { logs } = req.body;
  for (const e of logs) {
    await db.query(
      `INSERT INTO assessment_logs
       (attempt_id,event_type,question_id,metadata,timestamp)
       VALUES ($1,$2,$3,$4,$5)`,
      [e.attemptId, e.eventType, e.questionId || null, e.metadata, e.timestamp],
    );
  }
  res.sendStatus(200);
});

module.exports = router;
