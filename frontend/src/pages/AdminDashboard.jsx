import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  FileText,
  CheckCircle,
  TrendingUp,
  Calendar,
  Award,
  Activity,
  BarChart3
} from "lucide-react";

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
    examStats: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      navigate("/admin/login");
      return;
    }

    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/dashboard/stats");
      setStats(res.data);
      setLoading(false);
    } catch (error) {
      console.error("İstatistikler yüklenemedi:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  const adminName = JSON.parse(localStorage.getItem("admin") || "{}").name || "Admin";

  return (
    <div className="w-full min-h-screen px-4 py-6 sm:px-6 lg:px-8 bg-gray-100">
      {/* Üst Başlık */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-1">
          Hoş geldin, {adminName}!
        </h1>
        <p className="text-gray-600">Sistemin genel durumu</p>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Kartlar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <div className="bg-blue-600 text-white p-5 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm text-blue-100">Toplam Kullanıcılar</p>
                <h3 className="text-3xl font-bold">{stats.totalUsers}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Users size={32} />
              </div>
            </div>
            <span className="flex items-center text-blue-100 text-sm">
              <TrendingUp size={14} className="mr-1" />
              Aktif öğrenciler
            </span>
          </div>

          <div className="bg-purple-600 text-white p-5 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm text-purple-100">Toplam Sınavlar</p>
                <h3 className="text-3xl font-bold">{stats.totalExams}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FileText size={32} />
              </div>
            </div>
            <span className="flex items-center text-purple-100 text-sm">
              <Activity size={14} className="mr-1" />
              Sistemde mevcut
            </span>
          </div>

          <div className="bg-green-600 text-white p-5 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm text-green-100">Toplam Sorular</p>
                <h3 className="text-3xl font-bold">{stats.totalQuestions}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <CheckCircle size={32} />
              </div>
            </div>
            <span className="flex items-center text-green-100 text-sm">
              <BarChart3 size={14} className="mr-1" />
              Soru havuzunda
            </span>
          </div>

          <div className="bg-orange-600 text-white p-5 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm text-orange-100">Ortalama Başarı</p>
                <h3 className="text-3xl font-bold">%{stats.averageScore}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Award size={32} />
              </div>
            </div>
            <span className="flex items-center text-orange-100 text-sm">
              <TrendingUp size={14} className="mr-1" />
              Genel ortalama
            </span>
          </div>

        </div>

        {/* Son Testler / En başarılı öğrenciler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Son Testler */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Son Testler</h2>
              <Calendar className="text-gray-400" size={24} />
            </div>

            {stats.recentTests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Henüz test yapılmamış</p>
            ) : (
              <div className="space-y-3">
                {stats.recentTests.slice(0,3).map((test, i) => (
                  <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
                        {test.user_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{test.user_name}</p>
                        <p className="text-sm text-gray-500">{test.exam_name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          test.score >= 70
                            ? "text-green-600"
                            : test.score >= 50
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      >
                        %{test.score}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(test.created_at).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* En Başarılı Öğrenciler */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">En Başarılı Öğrenciler</h2>
              <Award className="text-gray-400" size={24} />
            </div>

            {stats.topStudents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Henüz veri yok</p>
            ) : (
              <div className="space-y-3">
                {stats.topStudents.map((s, i) => (
                  <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          i === 0
                            ? "bg-yellow-500"
                            : i === 1
                            ? "bg-gray-400"
                            : i === 2
                            ? "bg-orange-600"
                            : "bg-blue-500"
                        }`}
                      >
                        {i + 1}
                      </div>

                      <div>
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-sm text-gray-500">{s.test_count} test</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-green-600 font-bold">%{s.avg_score}</p>
                      <p className="text-xs text-gray-500">Ortalama</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sınav İstatistikleri */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Sınav İstatistikleri</h2>

          {stats.examStats.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Henüz sınav verisi yok</p>
          ) : (
            <div className="space-y-4">
              {stats.examStats.map((ex, i) => (
                <div key={i} className="pb-4 border-b last:border-b-0">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-semibold">{ex.exam_name}</h3>
                    <span className="text-sm text-gray-500">{ex.test_count} kez çözüldü</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          ex.avg_score >= 70
                            ? "bg-green-500"
                            : ex.avg_score >= 50
                            ? "bg-orange-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${ex.avg_score}%` }}
                      ></div>
                    </div>

                    <span className="font-bold min-w-[50px] text-right">
                      %{ex.avg_score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
