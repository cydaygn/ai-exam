import express from "express";
import db from "../db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

/* ---------------- GEMINI ---------------- */

const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) console.warn("UYARI: GEMINI_API_KEY .env dosyasında tanımlı değil.");

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

let CACHED_MODEL = null;
const MODEL_CANDIDATES = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"];

async function generateWithModel(modelName, prompt) {
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function askGemini(prompt) {
  if (!GEMINI_KEY) return "GEMINI_API_KEY yok. Backend .env içine ekle.";

  if (CACHED_MODEL) {
    try {
      const t = await generateWithModel(CACHED_MODEL, prompt);
      if (t) return t;
    } catch {
      CACHED_MODEL = null;
    }
  }

  let lastErr = null;
  for (const m of MODEL_CANDIDATES) {
    try {
      const t = await generateWithModel(m, prompt);
      if (t) {
        CACHED_MODEL = m;
        return t;
      }
    } catch (e) {
      lastErr = e;
      console.error("Gemini model başarısız:", m, e?.status || "", e?.message || e);
    }
  }

  console.error("Gemini son hata:", lastErr);
  return "Gemini çalışmıyor. (Muhtemelen API key yanlış/izinsiz veya model erişimi yok.)";
}

/* ---------------- DEBUG: LIST MODELS ---------------- */

router.get("/models", async (req, res) => {
  try {
    if (!GEMINI_KEY) return res.status(400).json({ success: false, error: "GEMINI_API_KEY yok" });

    if (typeof genAI.listModels !== "function") {
      return res.status(500).json({
        success: false,
        error: "listModels yok. Paketi güncelle: npm i @google/generative-ai@latest",
      });
    }

    const out = await genAI.listModels();
    const models = (out?.models || []).map((m) => ({
      name: m?.name,
      supportedGenerationMethods: m?.supportedGenerationMethods,
    }));
    return res.json({ success: true, models });
  } catch (err) {
    return res.status(500).json({
      success: false,
      status: err?.status,
      error: err?.message || String(err),
    });
  }
});

/* ---------------- INTENTS ---------------- */

const INTENTS = {
  greeting: ["merhaba", "selam", "hello", "hi", "hey", "naber"],
  performance: ["son sınav", "son deneme", "istatistik", "ortalama", "kaç net", "performans"],
  analysis: ["analiz", "incele", "yorumla", "çözümle", "değerlendir"],
  study: ["çalışma", "plan", "program", "ne çalışmalı", "çalışma planı"],
  solve: ["çöz", "cevap", "soru", "çözüm"],
  explain: ["nedir", "açıkla", "konu anlat", "anlat"],
  weak_topics: ["eksik", "zayıf", "hangi konu", "neleri çalışmalı"],
  motivation: ["motivasyon", "moral", "başaramıyorum", "yoruldum"],
};

function fuzzy(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  let diff = Math.abs(a.length - b.length);
  let len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) diff++;
    if (diff > 2) return false;
  }
  return true;
}

function detectIntent(text) {
  text = (text || "").toLowerCase();
  for (const intent in INTENTS) {
    for (const kw of INTENTS[intent]) {
      if (text.includes(kw)) return intent;
      if (fuzzy(text, kw)) return intent;
    }
  }
  return "chat";
}

/* ---------------- HELPERS ---------------- */

function normalizeUserId(value) {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  if (!s || s === "null" || s === "undefined") return null;
  return s;
}

function getGuestSuggestions() {
  return [
    { id: "analyze_last", text: "📊 Son sınavımı analiz et", prompt: "Son sınavımı detaylı analiz et ve öneriler sun" },
    { id: "weak_topics", text: "📚 Hangi konuya çalışmalıyım?", prompt: "Zayıf olduğum konuları belirle ve öncelik sırası ver" },
    { id: "study_plan", text: "📝 1 haftalık çalışma planı", prompt: "Bana 1 haftalık çalışma planı hazırla (gün gün, konu konu)." },
    { id: "motivation", text: "💪 Motivasyon ve taktikler", prompt: "Sınav motivasyonu ve etkili çalışma taktikleri öner" },
  ];
}

/* ---------------- DB CONTEXT ---------------- */

function getStudentContext(userId) {
  return new Promise((resolve, reject) => {
    const q1 = `
      SELECT 
        u.name,
        (SELECT COUNT(*) FROM user_tests WHERE user_id = ?) AS total_tests,
        (SELECT ROUND(AVG(score)) FROM user_tests WHERE user_id = ?) AS avg_score
      FROM users u
      WHERE u.id = ?
    `;

    db.query(q1, [userId, userId, userId], (err, userRows) => {
      if (err) return reject(err);

      const user = userRows[0] || { name: "Öğrenci", total_tests: 0, avg_score: 0 };

      const q2 = `
        SELECT exam_name, score, created_at
        FROM user_tests
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 5
      `;

      db.query(q2, [userId], (err2, tests) => {
        if (err2) return reject(err2);
        resolve({
          name: user.name,
          total: user.total_tests,
          avg: user.avg_score,
          tests,
          lastTest: tests[0] || null,
        });
      });
    });
  });
}

function generateSuggestions(ctx) {
  const suggestions = [];
  suggestions.push({ id: "analyze_last", text: "📊 Son sınavımı analiz et", prompt: "Son sınavımı detaylı analiz et ve öneriler sun" });
  suggestions.push({ id: "weak_topics", text: "📚 Hangi konuya çalışmalıyım?", prompt: "Zayıf olduğum konuları belirle ve öncelik sırası ver" });

  if (ctx.total > 0) {
    suggestions.push({ id: "study_plan", text: "📝 1 haftalık çalışma planı", prompt: "Bana 1 haftalık çalışma planı hazırla (gün gün, konu konu)." });
  }
  if (ctx.avg < 70) {
    suggestions.push({ id: "improvement", text: "📈 Performansımı artır", prompt: "Sınav performansımı artırmak için net bir plan ver." });
  }
  suggestions.push({ id: "motivation", text: "💪 Motivasyon ve taktikler", prompt: "Sınav motivasyonu ve etkili çalışma taktikleri öner" });

  return suggestions.length >= 4 ? suggestions : getGuestSuggestions();
}

/* ---------------- ENDPOINTS ---------------- */

router.get("/suggestions", async (req, res) => {
  try {
    const userId = normalizeUserId(req.query.userId);
    if (!userId) return res.json({ success: true, suggestions: getGuestSuggestions() });

    const ctx = await getStudentContext(userId);
    return res.json({ success: true, suggestions: generateSuggestions(ctx) });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const userId = normalizeUserId(req.body.userId);

    if (!message?.trim()) return res.status(400).json({ error: "Mesaj boş olamaz" });

    const intent = detectIntent(message);

    let ctx = null;
    let contextText = "";
    if (userId) {
      try {
        ctx = await getStudentContext(userId);
        contextText = `
Öğrenci:
- İsim: ${ctx.name}
- Toplam Test: ${ctx.total}
- Ortalama: %${ctx.avg}
- Son Testler: ${ctx.tests.map((t) => `${t.exam_name} (%${t.score})`).join(", ")}
`;
      } catch {}
    }

    if (intent === "greeting") {
      const userName = ctx?.name || "Öğrenci";
      const suggestions = ctx ? generateSuggestions(ctx) : getGuestSuggestions();
      return res.json({
        success: true,
        message: `Merhaba ${userName}! Aşağıdan bir baloncuk seçerek devam edin.`,
        suggestions: suggestions.slice(0, 6),
      });
    }

    const systemPrompt =
      intent === "analysis"
        ? "Detaylı sınav analizi yap, somut öneriler sun."
        : intent === "study"
        ? "Gün gün, konu konu çalışma planı ver."
        : intent === "weak_topics"
        ? "Eksik konuları belirle ve öncelik sırası ver."
        : "Net, kısa ve yönlendirici yanıt ver.";

    const fullPrompt = `
${systemPrompt}

${contextText}

Kullanıcı Mesajı:
"${message}"

Kurallar:
- Kullanıcıya metin yazdırma; yönlendirme baloncuklarla yapılacak.
- Kısa, maddeli, uygulanabilir öneriler ver.
`;

    const answer = await askGemini(fullPrompt);
    const suggestions = ctx ? generateSuggestions(ctx) : getGuestSuggestions();
    return res.json({ success: true, message: answer, suggestions: suggestions.slice(0, 6) });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
