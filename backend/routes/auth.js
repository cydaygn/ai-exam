import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();


const normalizeEmail = (v) => String(v || "").trim().toLowerCase();
const normalizeName = (v) => String(v || "").trim();


router.post("/register", async (req, res) => {
  try {
    const name = normalizeName(req.body.name);
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Eksik bilgi" });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPass],
      (err) => {
        if (err) {
          // duplicate email vb.
          return res.status(400).json({ success: false, message: "Email zaten kayıtlı" });
        }
        return res.status(201).json({ success: true, message: "Kayıt başarılı!" });
      }
    );
  } catch (e) {
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
});


router.post("/login", (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Eksik bilgi" });
  }

  db.query(
    "SELECT * FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1",
    [email],
    async (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: "DB hatası" });
      }

      if (!rows || rows.length === 0) {
        return res.status(401).json({ success: false, message: "Kullanıcı bulunamadı" });
      }

      const user = rows[0];

      const passOk = await bcrypt.compare(password, user.password);
      if (!passOk) {
        return res.status(401).json({ success: false, message: "Şifre hatalı" });
      }

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" } 
      );

      return res.json({
        success: true,
      user: {
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  plan: user.plan || "free",
},

        token,
      });
    }
  );
});

export default router;
