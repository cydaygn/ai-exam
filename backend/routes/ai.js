import express from "express";
import db from "../db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

/* ---------------- GEMINI CLIENT ---------------- */

if (!process.env.GEMINI_API_KEY) {
  console.warn("UYARI: GEMINI_API_KEY .env dosyasında tanımlı değil.");
}

// ✅ tek genAI (dosya seviyesinde)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ model cache + adaylar
let CACHED_MODEL_NAME = null;

const MODEL_CANDIDATES = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-1.0-pro",
  "gemini-pro",
];

async function generateWithModel(modelName, prompt) {
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

async function askGemini(prompt) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return "GEMINI_API_KEY tanımlı değil.";
    }

    // önce cache'li modeli dene
    if (CACHED_MODEL_NAME) {
      try {
        const t = await generateWithModel(CACHED_MODEL_NAME, prompt);
        if (t) return t;
      } catch {
        CACHED_MODEL_NAME = null;
      }
    }

    let lastErr = null;

    for (const modelName of MODEL_CANDIDATES) {
      try {
        const text = await generateWithModel(modelName, prompt);
        if (text) {
          CACHED_MODEL_NAME = modelName;
          return text;
        }
      } catch (err) {
        lastErr = err;
        const status = err?.status || err?.response?.status;
        console.error(`Gemini model başarısız: ${modelName}`, status || "", err?.message || err);
        continue;
      }
    }

    console.error("Gemini API HATASI (tüm modeller):", lastErr);
    return "AI servisine bağlanırken hata oluştu (uygun model bulunamadı).";
  } catch (err) {
    console.error("Gemini API HATASI:", err);
    return "AI servisine bağlanırken hata oluştu.";
  }
}

/* ----------------------- INTENT SYSTEM ----------------------- */

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

/* -------------------- HELPERS -------------------- */

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

/* -------------------- STUDENT CONTEXT -------------------- */

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

        const lastTest = tests[0] || null;

        resolve({
          name: user.name,
          total: user.total_tests,
          avg: user.avg_score,
          tests,
          lastTest,
        });
      });
    });
  });
}

/* -------------------- GENERATE SUGGESTIONS -------------------- */

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

  if (ctx.total >= 3) {
    suggestions.push({ id: "compare", text: "📉 Son 3 sınavımı karşılaştır", prompt: "Son 3 sınavımdaki gelişimimi analiz et" });
  }

  suggestions.push({ id: "motivation", text: "💪 Motivasyon ve taktikler", prompt: "Sınav motivasyonu ve etkili çalışma taktikleri öner" });

  return suggestions.length >= 4 ? suggestions : getGuestSuggestions();
}

/* ----------------------- GET SUGGESTIONS ENDPOINT ----------------------- */

router.get("/suggestions", async (req, res) => {
  try {
    const userId = normalizeUserId(req.query.userId);

    if (!userId) {
      return res.json({ success: true, suggestions: getGuestSuggestions() });
    }

    const ctx = await getStudentContext(userId);
    const suggestions = generateSuggestions(ctx);

    res.json({ success: true, suggestions });
  } catch (err) {
    console.error("ÖNERİ HATASI:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ----------------------- AI CHAT ----------------------- */

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const userId = normalizeUserId(req.body.userId);

    if (!message?.trim()) {
      return res.status(400).json({ error: "Mesaj boş olamaz" });
    }

    const intent = detectIntent(message);
    let contextText = "";
    let ctx = null;

    if (userId) {
      try {
        ctx = await getStudentContext(userId);
        contextText = `
Öğrenci Bilgileri:
- İsim: ${ctx.name}
- Toplam Test: ${ctx.total}
- Ortalama Puan: %${ctx.avg}
- Son Testler: ${ctx.tests.map((t) => `${t.exam_name} (%${t.score})`).join(", ")}
`;
      } catch (e) {
        console.error("Context Error:", e);
      }
    }

    if (intent === "greeting") {
      const userName = ctx?.name || "Öğrenci";
      let greetingMsg = `Merhaba ${userName}! Sınav hazırlık asistanınızım. `;

      if (ctx && ctx.total > 0) {
        greetingMsg += `Şu ana kadar ${ctx.total} test çözmüşsünüz, ortalamanız %${ctx.avg}. `;
      }

      greetingMsg += `Aşağıdan bir baloncuk seçerek devam edin.`;

      const suggestions = ctx ? generateSuggestions(ctx) : getGuestSuggestions();

      return res.json({
        success: true,
        message: greetingMsg,
        suggestions: suggestions.slice(0, 6),
      });
    }

    let systemPrompt = "";
    switch (intent) {
      case "performance":
        systemPrompt = "Kullanıcının sınav performansını analiz et, güçlü ve zayıf yönlerini belirt.";
        break;
      case "analysis":
        systemPrompt = "Detaylı sınav analizi yap, somut öneriler sun.";
        break;
      case "study":
        systemPrompt = "Günlük çalışma planı oluştur (gün gün, konu konu).";
        break;
      case "solve":
        systemPrompt = "Soruyu adım adım çöz, her adımı açıkla.";
        break;
      case "explain":
        systemPrompt = "Konuyu basit örneklerle anlat.";
        break;
      case "weak_topics":
        systemPrompt = "Eksik konuları belirle ve öncelik sırası ver.";
        break;
      case "motivation":
        systemPrompt = "Motivasyon artırıcı ve pratik tavsiyeler ver.";
        break;
      default:
        systemPrompt = "Net, kısa ve kullanıcıyı baloncuklarla yönlendiren bir tonla yanıt ver.";
    }

    const fullPrompt = `
${systemPrompt}

${contextText}

Kullanıcı Mesajı:
"${message}"

Yanıt kuralları:
- Net ve anlaşılır ol
- Gereksiz tekrar yapma
- Maddeler kullan
- Kullanıcıya yazı yazdırmaya çalışma; yönlendirme baloncuklarla yapılacak
`;

    const answer = await askGemini(fullPrompt);
    const suggestions = ctx ? generateSuggestions(ctx) : getGuestSuggestions();

    res.json({
      success: true,
      message: answer,
      suggestions: suggestions.slice(0, 6),
    });
  } catch (err) {
    console.error("AI HATASI:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ------------------- EXAM ANALYSIS ------------------- */

router.post("/analyze-exam", async (req, res) => {
  try {
    const { examName, questions, answers } = req.body;

    const wrong = [];
    const subjects = {};

    questions.forEach((q, i) => {
      const subj = q.subject || "Genel";
      if (!subjects[subj]) subjects[subj] = { correct: 0, wrong: 0 };

      if (answers[i] !== q.answer) {
        wrong.push({ number: i + 1, question: q.question, subject: subj });
        subjects[subj].wrong++;
      } else {
        subjects[subj].correct++;
      }
    });

    const analysisPrompt = `
Sınav Detaylı Analizi:

Sınav: ${examName}
Toplam Soru: ${questions.length}
Doğru: ${questions.length - wrong.length}
Yanlış: ${wrong.length}
Net: ${questions.length - wrong.length - wrong.length / 4}

Konu Bazlı Performans:
${Object.entries(subjects)
  .map(([subj, stats]) => `${subj}: ${stats.correct} doğru, ${stats.wrong} yanlış`)
  .join("\n")}

Yanlış sorular: ${wrong.map((w) => `${w.number}. ${w.subject}`).join(", ")}

Kullanıcıya:
1. En zayıf konuları
2. Nasıl çalışmalı
3. Hangi tür soru çözmeli
4. Kısa motivasyon

Net ve öz yaz. Kullanıcıya metin yazdırma; öneriler baloncukla ilerleyecek.
`;

    const text = await askGemini(analysisPrompt);

    res.json({
      success: true,
      analysis: text,
      score: Math.round(((questions.length - wrong.length) / questions.length) * 100),
      subjects,
    });
  } catch (err) {
    console.error("ANALIZ HATASI:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ----------------- WRONG ANSWER EXPLANATION ----------------- */

router.post("/explain-question", async (req, res) => {
  try {
    const { question, options, userAnswer, correctAnswer } = req.body;

    const prompt = `
Soru Açıklaması:

Soru: ${question}
Seçenekler:
${options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join("\n")}

Öğrencinin Cevabı: ${String.fromCharCode(65 + userAnswer)}. ${options[userAnswer]}
Doğru Cevap: ${String.fromCharCode(65 + correctAnswer)}. ${options[correctAnswer]}

Format:
1) Soru ne istiyor?
2) Doğru neden doğru?
3) Yanlış neden yanlış?
4) Hangi konu tekrar edilmeli?

Kısa ve öğretici yaz.
`;

    const text = await askGemini(prompt);

    res.json({ success: true, explanation: text });
  } catch (err) {
    console.error("AÇIKLAMA HATASI:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
