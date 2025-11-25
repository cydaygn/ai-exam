import express from "express";
import db from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const uploadsDir = "uploads/exams";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});
const upload = multer({ storage });

// ---------------------------------------------
// ADMIN LOGIN
// ---------------------------------------------
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM admins WHERE email = ?", [email], async (err, rows) => {
    if (err) return res.status(500).json({ success: false });
    if (rows.length === 0)
      return res.status(401).json({ success: false, message: "Admin bulunamadı" });

    const admin = rows[0];
    const ok = await bcrypt.compare(password, admin.password);

    if (!ok) return res.status(401).json({ success: false, message: "Hatalı şifre" });

    const token = jwt.sign({ id: admin.id, role: "admin" }, process.env.JWT_SECRET);

    res.json({
      success: true,
      admin: { id: admin.id, name: admin.name, email: admin.email },
      token,
    });
  });
});

// ---------------------------------------------
// SINAV OLUŞTUR
// ---------------------------------------------
router.post("/exam/create", (req, res) => {
  const { title, description } = req.body;

  db.query(
    "INSERT INTO exams (title, description) VALUES (?, ?)",
    [title, description],
    (err, result) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true, examId: result.insertId });
    }
  );
});

// ---------------------------------------------
// SINAVLARI GETİR
// ---------------------------------------------
router.get("/exams", (req, res) => {
  db.query("SELECT * FROM exams ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ success: false });
    res.json(rows);
  });
});

// ---------------------------------------------
// TEKLİ SORU EKLE (RESİMLİ)
// ---------------------------------------------
router.post("/exam/:id/question", upload.single("image"), (req, res) => {
  const examId = req.params.id;
  const { question, option1, option2, option3, option4, option5, correct } = req.body;

  const imageUrl = req.file ? `/uploads/exams/${req.file.filename}` : null;

  db.query(
    `INSERT INTO exam_questions
    (exam_id, question, option1, option2, option3, option4, option5, correct, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [examId, question, option1, option2, option3, option4, option5, correct, imageUrl],
    (err) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true });
    }
  );
});

// ---------------------------------------------
// TOPLU SORU EKLE (GELİŞTİRİLMİŞ)
// ---------------------------------------------
router.post("/exam/:id/bulk-questions", (req, res) => {
  const examId = req.params.id;
  const { questions } = req.body;

  if (!questions || questions.length === 0)
    return res.status(400).json({ success: false, message: "Soru yok" });

  const values = questions.map((q) => [
    examId,
    q.question,
    q.option1,
    q.option2,
    q.option3,
    q.option4,
    q.option5,
    q.correct,
    null,
  ]);

  const placeholder = "(?,?,?,?,?,?,?,?,?)";
  const sql = `
   INSERT INTO exam_questions 
   (exam_id, question, option1, option2, option3, option4, option5, correct, image_url)
   VALUES ${values.map(() => placeholder).join(",")}
  `;

  db.query(sql, values.flat(), (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, count: questions.length });
  });
});

// ---------------------------------------------
// SORU DÜZENLE
// ---------------------------------------------
router.put("/question/:id", (req, res) => {
  const id = req.params.id;
  const { question, option1, option2, option3, option4, option5, correct } = req.body;

  const sql = `
    UPDATE exam_questions SET 
      question=?,
      option1=?,
      option2=?,
      option3=?,
      option4=?,
      option5=?,
      correct=?
    WHERE id=?
  `;

  db.query(
    sql,
    [question, option1, option2, option3, option4, option5, correct, id],
    (err, result) => {
      if (err) {
        console.error("Soru güncelleme hatası:", err);
        return res.status(500).json({ success: false, error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Soru bulunamadı" });
      }

      res.json({ success: true, message: "Soru güncellendi" });
    }
  );
});

// ---------------------------------------------
// SINAV SİL
// ---------------------------------------------
router.delete("/exam/:id", (req, res) => {
  const examId = req.params.id;

  db.query("DELETE FROM exam_questions WHERE exam_id = ?", [examId], (err1) => {
    if (err1) {
      console.error("Sorular silinirken hata:", err1);
      return res.status(500).json({ success: false, error: err1.message });
    }

    db.query("DELETE FROM exams WHERE id = ?", [examId], (err2, result) => {
      if (err2) {
        console.error("Sınav silinirken hata:", err2);
        return res.status(500).json({ success: false, error: err2.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Sınav bulunamadı",
        });
      }

      res.json({
        success: true,
        message: "Sınav silindi",
      });
    });
  });
});

// ---------------------------------------------
// SINAV GÜNCELLE
// ---------------------------------------------
router.put("/exam/:id", (req, res) => {
  const examId = req.params.id;
  const { title, description } = req.body;

  db.query(
    "UPDATE exams SET title = ?, description = ? WHERE id = ?",
    [title, description, examId],
    (err, result) => {
      if (err) {
        console.error("Sınav güncelleme hatası:", err);
        return res.status(500).json({ success: false, error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Sınav bulunamadı"
        });
      }

      res.json({
        success: true,
        message: "Sınav güncellendi"
      });
    }
  );
});

// ---------------------------------------------
// SORU GETİR (SINAVA AİT)
// ---------------------------------------------
router.get("/exam/:id/questions", (req, res) => {
  db.query(
    "SELECT * FROM exam_questions WHERE exam_id=? ORDER BY id ASC",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ success: false });
      res.json(rows);
    }
  );
});

// ---------------------------------------------
// ÖĞRENCİLERİ GETİR
// ---------------------------------------------
router.get("/students", (req, res) => {
  const query = `
    SELECT 
      u.id, 
      u.name, 
      u.email,
      COUNT(ut.id) AS totalTests,
      COALESCE(ROUND(AVG(ut.score)), 0) AS avgScore,
      COALESCE(MAX(ut.created_at), '') AS lastTest
    FROM users u
    LEFT JOIN user_tests ut ON u.id = ut.user_id
    WHERE u.role = 'student'
    GROUP BY u.id
    ORDER BY u.id DESC
  `;
  
  db.query(query, (err, rows) => {
    if (err) {
      console.error("Öğrenciler getirilirken hata:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json(rows);
  });
});

// ---------------------------------------------
// DASHBOARD İSTATİSTİKLERİ
// ---------------------------------------------
router.get("/dashboard/stats", (req, res) => {
  const stats = {};

  const queries = {
    totalUsers: "SELECT COUNT(*) AS total FROM users WHERE role = 'student'",
    totalExams: "SELECT COUNT(*) AS total FROM exams",
    totalQuestions: "SELECT COUNT(*) AS total FROM exam_questions",
    totalTests: "SELECT COUNT(*) AS total FROM user_tests",
    averageScore: "SELECT COALESCE(ROUND(AVG(score)), 0) AS avg FROM user_tests",
    recentTests: `
      SELECT 
        ut.score, 
        ut.created_at, 
        ut.exam_name, 
        u.name AS user_name
      FROM user_tests ut
      JOIN users u ON u.id = ut.user_id
      ORDER BY ut.created_at DESC
      LIMIT 5
    `,
    topStudents: `
      SELECT 
        u.name,
        COUNT(ut.id) AS test_count,
        COALESCE(ROUND(AVG(ut.score)), 0) AS avg_score
      FROM users u
      JOIN user_tests ut ON ut.user_id = u.id
      WHERE u.role = 'student'
      GROUP BY u.id
      ORDER BY avg_score DESC
      LIMIT 5
    `,
    examStats: `
      SELECT 
        exam_name,
        COUNT(*) AS test_count,
        COALESCE(ROUND(AVG(score)), 0) AS avg_score
      FROM user_tests
      GROUP BY exam_name
      ORDER BY test_count DESC
    `
  };

  const keys = Object.keys(queries);
  let completed = 0;

  keys.forEach((key) => {
    db.query(queries[key], (err, result) => {
      if (err) {
        console.error("Dashboard error:", err);
        return res.status(500).json({ success: false });
      }

      // sayı dönen sorgular
      if (key.startsWith("total") || key === "averageScore") {
        const row = result[0];
        stats[key] = row.total ?? row.avg; // sadece sayı
      }
      // liste dönen sorgular
      else {
        stats[key] = result;
      }

      completed++;
      if (completed === keys.length) {
        res.json(stats);
      }
    });
  });
});

// ---------------------------------------------
// ÖĞRENCİ SİL
// ---------------------------------------------
router.delete("/student/:id", (req, res) => {
  const studentId = req.params.id;

  // Önce test sonuçlarını sil
  db.query("DELETE FROM user_tests WHERE user_id = ?", [studentId], (err1) => {
    if (err1) {
      console.error("Test sonuçları silinirken hata:", err1);
      return res.status(500).json({ success: false, error: err1.message });
    }

    // Sonra öğrenciyi sil
    db.query("DELETE FROM users WHERE id = ?", [studentId], (err2, result) => {
      if (err2) {
        console.error("Öğrenci silinirken hata:", err2);
        return res.status(500).json({ success: false, error: err2.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Öğrenci bulunamadı",
        });
      }

      res.json({
        success: true,
        message: "Öğrenci silindi",
      });
    });
  });
});
// ---------------------------------------------
// SORU SİL
// ---------------------------------------------
router.delete("/question/:id", (req, res) => {
  db.query(
    "DELETE FROM exam_questions WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true });
    }
  );
});

export default router;