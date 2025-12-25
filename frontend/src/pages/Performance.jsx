import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, BarChart2, AlertTriangle, CheckCircle, Sparkles } from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { API_URL } from '../api';
ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

function Performance() {
  const navigate = useNavigate();
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetch(`${API_URL}/user/performance/${user.id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((d) => {
        if (d && typeof d === 'object') {
          setData(d);
        } else {
          console.error("Performance data format hatası:", d);
          setData({
            total_tests: 0,
            average_score: 0,
            weekly_scores: [],
            topic_performance: []
          });
        }
      })
      .catch((e) => {
        console.error("Performance fetch error:", e);
        setData({
          total_tests: 0,
          average_score: 0,
          weekly_scores: [],
          topic_performance: []
        });
      });
  }, [navigate, user]);

  if (!data) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-cyan-200/45 rounded-full blur-3xl" />
          <div className="absolute top-10 right-[-180px] w-[560px] h-[560px] bg-emerald-200/45 rounded-full blur-3xl" />
          <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-sky-200/35 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,.18)_1px,transparent_0)] [background-size:26px_26px]" />
        </div>

        <div className="relative z-10 px-6 md:px-10 lg:px-16 pt-14 pb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/60 px-4 py-2 text-sm text-slate-700 mb-6">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Performans verileri hazırlanıyor
          </div>

          <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-2xl p-10 shadow-sm">
            <p className="text-center text-slate-700">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }
const weeklyScores = data.weekly_scores || [];
const weeklyData = weeklyScores
  .map((w) => Number(w.score) || 0)
  .reverse();

const weeklyMax = Math.max(10, ...weeklyData);
  const weeklyLabels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].slice(
    -weeklyData.length
  );
  const lineData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: "Başarı (%)",
        data: weeklyData,
        borderColor: "#0ea5e9", 
        backgroundColor: "rgba(14,165,233,0.18)",
        borderWidth: 3,
        pointBackgroundColor: "#0ea5e9",
        pointBorderColor: "#0ea5e9",
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
    },
    scales: {
 y: {
  min: 0,
  suggestedMax: Math.min(100, weeklyMax + 10),
  ticks: { stepSize: weeklyMax <= 20 ? 5 : 20 },
  grid: { color: "rgba(15,23,42,0.08)" },
},

      x: {
        grid: { color: "rgba(15,23,42,0.06)" },
      },
    },
  };

  // ------------------------------------------------------
  // TOPIC PERFORMANCE
  // ------------------------------------------------------
  const topicPerf = data.topic_performance || [];
const barMax = Math.max(10, ...(topicPerf.map((t) => Number(t.topic_score) || 0)));

  const barData = {
    labels: topicPerf.map((t) => t.topic || "—"),
    datasets: [
      {
        label: "Başarı (%)",
            data: topicPerf.map((t) => Number(t.topic_score) || 0),
        backgroundColor: [
          "rgba(16,185,129,0.85)", 
          "rgba(6,182,212,0.85)",  
          "rgba(14,165,233,0.85)", 
          "rgba(245,158,11,0.85)", 
          "rgba(100,116,139,0.85)" 
        ],
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
 y: {
  min: 0,
  suggestedMax: Math.min(100, barMax + 10),
  ticks: { stepSize: barMax <= 20 ? 5 : 20 },
  grid: { color: "rgba(15,23,42,0.08)" },
},

      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
  };

  const weakTopics = topicPerf
    .filter((t) => (t.topic_score || 0) < 60)
    .map((t) => t.topic);

  const strongTopics = topicPerf
    .filter((t) => (t.topic_score || 0) >= 80)
    .map((t) => t.topic);

  const averageScore = Number(data.average_score || 0);
  const totalTests = Number(data.total_tests || 0);
  const dailyGoal = 85;

  const goalDelta = averageScore - dailyGoal;
  const goalText =
    goalDelta >= 0 ? `Hedefin üzerindesin (+${goalDelta} puan)` : `Hedefin altındasın (${goalDelta} puan)`;

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative overflow-hidden">

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-cyan-200/45 rounded-full blur-3xl" />
        <div className="absolute top-10 right-[-180px] w-[560px] h-[560px] bg-emerald-200/45 rounded-full blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-sky-200/35 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,.18)_1px,transparent_0)] [background-size:26px_26px]" />
      </div>
      <div className="relative z-10 px-6 md:px-10 lg:px-16 pt-10 pb-14">
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3">
          <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Performans Analizi
          </span>
        </h1>
        <p className="text-slate-700 max-w-2xl mb-10">
          Haftalık başarı trendi, konu bazlı skorlar ve güçlü/zayıf alanların.
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard
              title="Genel Başarı"
              value={`%${averageScore}`}
              subtitle={goalText}
              icon={<TrendingUp className="w-7 h-7 text-emerald-600" />}
              accent="from-emerald-500 to-cyan-500"
            />

            <StatCard
              title="Tamamlanan Test"
              value={`${totalTests}`}
              subtitle="Toplam çözülen deneme"
              icon={<CheckCircle className="w-7 h-7 text-cyan-600" />}
              accent="from-cyan-500 to-sky-500"
            />

            <StatCard
              title="Günlük Hedef"
              value={`${dailyGoal}%`}
              subtitle="Sabit hedef değeri"
              icon={<BarChart2 className="w-7 h-7 text-sky-600" />}
              accent="from-sky-500 to-emerald-500"
            />
          </div>

         

            <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-2xl p-6 md:p-7 shadow-sm">
              <h2 className="text-xl md:text-2xl font-extrabold mb-4">
                Sınav Bazlı Performans
              </h2>
              <div className="h-[320px] md:h-[360px]">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-2xl p-6 md:p-7 shadow-sm">
              <h2 className="text-xl md:text-2xl font-extrabold mb-4">
                Haftalık Başarı Grafiği
              </h2>
              <div className="h-[320px] md:h-[360px]">
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>
          {/* Topics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-2xl p-6 md:p-7 shadow-sm">
              <h2 className="text-xl md:text-2xl font-extrabold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                Zayıf Konular
              </h2>

              {weakTopics.length === 0 ? (
                <p className="text-slate-700">Zayıf konu yok</p>
              ) : (
                <div className="space-y-3">
                  {weakTopics.map((t, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-900/10 bg-white/60 px-4 py-3 text-slate-800"
                    >
                      {t}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-2xl p-6 md:p-7 shadow-sm">
              <h2 className="text-xl md:text-2xl font-extrabold mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                Güçlü Konular
              </h2>

              {strongTopics.length === 0 ? (
                <p className="text-slate-700">Henüz güçlü konu yok</p>
              ) : (
                <div className="space-y-3">
                  {strongTopics.map((t, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-900/10 bg-white/60 px-4 py-3 text-slate-800"
                    >
                      {t}
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, accent }) {
  return (
    <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-slate-700 text-sm font-semibold">{title}</h3>
          <p className="text-4xl md:text-5xl font-extrabold mt-2">{value}</p>
        </div>

        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-sm`}
        >
          <div className="text-white">{icon}</div>
        </div>
      </div>

      <p className="text-slate-600 text-sm">{subtitle}</p>
    </div>
  );
}

export default Performance;
