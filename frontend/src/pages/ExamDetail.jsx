import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Flag, Sparkles, Brain, X } from "lucide-react";
import { API_BASE, API_URL } from '../api';
function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [examTitle, setExamTitle] = useState("");
  const [questions, setQuestions] = useState(null);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);

  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
fetch(`${API_URL}/exams/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.questions) {
          console.error("Veri gelmedi:", data);
          setQuestions([]);
          return;
        }

        setExamTitle(data.title || "Sınav");
        setQuestions(data.questions || []);
        setAnswers(new Array((data.questions || []).length).fill(null));
        setCurrent(0);
        setSelected(null);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setQuestions([]);
      });
  }, [id]);

  const total = questions?.length || 0;
  const question = questions?.[current];

  const progress = useMemo(() => {
    if (!total) return 0;
    const answered = answers.filter((a) => a !== null && a !== undefined).length;
    return Math.round((answered / total) * 100);
  }, [answers, total]);

  if (!questions) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 md:px-10 lg:px-16 py-12">
          <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl px-8 py-6 shadow-sm">
            <div className="text-slate-700 font-semibold">Yükleniyor...</div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (questions.length === 0) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 md:px-10 lg:px-16 py-12">
          <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl px-8 py-6 shadow-sm">
            <div className="text-slate-700 font-semibold">Bu sınavda soru yok.</div>
          </div>
        </div>
      </PageShell>
    );
  }

  const saveAnswer = () => {
    const updated = [...answers];
    updated[current] = selected;
    setAnswers(updated);
    return updated;
  };

  const handleNext = () => {
    const updated = saveAnswer();
    if (current < total - 1) {
      const nextIndex = current + 1;
      setCurrent(nextIndex);
      setSelected(updated[nextIndex]);
    }
  };

  const handlePrev = () => {
    if (current === 0) return;
    const updated = saveAnswer();
    const prevIndex = current - 1;
    setCurrent(prevIndex);
    setSelected(updated[prevIndex]);
  };

  const jumpTo = (idx) => {
    const updated = saveAnswer();
    setCurrent(idx);
    setSelected(updated[idx]);
  };

  const finishExam = () => {
    const updated = saveAnswer();
    navigate(`/student/exam/${id}/result`, {
      state: { answers: updated, questions, examTitle },
    });
  };

  return (
    <PageShell>
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 lg:px-16 py-10 md:py-12">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/60 px-4 py-2 text-sm text-slate-700 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Sınav çözümü
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900">
              {examTitle}
            </h1>

            <div className="mt-2 text-sm text-slate-600 font-semibold">
              Soru <span className="text-slate-900">{current + 1}</span> / {total}
            </div>
          </div>

          {/* progress */}
          <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl p-4 shadow-sm w-full md:w-[320px]">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-sm">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                İlerleme
              </div>
              <div className="text-sm font-extrabold text-slate-900">%{progress}</div>
            </div>
            <div className="h-2 rounded-full bg-slate-200/70 overflow-hidden border border-slate-900/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* question card */}
          <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-4">
              {question.question}
            </h2>

            {question.image_url && (
              <img
             src={`${API_BASE}${question.image_url}`}
                alt="Soru görseli"
                className="w-full max-h-[360px] object-contain rounded-3xl border border-slate-900/10 bg-white/60 mb-5"
              />
            )}

            <div className="space-y-3">
              {(question.options || []).map((opt, idx) => {
                const isActive = selected === idx;
                const isAnswered = answers[current] === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelected(idx)}
                    className={[
                      "w-full text-left p-4 rounded-3xl border transition shadow-sm",
                      isActive
                        ? "border-emerald-400/40 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                        : "border-slate-900/10 bg-white/70 hover:bg-white",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={[
                          "shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center font-extrabold border",
                          isActive
                            ? "bg-white/20 border-white/25 text-white"
                            : "bg-white border-slate-900/10 text-slate-900",
                        ].join(" ")}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>

                      <div className="flex-1 leading-relaxed text-sm md:text-base">
                        {opt}
                      </div>

                      {(isAnswered || isActive) && (
                        <div
                          className={[
                            "shrink-0 text-xs font-extrabold px-3 py-1 rounded-full border",
                            isActive
                              ? "border-white/25 bg-white/15 text-white"
                              : "border-emerald-200 bg-emerald-100 text-emerald-700",
                          ].join(" ")}
                        >
                          Seçili
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
              <button
                onClick={handlePrev}
                disabled={current === 0}
                className={[
                  "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition border",
                  current === 0
                    ? "opacity-50 cursor-not-allowed bg-white/60 border-slate-900/10 text-slate-600"
                    : "bg-white/70 border-slate-900/10 text-slate-900 hover:bg-white",
                ].join(" ")}
              >
                <ArrowLeft className="w-5 h-5" />
                Geri
              </button>

              <div className="flex flex-col sm:flex-row gap-3">
                {current < total - 1 ? (
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-white
                               bg-gradient-to-r from-emerald-500 to-cyan-500
                               shadow-[0_14px_40px_rgba(16,185,129,0.18)]
                               hover:brightness-105 transition"
                  >
                    İleri
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-white
                               bg-gradient-to-r from-rose-500 to-red-500
                               shadow-[0_14px_40px_rgba(244,63,94,0.18)]
                               hover:brightness-105 transition"
                  >
                    <Flag className="w-5 h-5" />
                    Sınavı Bitir
                  </button>
                )}

                {current < total - 1 && (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-white
                               bg-gradient-to-r from-rose-500 to-red-500
                               shadow-[0_14px_40px_rgba(244,63,94,0.18)]
                               hover:brightness-105 transition"
                  >
                    <Flag className="w-5 h-5" />
                    Bitir
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* side nav */}
          <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl p-6 shadow-sm">
            <div className="text-sm font-extrabold text-slate-900 mb-3">
              Sorular
            </div>

            <div className="grid grid-cols-7 lg:grid-cols-5 gap-2">
              {questions.map((_, idx) => {
                const answered = answers[idx] !== null && answers[idx] !== undefined;
                const isCurrent = idx === current;

                return (
                  <button
                    key={idx}
                    onClick={() => jumpTo(idx)}
                    className={[
                      "h-10 rounded-2xl border font-extrabold text-sm transition",
                      isCurrent
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-transparent"
                        : answered
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-white/70 text-slate-800 border-slate-900/10 hover:bg-white",
                    ].join(" ")}
                    title={answered ? "Cevaplandı" : "Boş"}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 text-xs text-slate-600 space-y-1">
              <div>
                <span className="inline-block w-3 h-3 rounded bg-emerald-200 mr-2 align-middle" />
                Cevaplandı
              </div>
              <div>
                <span className="inline-block w-3 h-3 rounded bg-white border border-slate-900/10 mr-2 align-middle" />
                Boş
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* confirm modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-slate-900/10 rounded-3xl p-6 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-xl font-extrabold text-slate-900">
                Sınavı bitirmek istiyor musun?
              </h2>
              <button
                className="p-2 rounded-2xl bg-white/70 border border-slate-900/10 hover:bg-white transition"
                onClick={() => setShowConfirm(false)}
                aria-label="Kapat"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-5">
              Bitirince sonuç ekranına geçeceksin.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 rounded-2xl font-bold text-slate-900
                           bg-white/70 border border-slate-900/10 hover:bg-white transition"
              >
                Hayır
              </button>

              <button
                onClick={finishExam}
                className="flex-1 px-4 py-3 rounded-2xl font-extrabold text-white
                           bg-gradient-to-r from-rose-500 to-red-500
                           shadow-[0_14px_40px_rgba(244,63,94,0.18)]
                           hover:brightness-105 transition"
              >
                Evet, Bitir
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function PageShell({ children }) {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-cyan-200/45 rounded-full blur-3xl" />
        <div className="absolute top-10 right-[-180px] w-[560px] h-[560px] bg-emerald-200/45 rounded-full blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-sky-200/35 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,.18)_1px,transparent_0)] [background-size:26px_26px]" />
      </div>
      {children}
    </div>
  );
}

export default ExamDetail;
