import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, CheckCircle, FileText } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login");
      return;
    }

    fetch(`http://localhost:5000/api/user/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      })
      .catch(() => setStats({}));
  }, []);

  if (!stats) return <p className="text-center mt-10">Yükleniyor...</p>;

  const weekly = stats.weekly_scores || [];
  const weeklyData = weekly.map(w => w.score).reverse();

  const weeklyLabels = ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"]
    .slice(-weeklyData.length);

  const chartData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: "Başarı Oranı (%)",
        data: weeklyData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.2)",
        borderWidth: 3,
        pointBackgroundColor: "#3b82f6",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Ana Sayfa</h1>

      {/* SINAV TÜRÜ SEÇİMİ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        <button
          onClick={() => navigate("/student/exams?type=yks")}
          className="p-6 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 text-center"
        >
          YKS Sınavları
        </button>

        <button
          onClick={() => navigate("/student/exams?type=ales")}
          className="p-6 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 text-center"
        >
          ALES Sınavları
        </button>

        <button
          onClick={() => navigate("/student/exams?type=kpss")}
          className="p-6 bg-purple-600 text-white rounded-xl shadow hover:bg-purple-700 text-center"
        >
          KPSS Sınavları
        </button>

      </div>

      {/* ÜÇ KART */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Toplam Sınav</h3>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {stats.total_tests || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Ortalama Başarı</h3>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            %{stats.average_score || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Son Çözüm</h3>
            <CheckCircle className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-lg font-bold text-gray-800">
            {stats.last_test_name || "-"}
          </p>
        </div>
      </div>

      {/* GRAFİK */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Haftalık Performans
        </h2>

        <div className="w-full">
          <Line data={chartData} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
