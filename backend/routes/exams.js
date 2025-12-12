// backend/routes/exams.js
import express from "express";
import db from "../db.js";

const router = express.Router();

/* -------------------------------------------
   TÜM SINAVLAR
--------------------------------------------*/
router.get("/", (req, res) => {
  db.query(
    "SELECT id, title, exam_type, created_at FROM exams",
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    }
  );
});

/* -------------------------------------------
   SINAV TÜRÜNE GÖRE LİSTE
--------------------------------------------*/
router.get("/type/:type", (req, res) => {
  const type = req.params.type;

  db.query(
    "SELECT id, title, exam_type, created_at FROM exams WHERE exam_type = ?",
    [type],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    }
  );
});

/* -------------------------------------------
   TEK SINAV + SORULAR
--------------------------------------------*/
router.get("/:id", (req, res) => {
  const examId = req.params.id;

  db.query("SELECT * FROM exams WHERE id = ?", [examId], (err1, examRows) => {
    if (err1) return res.status(500).json({ error: err1 });
    if (examRows.length === 0) {
      return res.status(404).json({ error: "Sınav bulunamadı" });
    }

    const exam = examRows[0];

    db.query(
      "SELECT * FROM exam_questions WHERE exam_id = ?",
      [examId],
      (err2, questions) => {
        if (err2) return res.status(500).json({ error: err2 });

        res.json({
          id: exam.id,
          title: exam.title,
          exam_type: exam.exam_type,
          questions: questions.map(q => ({
            id: q.id,
            question: q.question,
            options: [
              q.option1,
              q.option2,
              q.option3,
              q.option4,
              q.option5,
            ],
            answer: q.correct,
            image_url: q.image_url,
          })),
        });
      }
    );
  });
});

export default router;
