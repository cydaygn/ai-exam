import { useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, XCircle, MinusCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { API_URL } from "../api";

function ExamResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  // state yoksa sınav listesine dön
  useEffect(() => {
    if (!state?.questions || !state?.answers) {
      navigate("/student/exams", { replace: true });
    }
  }, [state, navigate]);

  if (!state?.questions || !state?.answers) return null;

  const { questions, answers, examTitle } = state;

  // backend: answer = q.correct (1..5), 0 ise "girilmamış"
  const getCorrectIndex = (q) => {
    const a = q.answer;
    const len = q.options?.length || 0;

    if (typeof a !== "number") return null;
    if (a >= 1 && a <= len) return a - 1;
    return null; // 0 veya saçma değer
  };

  const stats = useMemo(() => {
    const total = questions.length;
    let correct = 0;
    let wrong = 0;
    let empty = 0;

    for (let i = 0; i < total; i++) {
      const userAns = answers[i];
      const correctIdx = getCorrectIndex(questions[i]);

      if (userAns === null || userAns === undefined) empty++;
      else if (correctIdx !== null && userAns === correctIdx) correct++;
      else wrong++;
    }

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, wrong, empty, score };
  }, [questions, answers]);

  // ✅ DB'ye kaydet (sadece 1 kere)
  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userId = user?.id;
    if (!userId) return;

    savedRef.current = true;

    fetch(`${API_URL}/user/save-test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
       examId: Number(id), 
        examName: examTitle || `Exam ${id}`,
        score: stats.score,
        correct: stats.correct,
        total: stats.total,
      }),
    }).catch((e) => console.error("save-test error:", e));
  }, [stats, examTitle, id]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-cyan-200/45 rounded-full blur-3xl" />
        <div className="absolute top-10 right-[-180px] w-[560px] h-[560px] bg-emerald-200/45 rounded-full blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-sky-200/35 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,.18)_1px,transparent_0)] [background-size:26px_26px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 lg:px-10 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/60 px-4 py-2 text-sm text-slate-700">
              Sonuç Ekranı
            </div>
            <h1 className="mt-3 text-2xl md:text-4xl font-extrabold text-slate-900">
              {examTitle || "Sınav"} — Sonuç
            </h1>
            <p className="mt-2 text-sm text-slate-600 font-semibold">
              Sınav ID: <span className="text-slate-900">{id}</span>
            </p>
          </div>

          <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl p-5 shadow-sm w-full md:w-[360px]">
            <div className="text-sm font-extrabold text-slate-700">Skor</div>
            <div className="mt-1 text-4xl font-extrabold text-slate-900">%{stats.score}</div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <StatPill
                icon={<CheckCircle2 className="w-4 h-4" />}
                label="Doğru"
                value={stats.correct}
                className="bg-emerald-50 text-emerald-700 border-emerald-200"
              />
              <StatPill
                icon={<XCircle className="w-4 h-4" />}
                label="Yanlış"
                value={stats.wrong}
                className="bg-rose-50 text-rose-700 border-rose-200"
              />
              <StatPill
                icon={<MinusCircle className="w-4 h-4" />}
                label="Boş"
                value={stats.empty}
                className="bg-slate-50 text-slate-700 border-slate-200"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            to="/student/exams"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-extrabold bg-white/70 border border-slate-900/10 hover:bg-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Sınavlara Dön
          </Link>

          <Link
            to={`/student/exam/${id}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-white
                       bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-105 transition
                       shadow-[0_14px_40px_rgba(16,185,129,0.18)]"
          >
            <RotateCcw className="w-5 h-5" />
            Tekrar Çöz
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {questions.map((q, idx) => {
            const userIdx = answers[idx];
            const correctIdx = getCorrectIndex(q);

            const isEmpty = userIdx === null || userIdx === undefined;
            const isCorrect = !isEmpty && correctIdx !== null && userIdx === correctIdx;

            const userLetter = isEmpty ? "Boş" : String.fromCharCode(65 + userIdx);
            const correctLetter =
              correctIdx === null ? "Girilmamış" : String.fromCharCode(65 + correctIdx);

            return (
              <div
                key={idx}
                className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-slate-600">
                      Soru {idx + 1}
                    </div>
                    <div className="mt-1 text-lg font-extrabold text-slate-900">
                      {q.question}
                    </div>
                  </div>

                  <div
                    className={[
                      "shrink-0 px-3 py-1 rounded-full border text-xs font-extrabold",
                      isEmpty
                        ? "bg-slate-50 text-slate-700 border-slate-200"
                        : isCorrect
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200",
                    ].join(" ")}
                  >
                    {isEmpty ? "Boş" : isCorrect ? "Doğru" : "Yanlış"}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-slate-900/10 bg-white/70 p-4">
                    <div className="font-extrabold text-slate-700 mb-1">Senin Cevabın</div>
                    <div className="text-slate-900 font-extrabold">{userLetter}</div>
                  </div>

                  <div className="rounded-2xl border border-slate-900/10 bg-white/70 p-4">
                    <div className="font-extrabold text-slate-700 mb-1">Doğru Cevap</div>
                    <div className="text-slate-900 font-extrabold">{correctLetter}</div>
                  </div>
                </div>

                {Array.isArray(q.options) && q.options.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => {
                      const isUser = userIdx === oi;
                      const isRight = correctIdx === oi;

                      return (
                        <div
                          key={oi}
                          className={[
                            "rounded-2xl border p-3 text-sm",
                            isRight
                              ? "border-emerald-300 bg-emerald-50"
                              : isUser
                              ? "border-rose-300 bg-rose-50"
                              : "border-slate-900/10 bg-white/60",
                          ].join(" ")}
                        >
                          <div className="font-extrabold text-slate-700 mb-1">
                            {String.fromCharCode(65 + oi)}
                            {isRight ? " (Doğru)" : isUser ? " (Sen)" : ""}
                          </div>
                          <div className="text-slate-800">{opt}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center text-xs text-slate-500 font-semibold">
          © 2025 EduAI Platform
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon, label, value, className }) {
  return (
    <div className={`rounded-2xl border px-3 py-2 ${className}`}>
      <div className="flex items-center gap-2">
        {icon}
        <div className="font-extrabold">{label}</div>
      </div>
      <div className="mt-1 text-lg font-extrabold">{value}</div>
    </div>
  );
}

export default ExamResult;
