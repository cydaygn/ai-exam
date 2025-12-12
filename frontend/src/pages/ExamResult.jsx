import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Loader, Lightbulb, BookOpen } from "lucide-react";

function ExamResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const { answers, questions, examTitle } = location.state || {};

  const [explanations, setExplanations] = useState({});
  const [loadingExplanations, setLoadingExplanations] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

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

  // Sonucu kaydet + genel sınav analizi al
  useEffect(() => {
    if (!user || !user.id) return;

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
    }).catch(err => console.error("Sonuç kaydetme hatası:", err));

    if (questions && answers) {
      setLoadingAnalysis(true);
      axios
        .post("http://localhost:5000/api/ai/analyze-exam", {
          userId: user.id,
          examName: examTitle || `Sınav #${id}`,
          questions,
          answers,
        })
        .then(res => {
          if (res.data.success) {
            setAnalysis(res.data.analysis);
          } else if (res.data.error) {
            setAnalysis(
              `Analiz yapılırken hata oluştu: ${res.data.error}. Lütfen sonra tekrar deneyin.`
            );
          }
        })
        .catch(err => {
          console.error("Analiz hatası:", err);
          const errorMessage =
            err.response?.data?.error || err.message || "Bilinmeyen hata";
          setAnalysis(
            `Analiz yapılırken hata oluştu: ${errorMessage}. Lütfen sayfayı yenileyip tekrar deneyin.`
          );
        })
        .finally(() => {
          setLoadingAnalysis(false);
        });
    }
  }, []); // ilk yüklemede bir kez

  // Tek bir sorunun AI açıklamasını al
  const fetchExplanation = async (
    questionIndex,
    question,
    options,
    userAnswer,
    correctAnswer
  ) => {
    if (explanations[questionIndex]) return; // zaten var

    setLoadingExplanations(prev => ({ ...prev, [questionIndex]: true }));

    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai/explain-question",
        {
          question,
          options,
          userAnswer,
          correctAnswer,
          questionIndex,
        }
      );

      if (res.data.success) {
        setExplanations(prev => ({
          ...prev,
          [questionIndex]: res.data.explanation,
        }));
      } else {
        const msg =
          res.data.error || "AI açıklaması alınamadı (backend success=false)";
        setExplanations(prev => ({
          ...prev,
          [questionIndex]: `Açıklama yüklenemedi: ${msg}`,
        }));
      }
    } catch (err) {
      console.error("Açıklama hatası:", err);
      const errorMessage =
        err.response?.data?.error || err.message || "Bilinmeyen hata";
      setExplanations(prev => ({
        ...prev,
        [questionIndex]: `Açıklama yüklenirken hata oluştu: ${errorMessage}.`,
      }));
    } finally {
      setLoadingExplanations(prev => ({
        ...prev,
        [questionIndex]: false,
      }));
    }
  };

  // TÜM YANLIŞ SORULAR İÇİN OTOMATİK AÇIKLAMA İSTE
  useEffect(() => {
    questions.forEach((q, index) => {
      const isCorrect = answers[index] === q.answer;
      if (!isCorrect) {
        fetchExplanation(
          index + 1,
          q.question,
          q.options,
          answers[index],
          q.answer
        );
      }
    });
    // explanations'ı dependency'e koymuyoruz ki sonsuz döngü olmasın
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ilk render sonrası bir kere

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

      {/* Genel AI Sınav Analizi */}
      {analysis && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-6 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="text-yellow-600" size={24} />
            <h2 className="text-2xl font-bold">AI Sınav Analizi</h2>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {analysis}
            </p>
          </div>
        </div>
      )}

      {loadingAnalysis && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-center gap-2">
          <Loader className="animate-spin text-blue-600" size={20} />
          <span className="text-blue-700">Sınav analizi yapılıyor...</span>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Soru Analizi</h2>

      <div className="space-y-6">
        {questions.map((q, index) => {
          const isCorrect = answers[index] === q.answer;
          const explanation = explanations[index + 1];
          const isLoadingExplanation = loadingExplanations[index + 1];

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

              {q.image_url && (
                <img
                  src={`http://localhost:5000${q.image_url}`}
                  alt="Soru görseli"
                  className="max-w-md mb-3 rounded-lg shadow"
                />
              )}

              <p className="mb-1">
                <span className="font-bold">Senin cevabın:</span>{" "}
                <span
                  className={isCorrect ? "text-green-700" : "text-red-700"}
                >
                  {q.options[answers[index]] ?? "Boş bıraktın"}
                </span>
              </p>

              {!isCorrect && (
                <p className="mb-3">
                  <span className="font-bold">Doğru cevap:</span>{" "}
                  <span className="text-blue-700">
                    {q.options[q.answer] ?? q.answer}
                  </span>
                </p>
              )}

              {/* Yanlış sorular için AI açıklaması (OTOMATİK) */}
              {!isCorrect && (
                <div className="bg-white p-4 rounded-lg shadow-sm mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="text-purple-600" size={18} />
                    <p className="font-semibold text-purple-700">
                      AI Açıklaması:
                    </p>
                  </div>

                  {isLoadingExplanation && !explanation && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader className="animate-spin" size={16} />
                      <span className="text-sm">
                        Açıklama yükleniyor...
                      </span>
                    </div>
                  )}

                  {!isLoadingExplanation && explanation && (
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                      {explanation}
                    </p>
                  )}

                  {!isLoadingExplanation && !explanation && (
                    <p className="text-xs text-gray-500">
                      Açıklama alınamadı. Lütfen daha sonra tekrar dene.
                    </p>
                  )}
                </div>
              )}
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
