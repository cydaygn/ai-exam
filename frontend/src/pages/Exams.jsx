import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Clock, Sparkles, Brain, TrendingUp, Award } from "lucide-react";
import { API_URL } from '../api';
function Exams() {
  const [exams, setExams] = useState([]);
  const location = useLocation();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const examType = params.get("type");

  function getExamStyle(type) {
    // LandingPage paleti: slate + emerald + cyan + sky + amber
    switch (type) {
      case "yks":
        return {
          emoji: "📘",
          badgeText: "YKS",
          badgeIcon: <TrendingUp className="w-4 h-4 text-cyan-600" />,
          // kart cam görünümü + hafif renk tonu
          card:
            "bg-white/65 backdrop-blur-xl border border-slate-900/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition",
          // başlık rengi (gradient)
          title:
            "bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent",
          // buton gradient
          button:
         "bg-gradient-to-r from-indigo-700 to-sky-400 shadow-[0_14px_40px_rgba(67,56,202,0.28)]"

        };
      case "ales":
        return {
          emoji: "📗",
          badgeText: "ALES",
          badgeIcon: <Sparkles className="w-4 h-4 text-emerald-600" />,
          card:
            "bg-white/65 backdrop-blur-xl border border-slate-900/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition",
          title:
            "bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent",
          button:
   "bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_14px_40px_rgba(16,185,129,0.34)]"
        };
      case "kpss":
        return {
          emoji: "📙",
          badgeText: "KPSS",
          badgeIcon: <Award className="w-4 h-4 text-amber-500" />,
          card:
            "bg-white/65 backdrop-blur-xl border border-slate-900/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition",
        title:
  "bg-gradient-to-r from-red-600 to-rose-700 bg-clip-text text-transparent",
     button:
      "bg-gradient-to-r from-red-600 to-rose-800 shadow-[0_14px_40px_rgba(159,18,57,0.36)]"

        };
      default:
        return {
          emoji: "📄",
          badgeText: "Tümü",
          badgeIcon: <Brain className="w-4 h-4 text-slate-600" />,
          card:
            "bg-white/65 backdrop-blur-xl border border-slate-900/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition",
          title: "text-slate-900",
          button:
            "bg-gradient-to-r from-slate-700 to-slate-900 shadow-[0_14px_40px_rgba(15,23,42,0.18)]",
        };
    }
  }

  useEffect(() => {
  let url = `${API_URL}/exams`;
if (examType) url = `${API_URL}/exams/type/${examType}`; fetch(url)
      .then((res) => res.json())
      .then((data) => setExams(data))
      .catch((err) => console.error("Exams fetch error:", err));
  }, [examType]);

  // aktif filtreye göre üst kısım stil
  const activeStyle = getExamStyle(examType || "all");

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative overflow-hidden">
      {/* Arka plan soft glow + hafif grid (Landing ile aynı) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-cyan-200/45 rounded-full blur-3xl" />
        <div className="absolute top-10 right-[-180px] w-[560px] h-[560px] bg-emerald-200/45 rounded-full blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-sky-200/35 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,.18)_1px,transparent_0)] [background-size:26px_26px]" />
      </div>

      {/* Üst başlık alanı */}
      <div className="relative z-10 px-6 md:px-10 lg:px-16 pt-10 pb-6">
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
          <span className={activeStyle.title}>
            Sınavlarım
          </span>
        </h1>

        <p className="text-slate-700 mt-3 max-w-2xl">
          Filtre seç, denemelerini görüntüle ve tek tıkla başla.
        </p>
      </div>

      {/* Filtre butonları */}
      <div className="relative z-10 px-6 md:px-10 lg:px-16 pb-8">
        <div className="flex flex-wrap gap-3">
            <FilterPill to="/student/exams?type=yks" active={examType === "yks"}>
              YKS
            </FilterPill>

            <FilterPill to="/student/exams?type=ales" active={examType === "ales"}>
              ALES
            </FilterPill>

            <FilterPill to="/student/exams?type=kpss" active={examType === "kpss"}>
              KPSS
            </FilterPill>

            <FilterPill to="/student/exams" active={!examType}>
              Hepsi
            </FilterPill>
          </div>
      </div>

      {/* Kartlar */}
      <div className="relative z-10 px-6 md:px-10 lg:px-16 pb-14">
          {exams.length === 0 ? (
            <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-2xl p-10 text-center shadow-sm">
              <div className="text-3xl mb-3">🗂️</div>
              <h2 className="text-xl font-bold mb-2">Henüz sınav yok</h2>
              <p className="text-slate-700">
                Bu filtrede listelenecek sınav bulunamadı.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {exams.map((exam) => {
                const st = getExamStyle(exam.exam_type);

                return (
                  <div key={exam.id} className={`rounded-2xl p-7 ${st.card}`}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <h2 className="text-xl md:text-2xl font-extrabold break-words">
                          <span className="mr-2">{st.emoji}</span>
                          <span className={st.title}>{exam.title}</span>
                        </h2>

                        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/60 px-3 py-1 text-xs text-slate-700">
                          {st.badgeIcon}
                          {st.badgeText}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 text-sm mb-6">
                      <Clock size={16} />
                      {new Date(exam.created_at).toLocaleDateString()}
                    </div>

                    <Link
                      to={`/student/exam/${exam.id}`}
                      className={`group mt-auto w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl
                                  text-white font-bold hover:brightness-105 transition ${st.button}`}
                    >
                      Başla
                      <span className="inline-block transition group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}

function FilterPill({ to, active, children }) {
  return (
    <Link
      to={to}
      className={[
        "px-5 py-2 rounded-xl border text-sm md:text-base transition",
        active
          ? "bg-white/80 backdrop-blur-xl border-slate-900/15 shadow-sm font-bold"
          : "bg-white/60 backdrop-blur-xl border-slate-900/10 text-slate-700 hover:bg-white",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export default Exams;
