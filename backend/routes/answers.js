const router = require("express").Router();
const db = require("../db");

router.post("/", async (req, res) => {
  const { attemptId, questionId, answer, isCorrect } = req.body;

  await db.query(
    `INSERT INTO assessment_answers(attempt_id,question_id,answer,is_correct)
   VALUES($1,$2,$3,$4)
   ON CONFLICT DO NOTHING`,
    [attemptId, questionId, answer, isCorrect],
  );

  res.sendStatus(200);
});

router.get("/:attemptId", async (req, res) => {
  const r = await db.query(
    "SELECT question_id,answer FROM assessment_answers WHERE attempt_id=$1",
    [req.params.attemptId],
  );

  res.json(r.rows);
});

module.exports = router;
