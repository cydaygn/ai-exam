import express from "express";
import db from "../db.js";

const router = express.Router();

/* -------------------------------------------
   KULLANICI DASHBOARD + PROFIL VERISI
   GET /api/user/:id
--------------------------------------------*/
router.get("/:id", (req, res) => {
  const userId = req.params.id;

  const summaryQuery = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      (SELECT COUNT(*) FROM user_tests WHERE user_id = ?) AS total_tests,
      (SELECT ROUND(AVG(score)) FROM user_tests WHERE user_id = ?) AS average_score,
      (SELECT exam_name FROM user_tests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1) AS last_test_name,
      (SELECT created_at FROM user_tests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1) AS last_test_date
    FROM users u
    WHERE u.id = ?
  `;

  db.query(
    summaryQuery,
    [userId, userId, userId, userId, userId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      const summary = result[0];

      db.query(
        `SELECT score FROM user_tests WHERE user_id = ? ORDER BY created_at DESC LIMIT 7`,
        [userId],
        (err2, weekly) => {
          if (err2) return res.status(500).json({ error: err2 });

          res.json({
            ...summary,
            weekly_scores: weekly.map((w) => w.score).reverse()
          });
        }
      );
    }
  );
});

/* -------------------------------------------
   TEST GEÇMİŞİ
--------------------------------------------*/
router.get("/tests/:id", (req, res) => {
  const userId = req.params.id;

  db.query(
    "SELECT * FROM user_tests WHERE user_id = ? ORDER BY created_at DESC",
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    }
  );
});

/* -------------------------------------------
   TEST KAYDET 
--------------------------------------------*/
router.post("/save-test", (req, res) => {
  const { userId, examName, score, correct, total } = req.body;

  db.query(
    "INSERT INTO user_tests (user_id, exam_name, score, correct, total) VALUES (?, ?, ?, ?, ?)",
    [userId, examName, score, correct, total],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true });
    }
  );
});

/* -------------------------------------------
   PERFORMANS SAYFASI
--------------------------------------------*/
router.get("/performance/:id", (req, res) => {
  const userId = req.params.id;

  const summaryQuery = `
    SELECT 
      COUNT(*) AS total_tests,
      AVG(score) AS avg_score
    FROM user_tests
    WHERE user_id = ?
  `;

  const weeklyQuery = `
    SELECT DAYOFWEEK(created_at) AS day, score
    FROM user_tests
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 7
  `;

  const topicQuery = `
    SELECT exam_name AS topic, AVG(score) AS topic_score
    FROM user_tests
    WHERE user_id = ?
    GROUP BY exam_name
  `;

  db.query(summaryQuery, [userId], (err, summary) => {
    if (err) return res.status(500).json({ error: "summary error" });

    db.query(weeklyQuery, [userId], (err2, weekly) => {
      if (err2) return res.status(500).json({ error: "weekly error" });

      db.query(topicQuery, [userId], (err3, topics) => {
        if (err3) return res.status(500).json({ error: "topic error" });

        res.json({
          total_tests: summary[0].total_tests,
          average_score: Math.round(summary[0].avg_score || 0),
          weekly_scores: weekly,
          topic_performance: topics
        });
      });
    });
  });
});

export default router;
