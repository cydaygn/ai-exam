import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

// Kayıt (Register)
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPass = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPass],
    (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: "Email zaten kayıtlı" });
      }
      return res.json({ success: true, message: "Kayıt başarılı!" });
    }
  );
});

// Giriş (Login)
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, rows) => {
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Kullanıcı bulunamadı" });
    }

    const user = rows[0];

    const passOk = await bcrypt.compare(password, user.password);
    if (!passOk) {
      return res.status(401).json({ success: false, message: "Şifre hatalı" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  });
});

export default router;
