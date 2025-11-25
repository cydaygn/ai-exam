import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  BarChart2,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";

ChartJS.register(LineElement, BarElement, CategoryScale, LinearScale, PointElement);

function Performance() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetch(`http://localhost:5000/api/user/performance/${user.id}`)
      .then((res) => res.json())
      .then((d) => setData(d));
  }, []);

  if (!data) return <p className="text-center mt-10">Yükleniyor...</p>;

  // ------------------------------------------------------
  // WEEKLY SCORES (backend: weekly = [{day, score}])
  // ------------------------------------------------------
  const weeklyScores = data.weekly_scores || [];
  const weeklyData = weeklyScores.map((w) => w.score).reverse();

  const weeklyLabels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
    .slice(-weeklyData.length);

  const lineData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: "Başarı (%)",
        data: weeklyData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.2)",
        borderWidth: 3,
        pointBackgroundColor: "#3b82f6",
        tension: 0.4
      }
    ]
  };

  // ------------------------------------------------------
  // TOPIC PERFORMANCE
  // ------------------------------------------------------
  const topicPerf = data.topic_performance || [];

  const barData = {
    labels: topicPerf.map((t) => t.topic || "—"),
    datasets: [
      {
        label: "Başarı (%)",
        data: topicPerf.map((t) => t.topic_score || 0),
        backgroundColor: [
          "#3b82f6",
          "#facc15",
          "#22c55e",
          "#ef4444",
          "#8b5cf6"
        ],
        borderRadius: 8
      }
    ]
  };

  const weakTopics = topicPerf
    .filter((t) => (t.topic_score || 0) < 60)
    .map((t) => t.topic);

  const strongTopics = topicPerf
    .filter((t) => (t.topic_score || 0) >= 80)
    .map((t) => t.topic);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Performans Analizi</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="p-6 bg-purple-600 text-white rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Genel Başarı</h2>
            <TrendingUp size={32} />
          </div>
          <p className="text-5xl font-bold">%{data.average_score || 0}</p>
        </div>

        <div className="p-6 bg-green-600 text-white rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Tamamlanan Test</h2>
            <CheckCircle size={32} />
          </div>
          <p className="text-5xl font-bold">{data.total_tests || 0}</p>
        </div>

        <div className="p-6 bg-blue-600 text-white rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Günlük Hedef</h2>
            <BarChart2 size={32} />
          </div>
          <p className="text-5xl font-bold">85%</p>
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xl border">
          <h2 className="text-xl font-bold mb-4">Haftalık Başarı Grafiği</h2>
          <Line data={lineData} />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border">
          <h2 className="text-xl font-bold mb-4">Konu Bazlı Performans</h2>
          <Bar data={barData} />
        </div>

      </div>

      {/* Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-red-200">
          <h2 className="text-xl font-bold mb-4 text-red-600 flex items-center gap-2">
            <AlertTriangle size={22} /> Zayıf Konular
          </h2>

          {weakTopics.length === 0 ? (
            <p className="text-gray-500">Zayıf konu yok</p>
          ) : (
            weakTopics.map((t, i) => (
              <div key={i} className="p-3 bg-red-50 mb-3 rounded-xl">
                {t}
              </div>
            ))
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-green-200">
          <h2 className="text-xl font-bold mb-4 text-green-600 flex items-center gap-2">
            <CheckCircle size={22} /> Güçlü Konular
          </h2>

          {strongTopics.length === 0 ? (
            <p className="text-gray-500">Henüz güçlü konu yok</p>
          ) : (
            strongTopics.map((t, i) => (
              <div key={i} className="p-3 bg-green-50 mb-3 rounded-xl">
                {t}
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}

export default Performance;
