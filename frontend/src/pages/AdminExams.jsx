import { useState, useEffect } from "react";
import axios from "axios";
import { Upload, X, Trash2, Edit, ListPlus } from "lucide-react";

function AdminExams() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);

  const [selectedExamForEdit, setSelectedExamForEdit] = useState(null);
  const [editExamTitle, setEditExamTitle] = useState("");
  const [editExamDescription, setEditExamDescription] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [question, setQuestion] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [option5, setOption5] = useState("");
  const [correct, setCorrect] = useState(0);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = () => {
    axios
      .get("http://localhost:5000/api/exams")
      .then((res) => setExams(res.data))
      .catch((err) => console.error("Sınavlar yüklenemedi:", err));
  };

  const fetchExamQuestions = (id) => {
    axios
      .get(`http://localhost:5000/api/admin/exam/${id}/questions`)
      .then((res) => setExamQuestions(res.data))
      .catch((err) => console.error("Sorular yüklenemedi:", err));
  };

  const updateExam = async () => {
    if (!editExamTitle.trim()) return alert("Başlık boş olamaz");

    try {
      await axios.put(
        `http://localhost:5000/api/admin/exam/${selectedExamForEdit.id}`,
        {
          title: editExamTitle,
          description: editExamDescription,
        }
      );

      alert("Sınav güncellendi!");
      setSelectedExamForEdit(null);
      fetchExams();
    } catch (e) {
      console.error(e);
      alert("Sınav güncellenirken hata oluştu");
    }
  };

  const createExam = async () => {
    if (!title.trim()) return alert("Başlık boş olamaz");

    try {
      await axios.post("http://localhost:5000/api/admin/exam/create", {
        title,
        description,
      });

      alert("Sınav oluşturuldu!");
      setTitle("");
      setDescription("");
      fetchExams();
    } catch (e) {
      alert("Sınav oluşturulurken hata oluştu!");
      console.error(e);
    }
  };

  const deleteExam = async (id, name) => {
    if (!confirm(`"${name}" sınavını silmek istiyor musunuz?`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/exam/${id}`);
      alert("Sınav silindi!");
      fetchExams();
      if (selectedExam === id) {
        setSelectedExam(null);
        setExamQuestions([]);
      }
    } catch (e) {
      alert("Sınav silinirken hata oluştu!");
      console.error(e);
    }
  };

  const deleteQuestion = async (id) => {
    if (!confirm("Bu soruyu silmek istiyor musunuz?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/question/${id}`);
      alert("Soru silindi!");
      fetchExamQuestions(selectedExam);
    } catch (e) {
      alert("Soru silinirken hata oluştu!");
      console.error(e);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const resetQuestionForm = () => {
    setQuestion("");
    setOption1("");
    setOption2("");
    setOption3("");
    setOption4("");
    setOption5("");
    setCorrect(0);
    setImageFile(null);
    setImagePreview(null);
  };

  const addQuestion = async () => {
    if (!question.trim()) return alert("Soru boş olamaz");
    if (!option1 || !option2 || !option3 || !option4 || !option5)
      return alert("Tüm şıklar doldurulmalıdır");

    const form = new FormData();
    form.append("question", question);
    form.append("option1", option1);
    form.append("option2", option2);
    form.append("option3", option3);
    form.append("option4", option4);
    form.append("option5", option5);
    form.append("correct", correct);
    if (imageFile) form.append("image", imageFile);

    try {
      await axios.post(
        `http://localhost:5000/api/admin/exam/${selectedExam}/question`,
        form
      );

      alert("Soru eklendi!");
      resetQuestionForm();
      fetchExamQuestions(selectedExam);
    } catch (e) {
      alert("Soru eklenirken hata oluştu!");
      console.error(e);
    }
  };

  const updateQuestion = async () => {
    if (!editQuestionId) return;

    if (!question.trim()) return alert("Soru boş olamaz");
    if (!option1 || !option2 || !option3 || !option4 || !option5)
      return alert("Tüm şıklar doldurulmalıdır");

    try {
      await axios.put(
        `http://localhost:5000/api/admin/question/${editQuestionId}`,
        {
          question,
          option1,
          option2,
          option3,
          option4,
          option5,
          correct,
        }
      );

      alert("Soru güncellendi!");
      setEditMode(false);
      setEditQuestionId(null);
      resetQuestionForm();
      fetchExamQuestions(selectedExam);
    } catch (e) {
      alert("Soru güncellenirken hata oluştu!");
      console.error(e);
    }
  };

  // ============================================
  // GELİŞTİRİLMİŞ TOPLU EKLEME
  // ============================================
  const handleBulkAdd = async () => {
    setBulkLoading(true);

    try {
      const lines = bulkText
        .replace(/\r/g, "")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l !== "");

      const questions = [];
      let i = 0;

      while (i < lines.length) {
        // SORU BAŞLANGICI: A) ile başlamayan herhangi bir satır
        if (!lines[i].match(/^[A-E]\)/i) && !lines[i].match(/^[A-E]$/i)) {
          let questionText = lines[i].trim();
          
          // Soru numarasını temizle (1., 2., vb.)
          questionText = questionText.replace(/^\d+\.\s*/, "");
          i++;

          // Soru metni devam ediyor mu?
          while (i < lines.length && !lines[i].match(/^[A-E]\)/i)) {
            if (!lines[i].match(/^[A-E]$/i)) {
              questionText += " " + lines[i];
              i++;
            } else {
              break;
            }
          }

          questionText = questionText.trim();

          // ŞIKLARı TOPLA (A), B), C), D), E))
          const options = [];
          const optionPattern = /^([A-E])\)\s*(.+)$/i;

          for (let j = 0; j < 5 && i < lines.length; j++) {
            const match = lines[i].match(optionPattern);
            if (match) {
              let optionText = match[2].trim();
              i++;

              // Şık metni de devam edebilir
              while (
                i < lines.length &&
                !lines[i].match(/^[A-E]\)/i) &&
                !lines[i].match(/^[A-E]$/i)
              ) {
                optionText += " " + lines[i];
                i++;
              }

              options.push(optionText.trim());
            } else {
              break;
            }
          }

          // CEVAP: Sadece tek harf (A, B, C, D veya E)
          let correctIndex = 0;
          if (i < lines.length) {
            const answerLine = lines[i].trim().toUpperCase();

            // "Cevap: A" veya sadece "A" formatı
            const answerMatch = answerLine.match(/[A-E]/);
            if (answerMatch) {
              correctIndex = answerMatch[0].charCodeAt(0) - 65;
              i++;
            }
          }

          // Geçerli soru varsa ekle
          if (questionText && options.length === 5) {
            questions.push({
              question: questionText,
              option1: options[0],
              option2: options[1],
              option3: options[2],
              option4: options[3],
              option5: options[4],
              correct: correctIndex,
            });
          } else {
            console.warn("⚠️ Eksik soru atlandı:", {
              soru: questionText,
              şıkSayısı: options.length,
            });
          }
        } else {
          i++;
        }
      }

      if (questions.length === 0) {
        alert(
          "❌ Hiç soru algılanamadı!\n\n" +
            "✅ KOLAY FORMAT 1:\n" +
            "Soru metni?\n" +
            "A) Şık 1\n" +
            "B) Şık 2\n" +
            "C) Şık 3\n" +
            "D) Şık 4\n" +
            "E) Şık 5\n" +
            "B\n\n" +
            "✅ KOLAY FORMAT 2:\n" +
            "Soru metni?\n" +
            "A) Şık 1\n" +
            "B) Şık 2\n" +
            "C) Şık 3\n" +
            "D) Şık 4\n" +
            "E) Şık 5\n" +
            "Cevap: B"
        );
        setBulkLoading(false);
        return;
      }

      const res = await axios.post(
        `http://localhost:5000/api/admin/exam/${selectedExam}/bulk-questions`,
        { questions }
      );

      alert(`✅ ${res.data.count} soru başarıyla eklendi!`);
      setBulkText("");
      setShowBulkAdd(false);
      fetchExamQuestions(selectedExam);
    } catch (err) {
      console.error(err);
      alert(
        "❌ Toplu ekleme hatası:\n" +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setBulkLoading(false);
    }
  };

  const selectExam = (id) => {
    setSelectedExam(id);
    setShowBulkAdd(false);
    setEditMode(false);
    setEditQuestionId(null);
    resetQuestionForm();
    fetchExamQuestions(id);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sınav Yönetimi</h1>

      {/* Yeni Sınav Oluştur */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-bold mb-3">Yeni Sınav Oluştur</h2>

        <input
          className="border p-2 w-full mb-3 rounded"
          placeholder="Sınav Başlığı"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="border p-2 w-full mb-3 rounded"
          placeholder="Açıklama (opsiyonel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <button
          onClick={createExam}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Sınav Oluştur
        </button>
      </div>

      {/* Sınav Listesi */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Sınavlar</h2>

        {exams.length === 0 ? (
          <p className="text-gray-500">Henüz sınav yok.</p>
        ) : (
          exams.map((ex) => (
            <div
              key={ex.id}
              className="p-4 border rounded-lg flex justify-between items-center mb-2 hover:bg-gray-50"
            >
              <div>
                <p className="font-semibold text-lg">{ex.title}</p>
                {ex.description && (
                  <p className="text-sm text-gray-600">{ex.description}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => selectExam(ex.id)}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg flex gap-2 items-center hover:bg-green-700"
                >
                  <Edit size={18} /> Soru Yönet
                </button>

                <button
                  onClick={() => {
                    setSelectedExamForEdit(ex);
                    setEditExamTitle(ex.title);
                    setEditExamDescription(ex.description || "");
                  }}
                  className="px-3 py-2 bg-yellow-500 text-white rounded-lg flex gap-2 items-center hover:bg-yellow-600"
                >
                  <Edit size={18} /> Sınav Adı Düzenle
                </button>

                <button
                  onClick={() => deleteExam(ex.id, ex.title)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg flex gap-2 items-center hover:bg-red-700"
                >
                  <Trash2 size={18} /> Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sınav Düzenleme Formu */}
      {selectedExamForEdit && (
        <div className="bg-white p-6 rounded-xl shadow mb-8 mt-4">
          <h2 className="text-xl font-bold mb-3">Sınavı Düzenle</h2>

          <input
            className="border p-2 w-full mb-3 rounded"
            value={editExamTitle}
            onChange={(e) => setEditExamTitle(e.target.value)}
            placeholder="Sınav Başlığı"
          />

          <textarea
            className="border p-2 w-full mb-3 rounded"
            rows={3}
            value={editExamDescription}
            onChange={(e) => setEditExamDescription(e.target.value)}
            placeholder="Açıklama"
          />

          <div className="flex gap-2">
            <button
              onClick={updateExam}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Kaydet
            </button>

            <button
              onClick={() => setSelectedExamForEdit(null)}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Soru Yönetimi */}
      {selectedExam && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">
              Mevcut Sorular ({examQuestions.length})
            </h2>

            {examQuestions.length === 0 ? (
              <p className="text-gray-500">Bu sınavda henüz soru yok.</p>
            ) : (
              examQuestions.map((q, i) => (
                <div
                  key={q.id}
                  className="border rounded-lg p-4 mb-3 hover:bg-gray-50"
                >
                  <p className="font-semibold mb-2">
                    {i + 1}. {q.question}
                  </p>

                  {q.image_url && (
                    <img
                      src={`http://localhost:5000${q.image_url}`}
                      alt="Soru görseli"
                      className="w-48 h-32 object-cover rounded mb-2"
                    />
                  )}

                  <div className="text-sm mb-2">
                    <p
                      className={
                        q.correct === 0 ? "text-green-600 font-semibold" : ""
                      }
                    >
                      A) {q.option1}
                    </p>
                    <p
                      className={
                        q.correct === 1 ? "text-green-600 font-semibold" : ""
                      }
                    >
                      B) {q.option2}
                    </p>
                    <p
                      className={
                        q.correct === 2 ? "text-green-600 font-semibold" : ""
                      }
                    >
                      C) {q.option3}
                    </p>
                    <p
                      className={
                        q.correct === 3 ? "text-green-600 font-semibold" : ""
                      }
                    >
                      D) {q.option4}
                    </p>
                    <p
                      className={
                        q.correct === 4 ? "text-green-600 font-semibold" : ""
                      }
                    >
                      E) {q.option5}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditMode(true);
                        setEditQuestionId(q.id);
                        setQuestion(q.question);
                        setOption1(q.option1);
                        setOption2(q.option2);
                        setOption3(q.option3);
                        setOption4(q.option4);
                        setOption5(q.option5);
                        setCorrect(q.correct);
                        setShowBulkAdd(false);
                      }}
                      className="px-3 py-2 bg-yellow-500 text-white rounded-lg flex items-center gap-1 hover:bg-yellow-600"
                    >
                      <Edit size={16} />
                      Düzenle
                    </button>

                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg flex items-center gap-1 hover:bg-red-700"
                    >
                      <Trash2 size={16} />
                      Sil
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Soru Ekleme / Düzenleme */}
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex gap-3 mb-5">
              <button
                onClick={() => {
                  setShowBulkAdd(false);
                  setEditMode(false);
                  setEditQuestionId(null);
                  resetQuestionForm();
                }}
                className={`flex-1 px-4 py-3 rounded-lg font-medium ${
                  !showBulkAdd ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {editMode ? "Soruyu Düzenle" : "Tekli Soru Ekle"}
              </button>

              <button
                onClick={() => {
                  setShowBulkAdd(true);
                  setEditMode(false);
                  setEditQuestionId(null);
                  resetQuestionForm();
                }}
                className={`flex-1 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  showBulkAdd ? "bg-purple-600 text-white" : "bg-gray-200"
                }`}
              >
                <ListPlus size={20} />
                Toplu Soru Ekle
              </button>
            </div>

            {/* TOPLU SORU EKLEME */}
            {showBulkAdd ? (
              <div>
                {/* Açıklama */}
                <div className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-5">
                  <h3 className="font-bold text-lg text-blue-900 mb-3">
                    📚 Kolay Format: Soruları Şöyle Yazın
                  </h3>

                  <div className="bg-white p-4 rounded-lg border border-gray-200 font-mono text-sm mb-3">
                    <div className="text-gray-600">
                      Türkiye'nin başkenti neresidir?
                    </div>
                    <div className="text-gray-600">A) İstanbul</div>
                    <div className="text-green-600 font-semibold">
                      B) Ankara ✓
                    </div>
                    <div className="text-gray-600">C) İzmir</div>
                    <div className="text-gray-600">D) Antalya</div>
                    <div className="text-gray-600">E) Bursa</div>
                    <div className="text-blue-600 font-semibold">B</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <strong className="text-green-800">✅ Doğru:</strong>
                      <p className="text-green-700">• Şıklar: A), B), C) ...</p>
                      <p className="text-green-700">• Cevap: Sadece B veya Cevap: B</p>
                      <p className="text-green-700">• Soru numarası olabilir</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                      <strong className="text-blue-800">💡 İpucu:</strong>
                      <p className="text-blue-700">• Word'den kopyala-yapıştır</p>
                      <p className="text-blue-700">• Uzun sorular desteklenir</p>
                      <p className="text-blue-700">• Boş satır bırakabilirsiniz</p>
                    </div>
                  </div>
                </div>

                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full h-80 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  placeholder="Soruları buraya yapıştırın...&#10;&#10;Türkiye'nin başkenti neresidir?&#10;A) İstanbul&#10;B) Ankara&#10;C) İzmir&#10;D) Antalya&#10;E) Bursa&#10;B&#10;&#10;İkinci soru buraya..."
                />

                <button
                  onClick={handleBulkAdd}
                  disabled={bulkLoading || !bulkText.trim()}
                  className="mt-3 w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-semibold text-lg"
                >
                  {bulkLoading ? "⏳ Ekleniyor..." : "➕ Soruları Ekle"}
                </button>
              </div>
            ) : (
              <>
                <textarea
                  className="border p-2 w-full mb-3 rounded"
                  placeholder="Soru metni"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={4}
                />

                {!imagePreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 mb-4">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Resim yüklemek için tıklayın
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                ) : (
                  <div className="relative mb-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <input
                    className="border p-2 w-full rounded"
                    placeholder="Şık A"
                    value={option1}
                    onChange={(e) => setOption1(e.target.value)}
                  />
                  <input
                    className="border p-2 w-full rounded"
                    placeholder="Şık B"
                    value={option2}
                    onChange={(e) => setOption2(e.target.value)}
                  />
                  <input
                    className="border p-2 w-full rounded"
                    placeholder="Şık C"
                    value={option3}
                    onChange={(e) => setOption3(e.target.value)}
                  />
                  <input
                    className="border p-2 w-full rounded"
                    placeholder="Şık D"
                    value={option4}
                    onChange={(e) => setOption4(e.target.value)}
                  />
                  <input
                    className="border p-2 w-full rounded"
                    placeholder="Şık E"
                    value={option5}
                    onChange={(e) => setOption5(e.target.value)}
                  />
                </div>

                <select
                  className="border p-2 w-full mb-4 rounded"
                  value={correct}
                  onChange={(e) => setCorrect(Number(e.target.value))}
                >
                  <option value={0}>Doğru Cevap: A</option>
                  <option value={1}>Doğru Cevap: B</option>
                  <option value={2}>Doğru Cevap: C</option>
                  <option value={3}>Doğru Cevap: D</option>
                  <option value={4}>Doğru Cevap: E</option>
                </select>

                <button
                  onClick={editMode ? updateQuestion : addQuestion}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editMode ? "Düzenlemeyi Kaydet" : "Soru Ekle"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminExams;