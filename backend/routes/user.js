// backend/routes/user.js
import express from "express";
import db from "../db.js";

const router = express.Router();

/* -------------------------------------------
   TEST GEÇMİŞİ
   GET /api/user/tests/:id
--------------------------------------------*/
router.get("/tests/:id", (req, res) => {
  const userId = req.params.id;

  const query = `
    SELECT ut.*
    FROM user_tests ut
    INNER JOIN (
      SELECT exam_name, MAX(id) AS last_id
      FROM user_tests
      WHERE user_id = ?
      GROUP BY exam_name
    ) t ON t.last_id = ut.id
    WHERE ut.user_id = ?
    ORDER BY ut.created_at DESC
    LIMIT 10
  `;

  db.query(query, [userId, userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});

/* -------------------------------------------
   TEST KAYDET
   POST /api/user/save-test
--------------------------------------------*/
router.post("/save-test", (req, res) => {
  const { userId, examId, examName, score, correct, total } = req.body;

  if (!userId || !examName) {
    return res
      .status(400)
      .json({ success: false, error: "userId ve examName zorunlu" });
  }

  db.query(
    "INSERT INTO user_tests (user_id, exam_id, exam_name, score, correct, total) VALUES (?, ?, ?, ?, ?, ?)",
    [userId, examId ?? null, examName, score ?? 0, correct ?? 0, total ?? 0],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true });
    }
  );
});

/* -------------------------------------------
   PERFORMANS SAYFASI
   GET /api/user/performance/:id
--------------------------------------------*/
router.get("/performance/:id", (req, res) => {
  const userId = req.params.id;

  const summaryQuery = `
    SELECT 
      COUNT(DISTINCT exam_name) AS total_tests,
      AVG(score) AS avg_score
    FROM user_tests
    WHERE user_id = ?
  `;

  const weeklyQuery = `
    SELECT score
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
    if (err)
      return res
        .status(500)
        .json({ error: "summary error", details: err.message });

    const totalTests = summary?.[0]?.total_tests || 0;
    const avgScore = Math.round(summary?.[0]?.avg_score || 0);

    db.query(weeklyQuery, [userId], (err2, weekly) => {
      if (err2)
        return res
          .status(500)
          .json({ error: "weekly error", details: err2.message });

      db.query(topicQuery, [userId], (err3, topics) => {
        if (err3)
          return res
            .status(500)
            .json({ error: "topic error", details: err3.message });

        res.json({
          total_tests: totalTests,
          average_score: avgScore,
          weekly_scores: (weekly || []).map((w) => w.score).reverse(), // number[]
          topic_performance: topics || [],
        });
      });
    });
  });
});

/* -------------------------------------------
   PROFİL GÜNCELLEME
   PUT /api/user/:id
--------------------------------------------*/
router.put("/:id", (req, res) => {
  const userId = req.params.id;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: "İsim boş olamaz." });
  }

  const updateQuery = `
    UPDATE users
    SET name = ?
    WHERE id = ?
  `;

  db.query(updateQuery, [name, userId], (err) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, error: "Profil güncellenemedi." });

    const getQuery = `
      SELECT id, name, email, role
      FROM users
      WHERE id = ?
    `;

    db.query(getQuery, [userId], (err2, rows) => {
      if (err2 || rows.length === 0) {
        return res.json({ success: true, message: "İsim güncellendi." });
      }

      res.json({ success: true, profile: rows[0] });
    });
  });
});

/* -------------------------------------------
   KULLANICI DASHBOARD + PROFIL VERISI
   GET /api/user/:id
   (EN SONDA OLMALI!)
--------------------------------------------*/
router.get("/:id", (req, res) => {
  const userId = req.params.id;

  const summaryQuery = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role,

      (SELECT COUNT(DISTINCT exam_name)
       FROM user_tests
       WHERE user_id = ?) AS total_tests,

      (SELECT ROUND(AVG(score))
       FROM user_tests
       WHERE user_id = ?) AS average_score,

      (SELECT exam_name
       FROM user_tests
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 1) AS last_test_name,

      (SELECT created_at
       FROM user_tests
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 1) AS last_test_date,

      (SELECT exam_id
       FROM user_tests
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 1) AS last_exam_id

    FROM users u
    WHERE u.id = ?
  `;

  db.query(
    summaryQuery,
    [userId, userId, userId, userId, userId, userId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      const summary = result?.[0] || {};

      db.query(
        `SELECT score FROM user_tests WHERE user_id = ? ORDER BY created_at DESC LIMIT 7`,
        [userId],
        (err2, weekly) => {
          if (err2) return res.status(500).json({ error: err2 });

          res.json({
            ...summary,
            weekly_scores: (weekly || []).map((w) => w.score).reverse(),
          });
        }
      );
    }
  );
});

export default router;
