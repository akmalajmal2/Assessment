const express = require("express");
const router = express.Router();
const db = require("../db");
const { v4: uuidv4 } = require("uuid");
const logEvent = require("../utils/logger");
const CONFIG = require("../config/assessmentConfig");

const TEST_DURATION = CONFIG.TEST_DURATION;
const WARNING_AT = CONFIG.WARNING_AT;

// START / RESUME
router.post("/start", async (req, res) => {
  try {
    let { attemptId } = req.body;

    if (!attemptId) attemptId = "ATT_" + uuidv4();

    const existing = await db.query(
      "SELECT status,end_time FROM assessment_timer WHERE attempt_id=$1",
      [attemptId],
    );

    if (existing.rows.length && existing.rows[0].status === "SUBMITTED") {
      return res.status(403).json({ message: "Assessment completed" });
    }

    if (existing.rows.length) {
      return res.json({
        attemptId,
        endTime: existing.rows[0].end_time,
        warningAt: WARNING_AT,
      });
    }

    const endTime = new Date(Date.now() + TEST_DURATION * 1000);

    await db.query(
      "INSERT INTO assessment_timer(attempt_id,end_time,status) VALUES($1,$2,'RUNNING')",
      [attemptId, endTime],
    );

    await logEvent({
      attemptId,
      action: "STARTED",
      message: "Assessment started",
    });

    res.json({ attemptId, endTime, warningAt: WARNING_AT });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server" });
  }
});

// WARNING LOG
router.post("/warning", async (req, res) => {
  const { attemptId } = req.body;

  await logEvent({
    attemptId,
    action: "WARNING",
    message: "5 minute warning",
  });

  res.sendStatus(200);
});

// QUESTION ATTEMPT
router.post("/question", async (req, res) => {
  const { attemptId, questionId } = req.body;

  await logEvent({
    attemptId,
    questionId,
    action: "QUESTION_ATTEMPT",
    message: `Question ${questionId} attempted`,
  });

  res.sendStatus(200);
});

// SUBMIT
router.post("/submit", async (req, res) => {
  const { attemptId } = req.body;

  await db.query(
    "UPDATE assessment_timer SET status='SUBMITTED' WHERE attempt_id=$1",
    [attemptId],
  );

  await logEvent({
    attemptId,
    action: "COMPLETED",
    message: "Assessment submitted",
  });

  res.json({ success: true });
});

// GET LOGS
router.get("/logs/:attemptId", async (req, res) => {
  const logs = await db.query(
    "SELECT * FROM assessment_logs WHERE attempt_id=$1 ORDER BY created_at",
    [req.params.attemptId],
  );

  res.json(logs.rows);
});

router.get("/state/:attemptId", async (req, res) => {
  const answers = await db.query(
    "SELECT question_id FROM assessment_answers WHERE attempt_id=$1",
    [req.params.attemptId],
  );

  res.json({
    currentIndex: answers.rows.length,
  });
});

module.exports = router;
