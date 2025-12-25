import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, CheckCircle, Zap, Trophy, Calendar, Crown, Sparkles, Brain } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { API_URL } from "../api";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);

  const formatName = (name = "") =>
    name
      .trim()
      .toLocaleLowerCase("tr-TR")
      .replace(/\s+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1))
      .join(" ");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    if (!userData) {
      navigate("/login");
      return;
    }

    setUser(userData);

    fetch(`${API_URL}/user/${userData.id}`)
      .then((res) => res.json())
    .then((data) => {
  setStats(data);

  // plan vb. güncel bilgiyi backend'den al
  const mergedUser = { ...userData, plan: data.plan || userData.plan || "free" };
  setUser(mergedUser);
  localStorage.setItem("user", JSON.stringify(mergedUser));
})

      .catch(() =>
        setStats({
          weekly_scores: [],
          average_score: 0,
          total_tests: 0,
        })
      );
  }, [navigate]);

  const chartData = useMemo(() => {
    const weekly = stats?.weekly_scores || [];
    const weeklyData = weekly.map((w) => Number(w.score || 0)).reverse();

    const allLabels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    const weeklyLabels = allLabels.slice(-weeklyData.length);

    return {
      labels: weeklyLabels,
      datasets: [
        {
          label: "Başarı Oranı (%)",
          data: weeklyData,
          borderColor: "#10b981",
          backgroundColor: "rgba(16,185,129,0.18)",
          borderWidth: 3,
          pointBackgroundColor: "#06b6d4",
          pointBorderColor: "#10b981",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.4,
        },
      ],
    };
  }, [stats]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(15,23,42,0.9)",
          padding: 12,
          titleFont: { size: 14, weight: "bold" },
          bodyFont: { size: 13 },
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "rgba(15,23,42,0.6)",
            font: { size: 12, weight: "600" },
          },
        },
        y: {
          min: 0,
          max: 100,
          grid: {
            color: "rgba(15,23,42,0.06)",
            drawBorder: false,
          },
          ticks: {
            color: "rgba(15,23,42,0.6)",
            font: { size: 12, weight: "600" },
            callback: (value) => value + "%",
          },
        },
      },
    };
  }, []);

  const getMotivationMessage = () => {
    const avg = stats?.average_score || 0;
    if (avg >= 80) return { text: "Harika gidiyorsun! 🔥", color: "text-emerald-700" };
    if (avg >= 60) return { text: "İyi ilerleme! Devam et 💪", color: "text-cyan-700" };
    if (avg >= 40) return { text: "Çalışman karşılığını veriyor 📈", color: "text-blue-700" };
    if (avg > 0) return { text: "Başlangıç güzel, hızlan! 🚀", color: "text-purple-700" };
    return { text: "Haydi ilk sınavına başla! 🎯", color: "text-slate-700" };
  };

  const motivation = getMotivationMessage();

  if (!stats || !user) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-cyan-200/45 rounded-full blur-3xl" />
          <div className="absolute top-10 right-[-180px] w-[560px] h-[560px] bg-emerald-200/45 rounded-full blur-3xl" />
          <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-sky-200/35 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl px-8 py-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-slate-700 font-semibold">Yükleniyor...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-cyan-200/45 rounded-full blur-3xl" />
        <div className="absolute top-10 right-[-180px] w-[560px] h-[560px] bg-emerald-200/45 rounded-full blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-sky-200/35 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,.18)_1px,transparent_0)] [background-size:26px_26px]" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                Merhaba, {formatName(user.name) || "Öğrenci"} 👋
              </h1>

              <p className={`text-lg sm:text-xl font-semibold mt-2 ${motivation.color}`}>
                {motivation.text}
              </p>
            </div>

            {/* Bugünün Tarihi */}
            <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-2xl px-5 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar size={18} />
                <span className="font-semibold text-sm">
                  {new Date().toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 🚀 UPGRADE BANNER - Sadece free kullanıcılara göster */}
        {(user?.plan || "free") === "free" && (
          <div className="mb-8 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            {/* Animated background effect */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse" />
              <div className="absolute bottom-0 -right-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>
            
            <div className="relative z-10 flex items-start justify-between gap-4 flex-col md:flex-row">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-7 h-7 text-white" />
                  <h3 className="text-2xl font-extrabold text-white">
                    AI Destekli Öğrenmeye Geç! 🚀
                  </h3>
                </div>
                <p className="text-white/95 text-sm md:text-base leading-relaxed mb-4">
                  Yapay zeka ile soru analizi, akıllı öneriler ve kişiselleştirilmiş öğrenme deneyimi seni bekliyor.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Analiz
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
                    <Zap className="w-3.5 h-3.5" />
                    Akıllı Öneriler
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
                    <Brain className="w-3.5 h-3.5" />
                    Kişisel Öğrenme
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => navigate("/student/pricing")}
                className="shrink-0 px-6 py-3 rounded-2xl font-extrabold bg-white text-orange-600 hover:bg-gray-50 hover:scale-105 transition-all shadow-xl"
              >
                Planları Gör
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions - Büyük Butonlar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <QuickActionCard
            icon={<Trophy className="w-6 h-6" />}
            title="Başarılarım"
            desc="Geçmiş sınavlar"
            gradient="from-purple-500 via-pink-500 to-rose-500"
            onClick={() => navigate("/student/performance")}
          />

          <QuickActionCard
            icon={<Zap className="w-6 h-6" />}
            title="Hızlı Devam"
            desc="Kaldığın yerden"
            gradient="from-orange-500 via-amber-500 to-yellow-500"
            onClick={() => {
              if (stats?.last_exam_id) navigate(`/student/exam/${stats.last_exam_id}`);
              else navigate("/student/exams");
            }}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Ortalama Başarı"
            value={`%${stats.average_score || 0}`}
            gradient="from-emerald-500 to-teal-500"
          />

          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Son Sınav"
            value={stats.last_test_name || "-"}
            gradient="from-purple-500 to-pink-500"
          />
        </div>

        {/* ✅ Özet Kartı */}
        <div className="mt-6 bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-900">Bugünkü hedef</p>
              <p className="text-xs text-slate-600 mt-1">
                1 test çöz ve performansını güncelle.
              </p>
            </div>

            <button
              onClick={() => navigate("/student/exams")}
              className="shrink-0 px-4 py-2 rounded-2xl font-extrabold text-white
                         bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-105 transition
                         shadow-[0_14px_40px_rgba(16,185,129,0.18)]"
            >
              Teste Başla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========== Components ========== */

function QuickActionCard({ icon, title, desc, gradient, onClick, featured }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden text-left rounded-3xl p-6 shadow-sm
        hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group
        ${featured ? "bg-gradient-to-br " + gradient + " text-white" : "bg-white/65 backdrop-blur-xl border border-slate-900/10"}
      `}
    >
      <div
        className={`
          inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4
          group-hover:scale-110 transition-transform duration-300
          ${featured ? "bg-white/20 backdrop-blur" : "bg-gradient-to-br " + gradient}
        `}
      >
        <div className="text-white">{icon}</div>
      </div>

      <h3 className={`text-lg font-extrabold ${featured ? "text-white" : "text-slate-900"}`}>
        {title}
      </h3>
      <p className={`text-sm mt-1 ${featured ? "text-white/80" : "text-slate-600"}`}>
        {desc}
      </p>

      {featured && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        </div>
      )}
    </button>
  );
}

function StatCard({ icon, label, value, gradient }) {
  return (
    <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
            {label}
          </p>
          <p className="font-extrabold text-slate-900 text-2xl leading-tight">
            {value}
          </p>
        </div>

        <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;