import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

function ExamResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const { answers, questions, examTitle } = location.state || {};

  if (!answers || !questions) {
    return (
      <div className="p-10 text-center">
        <p className="text-xl font-bold mb-4">Sonuç bulunamadı.</p>
        <button
          onClick={() => navigate("/student/exams")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Sınavlara Dön
        </button>
      </div>
    );
  }

  const correctCount = answers.filter(
    (a, i) => a === questions[i].answer
  ).length;

  const score = Math.round((correctCount / questions.length) * 100);

  useEffect(() => {
    fetch("http://localhost:5000/api/user/save-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        examName: examTitle || `Sınav #${id}`,
        score,
        correct: correctCount,
        total: questions.length,
      }),
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
      <h1 className="text-3xl font-bold mb-4">
        Sınav Sonucu: {examTitle || `Sınav #${id}`}
      </h1>

      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <p className="text-2xl font-semibold">
          Doğru Sayısı:{" "}
          <span className="text-green-600">{correctCount}</span> /{" "}
          <span className="text-blue-600">{questions.length}</span>
        </p>
        <p className="text-gray-600 mt-2">
          Başarı Oranı:{" "}
          <span className="font-semibold text-purple-700">%{score}</span>
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-4">Soru Analizi</h2>

      <div className="space-y-6">
        {questions.map((q, index) => {
          const isCorrect = answers[index] === q.answer;

          return (
            <div
              key={index}
              className={`p-5 rounded-xl border ${
                isCorrect
                  ? "bg-green-50 border-green-400"
                  : "bg-red-50 border-red-400"
              }`}
            >
              <p className="text-lg font-semibold mb-2">
                {index + 1}. {q.question}
              </p>

              <p className="mb-1">
                <span className="font-bold">Senin cevabın:</span>{" "}
                <span
                  className={isCorrect ? "text-green-700" : "text-red-700"}
                >
                  {q.options[answers[index]]}
                </span>
              </p>

              <p className="mb-3">
                <span className="font-bold">Doğru cevap:</span>{" "}
                <span className="text-blue-700">{q.options[q.answer]}</span>
              </p>

              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-semibold mb-1">AI Açıklaması:</p>
                <p className="text-gray-600 text-sm">
                  Bu sorunun açıklaması burada gösterilecek.
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={() => navigate("/student/exams")}
          className="bg-gray-300 px-4 py-2 rounded-lg"
        >
          Sınavlara Dön
        </button>

        <button
          onClick={() => navigate("/student/performance")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Performans Analizi
        </button>
      </div>
    </div>
  );
}

export default ExamResult;
