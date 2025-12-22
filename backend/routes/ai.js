import express from "express";
import db from "../db.js";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

if (!process.env.GROQ_API_KEY) {
  console.warn("❌ UYARI: GROQ_API_KEY .env dosyasında tanımlı değil.");
} else {
  console.log("✅ GROQ_API_KEY yüklendi");
}

// Rate limiting
const rateLimits = new Map();

function normalizeUserId(value) {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  if (!s || s === "null" || s === "undefined") return null;
  return s;
}

function checkRateLimit(userId) {
  const key = userId || "guest";
  const now = Date.now();
  const userLimit = rateLimits.get(key);

  if (!userLimit) {
    rateLimits.set(key, { count: 1, resetAt: now + 60000 });
    return { allowed: true };
  }

  if (now > userLimit.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + 60000 });
    return { allowed: true };
  }

  if (userLimit.count >= 5) {
    const retryAfter = Math.ceil((userLimit.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  userLimit.count++;
  return { allowed: true };
}

function getInitialSuggestions() {
  return [
    { 
      id: "analyze_last", 
      text: "📊 Son sınavımı analiz et", 
      prompt: "Son sınavımı detaylı analiz et",
      context: "initial"
    },
    { 
      id: "weak_topics", 
      text: "📚 Hangi konuya çalışmalıyım?", 
      prompt: "Zayıf olduğum konuları belirle",
      context: "initial"
    },
    { 
      id: "study_plan", 
      text: "📝 Çalışma planı oluştur", 
      prompt: "Bana detaylı çalışma planı hazırla",
      context: "initial"
    },
    { 
      id: "motivation", 
      text: "💪 Motivasyon ve strateji", 
      prompt: "Sınav motivasyonu ve etkili çalışma stratejileri öner",
      context: "initial"
    },
  ];
}

// AI yanıtına göre akıllı baloncuklar üret
function generateContextualSuggestions(lastUserPrompt, aiResponse) {
  const prompt = lastUserPrompt.toLowerCase();
  const response = aiResponse.toLowerCase();
  
  // SENARYO 1: Analiz istediyse
  if (prompt.includes("analiz")) {
    return [
      { 
        id: "improve_weak", 
        text: "💡 Zayıf konuları nasıl güçlendiririm?", 
        prompt: "Zayıf olduğum konuları güçlendirmek için somut adımlar ver",
        context: "after_analysis"
      },
      { 
        id: "study_plan_after_analysis", 
        text: "📅 Bu analize göre plan yap", 
        prompt: "Bu analizi göz önünde bulundurarak 1 haftalık çalışma planı oluştur",
        context: "after_analysis"
      },
      { 
        id: "time_management", 
        text: "⏰ Zaman yönetimi öner", 
        prompt: "Sınava kadar zamanı en verimli nasıl kullanabilirim?",
        context: "after_analysis"
      },
      { 
        id: "back_to_start", 
        text: "🔙 Ana menüye dön", 
        prompt: "Başka ne konuda yardımcı olabilirsin?",
        context: "reset"
      }
    ];
  }
  
  // SENARYO 2: Plan oluşturulduysa
  if (prompt.includes("plan") && response.includes("gün")) {
    return [
      { 
        id: "plan_details", 
        text: "📋 Daha detaylı açıkla", 
        prompt: "Bu planın her gününü daha detaylı açıkla, saat bazında",
        context: "plan_details"
      },
      { 
        id: "plan_lighter", 
        text: "😌 Daha hafif yap", 
        prompt: "Bu plan çok yoğun, daha hafif ve uygulanabilir bir versiyon hazırla",
        context: "plan_modify"
      },
      { 
        id: "plan_intense", 
        text: "🔥 Daha yoğun yap", 
        prompt: "Daha yoğun ve kapsamlı bir plan ver, hızlı ilerleme istiyorum",
        context: "plan_modify"
      },
      { 
        id: "track_plan", 
        text: "✅ Nasıl takip ederim?", 
        prompt: "Bu planı nasıl takip edebilirim? Kontrol listesi ve hatırlatıcı sistemi öner",
        context: "plan_tracking"
      },
      { 
        id: "back_to_start", 
        text: "🔙 Ana menüye dön", 
        prompt: "Başka konuda yardım ister misin?",
        context: "reset"
      }
    ];
  }
  
  // SENARYO 3: Konu çalışması önerisi
  if (prompt.includes("konu") || prompt.includes("zayıf")) {
    return [
      { 
        id: "how_to_study", 
        text: "📖 Bu konuyu nasıl çalışmalıyım?", 
        prompt: "Bu konuları çalışmak için en etkili yöntemleri detaylı anlat",
        context: "study_method"
      },
      { 
        id: "resources", 
        text: "📚 Kaynak öner", 
        prompt: "Bu konular için hangi kaynakları kullanmalıyım?",
        context: "resources"
      },
      { 
        id: "priority_order", 
        text: "🎯 Öncelik sırası ver", 
        prompt: "Bu konuları hangi sırayla çalışmalıyım? Öncelik sıralaması yap",
        context: "priority"
      },
      { 
        id: "create_schedule", 
        text: "📅 Bunlar için program yap", 
        prompt: "Bu konular için haftalık çalışma programı oluştur",
        context: "schedule"
      },
      { 
        id: "back_to_start", 
        text: "🔙 Ana menüye dön", 
        prompt: "Başka ne yardımım olabilir?",
        context: "reset"
      }
    ];
  }
  
  // SENARYO 4: Motivasyon ve strateji
  if (prompt.includes("motivasyon") || prompt.includes("strateji")) {
    return [
      { 
        id: "daily_motivation", 
        text: "☀️ Günlük motivasyon rutini", 
        prompt: "Günlük motivasyonu yüksek tutmak için sabah-akşam rutini öner",
        context: "motivation_routine"
      },
      { 
        id: "overcome_procrastination", 
        text: "⚡ Ertelemeyi nasıl yenerim?", 
        prompt: "Çalışmayı erteleme alışkanlığımı yenmek için pratik teknikler ver",
        context: "procrastination"
      },
      { 
        id: "focus_techniques", 
        text: "🎯 Konsantrasyon teknikleri", 
        prompt: "Çalışırken konsantrasyonu artırmanın en etkili yöntemlerini öğret",
        context: "focus"
      },
      { 
        id: "stress_management", 
        text: "🧘 Stres yönetimi", 
        prompt: "Sınav stresini yönetmek için neler yapabilirim?",
        context: "stress"
      },
      { 
        id: "back_to_start", 
        text: "🔙 Ana menüye dön", 
        prompt: "Başka hangi konuda destek olabilirim?",
        context: "reset"
      }
    ];
  }
  
  // SENARYO 5: Detay istiyorsa
  if (response.includes("detay") || prompt.includes("detay") || prompt.includes("açıkla")) {
    return [
      { 
        id: "example_give", 
        text: "📝 Örnek ver", 
        prompt: "Bunun için somut örnekler ve uygulamalar göster",
        context: "examples"
      },
      { 
        id: "step_by_step", 
        text: "👣 Adım adım anlat", 
        prompt: "Bunu adım adım nasıl yapacağımı göster",
        context: "steps"
      },
      { 
        id: "simplify", 
        text: "🎈 Daha basit anlat", 
        prompt: "Bunu daha basit ve anlaşılır şekilde açıkla",
        context: "simplify"
      },
      { 
        id: "back_to_start", 
        text: "🔙 Ana menüye dön", 
        prompt: "Başka ne öğrenmek istersin?",
        context: "reset"
      }
    ];
  }
  
  // SENARYO 6: Plan takibi
  if (prompt.includes("takip") || prompt.includes("kontrol")) {
    return [
      { 
        id: "checklist", 
        text: "✅ Günlük kontrol listesi", 
        prompt: "Günlük tamamlayacağım görevlerin kontrol listesini çıkar",
        context: "checklist"
      },
      { 
        id: "progress_measure", 
        text: "📊 İlerlemeyi nasıl ölçerim?", 
        prompt: "Gelişimimi ve başarımı ölçmek için hangi metrikleri kullanmalıyım?",
        context: "metrics"
      },
      { 
        id: "adjust_plan", 
        text: "🔄 Plan işlemiyor, değiştir", 
        prompt: "Planı uygulayamıyorum, daha realistik bir versiyon hazırla",
        context: "adjust"
      },
      { 
        id: "back_to_start", 
        text: "🔙 Ana menüye dön", 
        prompt: "Başka nasıl yardımcı olabilirim?",
        context: "reset"
      }
    ];
  }
  
  // DEFAULT: Genel devam seçenekleri
  return [
    { 
      id: "tell_more", 
      text: "💬 Daha fazla anlat", 
      prompt: "Bu konuda daha fazla bilgi ver",
      context: "more_info"
    },
    { 
      id: "practical_tips", 
      text: "🛠️ Pratik ipuçları", 
      prompt: "Bunun için pratik ve uygulanabilir ipuçları ver",
      context: "practical"
    },
    { 
      id: "different_approach", 
      text: "🔄 Farklı yaklaşım", 
      prompt: "Aynı konu için farklı bir yaklaşım öner",
      context: "alternative"
    },
    { 
      id: "back_to_start", 
      text: "🔙 Ana menüye dön", 
      prompt: "Ana menüye dön, başka konu",
      context: "reset"
    }
  ];
}

function getStudentContext(userId) {
  return new Promise((resolve, reject) => {
    const q1 = `
      SELECT 
        u.name,
        (SELECT COUNT(DISTINCT exam_name) FROM user_tests WHERE user_id = ?) AS total_tests,
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

async function askAI(prompt, conversationHistory = []) {
  if (!process.env.GROQ_API_KEY) {
    return { ok: false, status: 500, error: "GROQ_API_KEY yok" };
  }

  try {
    // Konuşma geçmişini dahil et (son 6 mesaj)
    const messages = [
      { 
        role: "system", 
        content: `Sen bir sınav hazırlık asistanısın. 
Kurallar:
- KISA ve ÖZ yanıtlar ver (max 150 kelime)
- Maddeli liste kullan
- Pratik ve uygulanabilir öneriler sun
- Türkçe yanıt ver
- Dostça ama profesyonel ol`
      },
      ...conversationHistory.slice(-6).map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      })),
      { role: "user", content: prompt }
    ];

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 400, // Kısa yanıtlar için
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || "";
    if (!text) return { ok: false, status: 502, error: "Boş yanıt" };
    return { ok: true, text };
  } catch (err) {
    const status = err?.status || 500;
    const msg = err?.error?.message || err?.message || "Groq hatası";
    return { ok: false, status, error: msg };
  }
}

/* -------- ENDPOINTS -------- */

router.get("/suggestions", async (req, res) => {
  try {
    const userId = normalizeUserId(req.query.userId);
    const context = req.query.context || "initial";
    
    if (context === "initial" || context === "reset") {
      return res.json({ success: true, suggestions: getInitialSuggestions() });
    }
    
    // Diğer context'ler için varsayılan
    return res.json({ success: true, suggestions: getInitialSuggestions() });
  } catch (err) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = normalizeUserId(req.body.userId);

    if (!message?.trim()) {
      return res.status(400).json({ success: false, error: "Mesaj boş olamaz" });
    }

    // Rate limiting kontrol
    const rateCheck = checkRateLimit(userId);
    if (!rateCheck.allowed) {
      return res.status(429).json({ 
        success: false, 
        error: "Çok fazla istek", 
        retryAfter: rateCheck.retryAfter 
      });
    }

    // Kullanıcı bağlamını al
    let ctx = null;
    let contextText = "";
    if (userId) {
      try {
        ctx = await getStudentContext(userId);
        contextText = `
[Öğrenci Profili]
- İsim: ${ctx.name}
- Toplam Test: ${ctx.total}
- Ortalama: %${ctx.avg || 0}
${ctx.lastTest ? `- Son Test: ${ctx.lastTest.exam_name} (%${ctx.lastTest.score})` : ""}
`;
      } catch (err) {
        console.error("Context hatası:", err);
      }
    }

    // AI'ya gönderilecek tam prompt
    const fullPrompt = `${contextText}

Kullanıcı İsteği: ${message}`;

    console.log("🤖 AI'ye istek gönderiliyor...");
    const result = await askAI(fullPrompt, conversationHistory);

    if (!result.ok) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error,
      });
    }

    // Yanıta göre akıllı baloncuklar üret
    const smartSuggestions = generateContextualSuggestions(message, result.text);

    return res.json({
      success: true,
      message: result.text,
      suggestions: smartSuggestions,
    });
  } catch (err) {
    console.error("❌ Chat endpoint hatası:", err);
    return res.status(500).json({ 
      success: false, 
      error: err?.message || "Bilinmeyen hata" 
    });
  }
});

export default router;