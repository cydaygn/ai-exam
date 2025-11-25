import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FileText, Clock } from "lucide-react";

function Exams() {
  const [exams, setExams] = useState([]);
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const examType = params.get("type");

  // Sınav türüne göre ikon & renk
  function getExamStyle(type) {
    switch (type) {
      case "yks":
        return {
          card: "bg-blue-50 border-blue-300",
          iconColor: "text-blue-600",
          icon: "📘"
        };
      case "ales":
        return {
          card: "bg-green-50 border-green-300",
          iconColor: "text-green-600",
          icon: "📗"
        };
      case "kpss":
        return {
          card: "bg-purple-50 border-purple-300",
          iconColor: "text-purple-600",
          icon: "📙"
        };
      default:
        return {
          card: "bg-gray-50 border-gray-300",
          iconColor: "text-gray-600",
          icon: "📄"
        };
    }
  }

  useEffect(() => {
    let url = "http://localhost:5000/api/exams";

    if (examType) {
      url = `http://localhost:5000/api/exams/type/${examType}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => setExams(data));
  }, [examType]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Sınavlarım</h1>

      {/* SINAV TÜRÜ SEÇİMİ */}
      <div className="flex gap-4 mb-6">
        <Link to="/student/exams?type=yks" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          YKS
        </Link>

        <Link to="/student/exams?type=ales" className="px-4 py-2 bg-green-600 text-white rounded-lg">
          ALES
        </Link>

        <Link to="/student/exams?type=kpss" className="px-4 py-2 bg-purple-600 text-white rounded-lg">
          KPSS
        </Link>

        <Link to="/student/exams" className="px-4 py-2 bg-gray-500 text-white rounded-lg">
          Hepsi
        </Link>
      </div>

      {/* SINAV KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => {
          const st = getExamStyle(exam.exam_type);

          return (
            <div
              key={exam.id}
              className={`p-5 rounded-xl shadow-md border flex flex-col ${st.card}`}
            >
              <h2 className={`text-xl font-semibold mb-2 flex items-center gap-2 break-words ${st.iconColor}`}>
                <span className="text-2xl">{st.icon}</span>
                {exam.title}
              </h2>

              <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                <Clock size={16} />
                {new Date(exam.created_at).toLocaleDateString()}
              </div>

              <Link
                to={`/student/exam/${exam.id}`}
                className="mt-auto w-full bg-blue-600 text-white py-2 rounded-lg text-center hover:bg-blue-700"
              >
                Başla
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Exams;
