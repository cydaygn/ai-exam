import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [examTitle, setExamTitle] = useState("");
  const [questions, setQuestions] = useState(null);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);

  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/exams/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.questions) {
          console.error("Veri gelmedi:", data);
          return;
        }

        setExamTitle(data.title);           // ← DOĞRU ANAHTAR
        setQuestions(data.questions);       // ← DOĞRU
        setAnswers(new Array(data.questions.length).fill(null));
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [id]);

  // *** VERİ GELMEDEN MAP YAPILMASINI ENGELE ***
  if (!questions) return <p>Yükleniyor...</p>;
  if (questions.length === 0) return <p>Bu sınavda soru yok.</p>;

  const question = questions[current];
  const total = questions.length;

  const saveAnswer = () => {
    const updated = [...answers];
    updated[current] = selected;
    setAnswers(updated);
    return updated;
  };

  const handleNext = () => {
    const updated = saveAnswer();
    if (current < total - 1) {
      setCurrent(current + 1);
      setSelected(updated[current + 1]);
    }
  };

  const handlePrev = () => {
    if (current === 0) return;
    const updated = saveAnswer();
    setCurrent(current - 1);
    setSelected(updated[current - 1]);
  };

  const finishExam = () => {
    const updated = saveAnswer();
    navigate(`/student/exam/${id}/result`, {
      state: { answers: updated, questions, examTitle }
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{examTitle}</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <p className="mb-2 text-gray-600">
          Soru {current + 1} / {total}
        </p>

        <h2 className="text-xl font-bold mb-4">{question.question}</h2>

        {question.image_url && (
          <img
            src={`http://localhost:5000${question.image_url}`}
            className="w-full rounded-lg mb-4"
          />
        )}

        {question.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => setSelected(idx)}
            className={`w-full p-4 border rounded-xl mb-3 ${
              selected === idx ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            {opt}
          </button>
        ))}

        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className={`px-5 py-2 rounded-lg border ${
              current === 0 ? "opacity-40" : ""
            }`}
          >
            Geri
          </button>

          <div className="flex gap-3">

            {current < total - 1 && (
              <button
                onClick={handleNext}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg"
              >
                İleri
              </button>
            )}

            <button
              onClick={() => setShowConfirm(true)}
              className="px-5 py-2 bg-red-600 text-white rounded-lg"
            >
              Sınavı Bitir
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">
              Sınavı bitirmek istiyor musun?
            </h2>

            <div className="flex justify-between">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Hayır
              </button>

              <button
                onClick={finishExam}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Evet, Bitir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamDetail;
