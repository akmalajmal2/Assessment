const db = require("../db");

async function logEvent({ attemptId, questionId = null, action, message }) {
  try {
    await db.query(
      `INSERT INTO assessment_logs(attempt_id,question_id,action,message)
       VALUES($1,$2,$3,$4)`,
      [attemptId, questionId, action, message],
    );
  } catch (e) {
    console.error("LOGGER ERROR:", e.message);
  }
}

module.exports = logEvent;
