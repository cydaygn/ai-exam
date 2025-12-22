import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Trash2,
  Eye,
  Award,
  Calendar,
  Brain,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../api';

function AdminStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      navigate("/admin/login");
      return;
    }

    const token = localStorage.getItem("adminToken");

 fetch(`${API_URL}/admin/students`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const normalized = (Array.isArray(data) ? data : []).map((s) => ({
          ...s,
          status: s.status || "active",
          avgScore: typeof s.avgScore === "number" ? s.avgScore : s.avgScore ?? 0,
          totalTests: typeof s.totalTests === "number" ? s.totalTests : s.totalTests ?? 0,
          lastTest: s.lastTest || s.last_test || null,
        }));
        setStudents(normalized);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Öğrenciler yüklenirken hata:", err);
        setLoading(false);
      });
  }, [navigate]);

  const filteredStudents = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return students;

    return students.filter((student) => {
      const name = (student.name || "").toLowerCase();
      const email = (student.email || "").toLowerCase();
      return name.includes(t) || email.includes(t);
    });
  }, [students, searchTerm]);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetails(true);
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm("Bu öğrenciyi silmek istediğinizden emin misiniz?")) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const getScorePill = (scoreRaw) => {
    const score = Number(scoreRaw || 0);
    if (score >= 85) return "text-emerald-700 bg-emerald-100 border-emerald-200";
    if (score >= 70) return "text-cyan-700 bg-cyan-100 border-cyan-200";
    if (score >= 50) return "text-orange-700 bg-orange-100 border-orange-200";
    return "text-red-700 bg-red-100 border-red-200";
  };

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === "active").length;

  const avgScore =
    students.length > 0
      ? Math.round(students.reduce((acc, s) => acc + Number(s.avgScore || 0), 0) / students.length)
      : 0;

  const totalTests = students.reduce((acc, s) => acc + Number(s.totalTests || 0), 0);

  return (
   <div className="w-full min-h-[100dvh] bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative overflow-x-hidden">

      {/* background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-cyan-200/45 rounded-full blur-3xl" />
        <div className="absolute top-10 right-[-180px] w-[560px] h-[560px] bg-emerald-200/45 rounded-full blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-sky-200/35 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,.18)_1px,transparent_0)] [background-size:26px_26px]" />
      </div>

      {/* topbar */}
      <nav className="relative z-20 flex items-center justify-between px-8 md:px-12 py-5 bg-white/65 backdrop-blur-xl border-b border-slate-900/10">
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-md">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl md:text-2xl font-extrabold tracking-wide">
            Edu<span className="text-emerald-600">AI</span>
          </span>
        </div>

        <div className="text-sm font-semibold text-slate-600 hidden sm:block">
        </div>
      </nav>

      <main className="relative z-10 px-6 md:px-10 lg:px-16 py-10 md:py-12">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* header */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/60 px-4 py-2 text-sm text-slate-700 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Öğrenci yönetimi
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold">Öğrenciler</h1>
            <p className="text-slate-700 mt-1">Arama, görüntüleme ve liste takibi.</p>
          </div>

          {/* stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Toplam Öğrenci" value={totalStudents} />
            <StatCard title="Aktif Öğrenci" value={activeStudents} accent="emerald" />
            <StatCard title="Ortalama Puan" value={avgScore} accent="cyan" />
            <StatCard title="Toplam Sınav" value={totalTests} accent="sky" />
          </div>

          {/* search */}
          <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Öğrenci adı veya email ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-900/10 bg-white/70 outline-none
                           focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-300/20 transition"
              />
            </div>
          </div>

          {/* list */}
          <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-slate-600 font-semibold">Yükleniyor...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-10 text-center text-slate-600 font-semibold">Öğrenci bulunamadı</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/60 border-b border-slate-900/10">
                    <tr>
                      <Th>Öğrenci</Th>
                      <Th>Email</Th>
                      <Th className="text-center">Sınav Sayısı</Th>
                      <Th className="text-center">Ortalama</Th>
                      <Th className="text-center">Son Sınav</Th>
                      <Th className="text-center">İşlemler</Th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-900/10">
                    {filteredStudents.map((student) => {
                      const last = student.lastTest ? new Date(student.lastTest) : null;
                      const lastText =
                        last && !isNaN(last.getTime()) ? last.toLocaleDateString("tr-TR") : "-";

                      return (
                        <tr key={student.id} className="hover:bg-white/60 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-white flex items-center justify-center font-extrabold shadow-sm">
                                {(student.name?.charAt(0) || "?").toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate">
                                  {student.name || "-"}
                                </div>
                                <div className="text-xs text-slate-500 font-semibold">
                                  {student.status === "active" ? "Aktif" : student.status}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {student.email || "-"}
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                              <Award size={16} />
                              {Number(student.totalTests || 0)}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-extrabold border ${getScorePill(
                                student.avgScore
                              )}`}
                            >
                              {Number(student.avgScore || 0)}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                              <Calendar size={16} />
                              {lastText}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => handleViewDetails(student)}
                                className="p-2 rounded-2xl border border-slate-900/10 bg-white/70 hover:bg-white transition"
                                title="Detayları Gör"
                              >
                                <Eye size={18} className="text-cyan-700" />
                              </button>

                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                className="p-2 rounded-2xl border border-slate-900/10 bg-white/70 hover:bg-white transition"
                                title="Sil"
                              >
                                <Trash2 size={18} className="text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* modal */}
      {showDetails && selectedStudent && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-slate-900/10 rounded-3xl p-6 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {selectedStudent.name || "Öğrenci"}
                </h2>
                <p className="text-slate-600">{selectedStudent.email || "-"}</p>
              </div>

              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="p-2 rounded-2xl bg-white/70 border border-slate-900/10 hover:bg-white transition"
                title="Kapat"
              >
                <XIcon />
              </button>
            </div>

            <div className="space-y-3">
              <DetailRow label="Toplam Sınav" value={Number(selectedStudent.totalTests || 0)} />
              <DetailRow label="Ortalama Puan" value={Number(selectedStudent.avgScore || 0)} />
              <DetailRow
                label="Son Sınav"
                value={
                  selectedStudent.lastTest
                    ? new Date(selectedStudent.lastTest).toLocaleDateString("tr-TR")
                    : "-"
                }
              />
              <DetailRow
                label="Durum"
                value={
                  <span className="inline-flex px-3 py-1 rounded-full text-sm font-extrabold border border-emerald-200 bg-emerald-100 text-emerald-800">
                    {selectedStudent.status === "active" ? "Aktif" : selectedStudent.status}
                  </span>
                }
              />
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="mt-6 w-full px-6 py-3 rounded-2xl font-bold text-slate-900
                         bg-white/70 border border-slate-900/10 hover:bg-white transition"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- UI pieces ---------- */

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-6 py-3 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wide ${className}`}
    >
      {children}
    </th>
  );
}

function StatCard({ title, value, accent }) {
  const accentClass =
    accent === "emerald"
      ? "from-emerald-500 to-cyan-500"
      : accent === "cyan"
      ? "from-cyan-500 to-sky-500"
      : accent === "sky"
      ? "from-sky-500 to-cyan-500"
      : "from-slate-500 to-slate-600";

  return (
    <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl p-6 shadow-sm">
      <div className="text-slate-600 text-sm font-semibold mb-2">{title}</div>
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-3xl font-extrabold text-slate-900">{value}</div>
        <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${accentClass}`} />
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-900/10 bg-white/60 px-4 py-3">
      <span className="text-slate-600 font-semibold">{label}</span>
      <span className="text-slate-900 font-extrabold">{value}</span>
    </div>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default AdminStudents;
