import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Users,
  FileText,
  CheckCircle,
  TrendingUp,
  Calendar,
  Award,
  Activity,
  BarChart3,
  Brain,
  Sparkles,
  LogOut,
} from "lucide-react";
import { API_URL } from '../api';
function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExams: 0,
    totalQuestions: 0,
    totalTests: 0,
    averageScore: 0,
    recentTests: [],
    topStudents: [],
    examStats: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      navigate("/admin/login");
      return;
    }
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
        },
      });
      setStats(res.data);
    } catch (error) {
      console.error("İstatistikler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const adminName = JSON.parse(localStorage.getItem("admin") || "{}").name || "Admin";

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-cyan-200/45 rounded-full blur-3xl" />
          <div className="absolute top-10 right-[-180px] w-[560px] h-[560px] bg-emerald-200/45 rounded-full blur-3xl" />
          <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-sky-200/35 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,.18)_1px,transparent_0)] [background-size:26px_26px]" />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl px-8 py-6 shadow-sm">
            <div className="text-slate-700 font-semibold">Yükleniyor...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative overflow-hidden">
      {/* Arka plan glow + grid */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-cyan-200/45 rounded-full blur-3xl" />
        <div className="absolute top-10 right-[-180px] w-[560px] h-[560px] bg-emerald-200/45 rounded-full blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-sky-200/35 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,.18)_1px,transparent_0)] [background-size:26px_26px]" />
      </div>

      {/* Üst bar */}
     <nav className="relative z-20 px-8 md:px-12 py-5 bg-white/65 backdrop-blur-xl border-b border-slate-900/10">
  {/* ORTA LOGO */}
  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-md">
      <Brain className="w-6 h-6 text-white" />
    </div>
    <div className="text-xl md:text-2xl font-extrabold tracking-wide">
      Edu<span className="text-emerald-600">AI</span>
    </div>
  </div>

  {/* SAĞ BUTON */}
  <div className="flex justify-end">
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm md:text-base font-bold text-white
                 bg-gradient-to-r from-emerald-500 to-cyan-500
                 shadow-[0_10px_30px_rgba(6,182,212,0.25)]
                 hover:brightness-105 transition"
    >
      <LogOut className="w-4 h-4" />
      Çıkış
    </button>
  </div>
</nav>


      <main className="relative z-10 px-6 md:px-10 lg:px-16 py-10 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Başlık */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/60 px-4 py-2 text-sm text-slate-700 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Sistemin genel durumu
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1">
              Hoş geldin, {adminName}!
            </h1>
            <p className="text-slate-700">
              Toplam istatistikler, son aktiviteler ve sınav performansları.
            </p>
          </div>

          {/* KPI Kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Toplam Kullanıcı"
              value={stats.totalUsers}
              hint="Aktif öğrenciler"
              icon={<Users className="w-6 h-6 text-white" />}
              pill="from-emerald-500 to-cyan-500"
            />

            <StatCard
              title="Toplam Sınav"
              value={stats.totalExams}
              hint="Sistemde mevcut"
              icon={<FileText className="w-6 h-6 text-white" />}
              pill="from-cyan-500 to-sky-500"
            />

            <StatCard
              title="Toplam Soru"
              value={stats.totalQuestions}
              hint="Soru havuzunda"
              icon={<CheckCircle className="w-6 h-6 text-white" />}
              pill="from-emerald-500 to-emerald-400"
            />

            <StatCard
              title="Ortalama Başarı"
              value={`%${stats.averageScore}`}
              hint="Genel ortalama"
              icon={<Award className="w-6 h-6 text-white" />}
              pill="from-amber-500 to-orange-500"
            />
          </div>

          {/* Son Testler + En başarılı öğrenciler */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <GlassCard title="Son Testler" icon={<Calendar className="text-slate-400" size={22} />}>
              {stats.recentTests.length === 0 ? (
                <EmptyState text="Henüz test yapılmamış" />
              ) : (
                <div className="space-y-3">
                  {stats.recentTests.slice(0, 3).map((test, i) => (
                    <div
                      key={i}
                      className="flex justify-between gap-4 p-3 rounded-2xl bg-white/60 border border-slate-900/10"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold
                                        bg-gradient-to-br from-emerald-400 to-cyan-400 text-white shadow-sm"
                        >
                          {(test.user_name?.charAt(0) || "?").toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{test.user_name}</p>
                          <p className="text-sm text-slate-600 truncate">{test.exam_name}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={`font-extrabold ${
                            test.score >= 70
                              ? "text-emerald-600"
                              : test.score >= 50
                              ? "text-orange-600"
                              : "text-red-600"
                          }`}
                        >
                          %{test.score}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(test.created_at).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            <GlassCard title="En Başarılı Öğrenciler" icon={<Award className="text-slate-400" size={22} />}>
              {stats.topStudents.length === 0 ? (
                <EmptyState text="Henüz veri yok" />
              ) : (
                <div className="space-y-3">
                  {stats.topStudents.map((s, i) => (
                    <div
                      key={i}
                      className="flex justify-between gap-4 p-3 rounded-2xl bg-white/60 border border-slate-900/10"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold shadow-sm ${
                            i === 0
                              ? "bg-gradient-to-br from-amber-400 to-orange-500"
                              : i === 1
                              ? "bg-gradient-to-br from-slate-400 to-slate-500"
                              : i === 2
                              ? "bg-gradient-to-br from-orange-500 to-amber-600"
                              : "bg-gradient-to-br from-cyan-500 to-sky-500"
                          }`}
                        >
                          {i + 1}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{s.name}</p>
                          <p className="text-sm text-slate-600">{s.test_count} test</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-emerald-600 font-extrabold">%{s.avg_score}</p>
                        <p className="text-xs text-slate-500">Ortalama</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Sınav İstatistikleri */}
          <GlassCard title="Sınav İstatistikleri" icon={<BarChart3 className="text-slate-400" size={22} />}>
            {stats.examStats.length === 0 ? (
              <EmptyState text="Henüz sınav verisi yok" />
            ) : (
              <div className="space-y-4">
                {stats.examStats.map((ex, i) => {
                  const score = Number(ex.avg_score || 0);
                  const barClass =
                    score >= 70
                      ? "from-emerald-500 to-cyan-500"
                      : score >= 50
                      ? "from-orange-500 to-amber-500"
                      : "from-red-500 to-rose-500";

                  return (
                    <div key={i} className="pb-4 border-b border-slate-900/10 last:border-b-0">
                      <div className="flex justify-between items-center mb-2 gap-4">
                        <h3 className="font-bold text-slate-900 truncate">{ex.exam_name}</h3>
                        <span className="text-sm text-slate-600 shrink-0 inline-flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          {ex.test_count} kez çözüldü
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-slate-200/70 rounded-full overflow-hidden border border-slate-900/10">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${barClass}`}
                            style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
                          />
                        </div>

                        <span className="font-extrabold min-w-[56px] text-right text-slate-900">
                          %{score}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, hint, icon, pill }) {
  return (
    <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-600 font-semibold">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1 truncate">{value}</h3>
        </div>

        <div className={`shrink-0 p-3 rounded-2xl bg-gradient-to-br ${pill} shadow-sm`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-600 inline-flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        {hint}
      </div>
    </div>
  );
}

function GlassCard({ title, icon, children }) {
  return (
    <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-extrabold text-slate-900">{title}</h2>
        {icon}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-center py-8">
      <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-white/70 border border-slate-900/10 flex items-center justify-center">
        <BarChart3 className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-slate-600 font-semibold">{text}</p>
    </div>
  );
}

export default AdminDashboard;
