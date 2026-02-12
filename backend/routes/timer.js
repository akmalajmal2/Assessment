const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/start", async (req, res) => {
  const { attemptId, duration } = req.body;
  const safeDuration = Number(duration) || 1800;
  const endTime = new Date(Date.now() + safeDuration * 1000);

  await db.query(
    "INSERT INTO assessment_timer(attempt_id,end_time,status) VALUES($1,$2,$3)",
    [attemptId, endTime, "RUNNING"],
  );

  res.json({ endTime });
});

router.get("/state/:attemptId", async (req, res) => {
  const result = await db.query(
    "SELECT end_time,status FROM assessment_timer WHERE attempt_id=$1",
    [req.params.attemptId],
  );

  if (!result.length) return res.statusCode(404);

  const remaining = new Date(rows[0].end_time).getTime() - Date.now();

  res.json({
    remaining: Math.max(0, Math.floor(remaining / 1000)),
    status: rows[0].status,
  });
});

router.post("/submit", async (req, res) => {
  const { attemptId } = req.body;

  await db.query(
    "UPDATE assessment_timer SET status='SUBMITTED' WHERE attempt_id=$1",
    [attemptId],
  );

  res.sendStatus(200);
});

module.exports = router;
