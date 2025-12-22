import { useState, useEffect } from "react";
import axios from "axios";
import {
  Upload,
  X,
  Trash2,
  Edit,
  ListPlus,
  Brain,
  ArrowLeft,
  Image as ImageIcon,
  Save,
  PlusCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api";

function AdminExams() {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);

  const [selectedExamForEdit, setSelectedExamForEdit] = useState(null);
  const [editExamTitle, setEditExamTitle] = useState("");
  const [editExamDescription, setEditExamDescription] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examType, setExamType] = useState("yks"); // ✅ YKS / ALES / KPSS

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

  const api = axios.create({ baseURL: API_URL });

  const adminToken = localStorage.getItem("adminToken") || "";
  const authHeaders = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      navigate("/admin/login");
      return;
    }
    fetchExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchExams = () => {
    api
      .get("/admin/exams", { headers: authHeaders })
      .then((res) => {
        const examsData = Array.isArray(res.data) ? res.data : res.data?.exams || [];
        setExams(examsData);
      })
      .catch((err) => {
        console.error("Sınavlar yüklenemedi:", err);
        setExams([]);
      });
  };

  const fetchExamQuestions = (id) => {
    api
      .get(`/admin/exam/${id}/questions`, { headers: authHeaders })
      .then((res) => setExamQuestions(res.data))
      .catch((err) => console.error("Sorular yüklenemedi:", err));
  };

  const updateExam = async () => {
    if (!editExamTitle.trim()) return alert("Başlık boş olamaz");

    try {
      await api.put(
        `/admin/exam/${selectedExamForEdit.id}`,
        { title: editExamTitle, description: editExamDescription },
        { headers: authHeaders }
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
    if (!["yks", "ales", "kpss"].includes(examType)) return alert("Geçersiz sınav türü");

    try {
      await api.post(
        "/admin/exam/create",
        { title, description, exam_type: examType },
        { headers: authHeaders }
      );

      alert("Sınav oluşturuldu!");
      setTitle("");
      setDescription("");
      setExamType("yks");
      fetchExams();
    } catch (e) {
      alert("Sınav oluşturulurken hata oluştu!");
      console.error(e);
    }
  };

  const deleteExam = async (id, name) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`"${name}" sınavını silmek istiyor musunuz?`)) return;

    try {
      await api.delete(`/admin/exam/${id}`, { headers: authHeaders });
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
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("Bu soruyu silmek istiyor musunuz?")) return;

    try {
      await api.delete(`/admin/question/${id}`, { headers: authHeaders });
      alert("Soru silindi!");
      fetchExamQuestions(selectedExam);
    } catch (e) {
      alert("Soru silinirken hata oluştu!");
      console.error(e);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
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
    if (!option1 || !option2 || !option3 || !option4 || !option5) {
      return alert("Tüm şıklar doldurulmalıdır");
    }
    const form = new FormData();
    form.append("question", question);
    form.append("option1", option1);
    form.append("option2", option2);
    form.append("option3", option3);
    form.append("option4", option4);
    form.append("option5", option5);
    form.append("correct", String(correct));
    if (imageFile) form.append("image", imageFile);
    try {
      await api.post(`/admin/exam/${selectedExam}/question`, form, {
        headers: { ...authHeaders },
      });
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
    if (!option1 || !option2 || !option3 || !option4 || !option5) {
      return alert("Tüm şıklar doldurulmalıdır");
    }
    try {
      await api.put(
        `/admin/question/${editQuestionId}`,
        { question, option1, option2, option3, option4, option5, correct },
        { headers: authHeaders }
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
        if (!lines[i].match(/^[A-E]\)/i) && !lines[i].match(/^[A-E]$/i)) {
          let questionText = lines[i].trim().replace(/^\d+\.\s*/, "");
          i++;

          while (i < lines.length && !lines[i].match(/^[A-E]\)/i)) {
            if (!lines[i].match(/^[A-E]$/i)) {
              questionText += " " + lines[i];
              i++;
            } else break;
          }
          questionText = questionText.trim();
          const options = [];
          const optionPattern = /^([A-E])\)\s*(.+)$/i;
          for (let j = 0; j < 5 && i < lines.length; j++) {
            const match = lines[i].match(optionPattern);
            if (match) {
              let optionText = match[2].trim();
              i++;
              while (
                i < lines.length &&
                !lines[i].match(/^[A-E]\)/i) &&
                !lines[i].match(/^[A-E]$/i)
              ) {
                optionText += " " + lines[i];
                i++;
              }
              options.push(optionText.trim());
            } else break;
          }
          let correctIndex = 0;
          if (i < lines.length) {
            const answerLine = lines[i].trim().toUpperCase();
            const answerMatch = answerLine.match(/[A-E]/);
            if (answerMatch) {
              correctIndex = answerMatch[0].charCodeAt(0) - 65;
              i++;
            }
          }
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
          }
        } else {
          i++;
        }
      }
      if (questions.length === 0) {
        alert(
          "Hiç soru algılanamadı!\n\n" +
            "FORMAT:\n" +
            "Soru metni?\n" +
            "A) Şık 1\n" +
            "B) Şık 2\n" +
            "C) Şık 3\n" +
            "D) Şık 4\n" +
            "E) Şık 5\n" +
            "B\n\n" +
            "veya: Cevap: B"
        );
        return;
      }
      const res = await api.post(
        `/admin/exam/${selectedExam}/bulk-questions`,
        { questions },
        { headers: authHeaders }
      );
      alert(`✅ ${res.data.count} soru başarıyla eklendi!`);
      setBulkText("");
      setShowBulkAdd(false);
      fetchExamQuestions(selectedExam);
    } catch (err) {
      console.error(err);
      alert("Toplu ekleme hatası:\n" + (err.response?.data?.message || err.message));
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
  const selectedExamObj = Array.isArray(exams) ? exams.find((e) => e.id === selectedExam) : null;
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative overflow-hidden">
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
        <div />
      </nav>
      <main className="relative z-10 px-6 md:px-10 lg:px-16 py-10 md:py-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">Sınav Yönetimi</h1>
            <p className="text-slate-700 mt-1">Sınav oluştur, güncelle, soruları tek tek veya toplu ekle.</p>
          </div>
     {/* create exam */}
<GlassCard title="Yeni Sınav Oluştur" rightIcon={<PlusCircle className="w-5 h-5 text-slate-400" />}>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <Label>Sınav Başlığı</Label>
      <input
        className="w-full rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-3 outline-none"
        value={title}
        onChange={(e) => setTitle(e.target.value)}  />
    </div>
 <div>
  <Label>Sınav Türü</Label>
  <div className="relative">
    <select
      className="w-full appearance-none rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-3 pr-10
                 outline-none cursor-pointer hover:bg-white
                 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-300/30
                 transition shadow-sm"
      value={examType}
      onChange={(e) => setExamType(e.target.value)}
    >
      <option value="yks">YKS</option>
      <option value="ales">ALES</option>
      <option value="kpss">KPSS</option>
    </select>
    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">    ▼
    </span>
  </div>
</div>
    <div>
      <Label>Açıklama</Label>
      <textarea
        className="w-full rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-3 outline-none"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
    </div>
  </div>

  <div className="mt-4">
   <button
  onClick={createExam}
  className="
    inline-flex items-center justify-center
    px-6 py-3
    rounded-2xl
    font-bold
    text-white
    bg-gradient-to-r from-emerald-500 to-cyan-500
    hover:brightness-110
    transition
    shadow-lg
  "
>
  Sınav Oluştur
</button>

  </div>
</GlassCard>

          {/* exams list */}
          <GlassCard
            title={`Sınavlar (${exams.length})`}
           
          >
            {exams.length === 0 ? (
              <EmptyState text="Henüz sınav yok." />
            ) : (
              <div className="space-y-3">
                {exams.map((ex) => {
                  const isActive = selectedExam === ex.id;
                  return (
                    <div
                      key={ex.id}
                      className={`rounded-3xl border p-5 transition bg-white/60
                        ${
                          isActive
                            ? "border-emerald-400/40 ring-4 ring-emerald-300/15"
                            : "border-slate-900/10 hover:bg-white/70"
                        }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-extrabold text-lg text-slate-900 truncate">{ex.title}</p>
                          {ex.description && <p className="text-sm text-slate-600 mt-1">{ex.description}</p>}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => selectExam(ex.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-white
                                       bg-gradient-to-r from-emerald-500 to-cyan-500
                                       shadow-[0_10px_30px_rgba(6,182,212,0.20)]
                                       hover:brightness-105 transition"
                          >
                            <Edit size={18} />
                            Soru Yönet
                          </button>

                          <button
                            onClick={() => {
                              setSelectedExamForEdit(ex);
                              setEditExamTitle(ex.title);
                              setEditExamDescription(ex.description || "");
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-slate-900
                                       bg-white/70 border border-slate-900/10 hover:bg-white transition"
                          >
                            <Edit size={18} />
                            Sınav Adı Düzenle
                          </button>

                          <button
                            onClick={() => deleteExam(ex.id, ex.title)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-white
                                       bg-gradient-to-r from-red-500 to-rose-500
                                       shadow-[0_10px_30px_rgba(244,63,94,0.20)]
                                       hover:brightness-105 transition"
                          >
                            <Trash2 size={18} />
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>

          {/* exam edit */}
          {selectedExamForEdit && (
            <GlassCard title="Sınavı Düzenle" rightIcon={<Save className="w-5 h-5 text-slate-400" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Sınav Başlığı</Label>
                  <input
                    className="w-full rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-3 outline-none
                               focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-300/20 transition"
                    value={editExamTitle}
                    onChange={(e) => setEditExamTitle(e.target.value)}
                    placeholder="Sınav Başlığı"
                  />
                </div>

                <div>
                  <Label>Açıklama</Label>
                  <textarea
                    className="w-full rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-3 outline-none
                               focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-300/20 transition"
                    rows={3}
                    value={editExamDescription}
                    onChange={(e) => setEditExamDescription(e.target.value)}
                    placeholder="Açıklama"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={updateExam}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-white
                             bg-gradient-to-r from-emerald-500 to-cyan-500
                             shadow-[0_14px_40px_rgba(16,185,129,0.22)]
                             hover:brightness-105 transition"
                >
                  <Save className="w-5 h-5" />
                  Kaydet
                </button>

                <button
                  onClick={() => setSelectedExamForEdit(null)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-900
                             bg-white/70 border border-slate-900/10 hover:bg-white transition"
                >
                  İptal
                </button>
              </div>
            </GlassCard>
          )}

          {/* questions area */}
          {selectedExam && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* existing questions */}
              <GlassCard
                title={`Mevcut Sorular (${examQuestions.length})`}
                rightIcon={
                  <span className="text-xs text-slate-500 font-semibold">
                    Seçili sınav: <span className="text-slate-800">{selectedExamObj?.title || "-"}</span>
                  </span>
                }
              >
                {examQuestions.length === 0 ? (
                  <EmptyState text="Bu sınavda henüz soru yok." />
                ) : (
                  <div className="space-y-3">
                    {examQuestions.map((q, i) => (
                      <div
                        key={q.id}
                        className="rounded-3xl border border-slate-900/10 bg-white/60 p-5 hover:bg-white/70 transition"
                      >
                        <p className="font-extrabold text-slate-900 mb-2">
                          {i + 1}. {q.question}
                        </p>

                        {q.image_url && (
                          <div className="mb-3">
                            <img
                              src={q.image_url}
                              alt="Soru görseli"
                              className="w-full max-h-48 object-cover rounded-2xl border border-slate-900/10"
                            />
                          </div>
                        )}

                        <div className="text-sm space-y-1 mb-3">
                          <OptionLine active={q.correct === 0} label="A" text={q.option1} />
                          <OptionLine active={q.correct === 1} label="B" text={q.option2} />
                          <OptionLine active={q.correct === 2} label="C" text={q.option3} />
                          <OptionLine active={q.correct === 3} label="D" text={q.option4} />
                          <OptionLine active={q.correct === 4} label="E" text={q.option5} />
                        </div>

                        <div className="flex flex-wrap gap-2">
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
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-slate-900
                                       bg-white/70 border border-slate-900/10 hover:bg-white transition"
                          >
                            <Edit size={16} />
                            Düzenle
                          </button>

                          <button
                            onClick={() => deleteQuestion(q.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-white
                                       bg-gradient-to-r from-red-500 to-rose-500
                                       shadow-[0_10px_30px_rgba(244,63,94,0.18)]
                                       hover:brightness-105 transition"
                          >
                            <Trash2 size={16} />
                            Sil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>

              {/* add/edit question */}
              <GlassCard title={showBulkAdd ? "Toplu Soru Ekle" : editMode ? "Soruyu Düzenle" : "Tekli Soru Ekle"}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  <button
                    onClick={() => {
                      setShowBulkAdd(false);
                      setEditMode(false);
                      setEditQuestionId(null);
                      resetQuestionForm();
                    }}
                    className={`px-4 py-3 rounded-2xl font-bold transition border
                      ${
                        !showBulkAdd
                          ? "text-white bg-gradient-to-r from-emerald-500 to-cyan-500 border-transparent shadow-[0_14px_40px_rgba(16,185,129,0.18)]"
                          : "bg-white/70 border-slate-900/10 text-slate-900 hover:bg-white"
                      }`}
                  >
                    {editMode ? "Düzenleme Modu" : "Tekli Ekle"}
                  </button>

                  <button
                    onClick={() => {
                      setShowBulkAdd(true);
                      setEditMode(false);
                      setEditQuestionId(null);
                      resetQuestionForm();
                    }}
                    className={`px-4 py-3 rounded-2xl font-bold transition border inline-flex items-center justify-center gap-2
                      ${
                        showBulkAdd
                          ? "text-white bg-gradient-to-r from-cyan-500 to-sky-500 border-transparent shadow-[0_14px_40px_rgba(6,182,212,0.18)]"
                          : "bg-white/70 border-slate-900/10 text-slate-900 hover:bg-white"
                      }`}
                  >
                    <ListPlus size={18} />
                    Toplu Ekle
                  </button>
                </div>

                {showBulkAdd ? (
                  <div>
                    <div className="mb-4 rounded-3xl border border-slate-900/10 bg-white/60 p-4">
                      <div className="font-extrabold text-slate-900 mb-2">Format</div>
                      <div className="text-sm text-slate-700 space-y-1">
                        <div>Soru metni?</div>
                        <div>A) Şık 1</div>
                        <div>B) Şık 2</div>
                        <div>C) Şık 3</div>
                        <div>D) Şık 4</div>
                        <div>E) Şık 5</div>
                        <div>
                          <span className="font-bold">B</span> veya <span className="font-bold">Cevap: B</span>
                        </div>
                      </div>
                    </div>

                    <textarea
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      className="w-full h-80 rounded-3xl border border-slate-900/10 bg-white/70 px-4 py-3 font-mono text-sm outline-none
                                 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-300/20 transition"
                      placeholder={
                        "Soruları buraya yapıştırın...\n\n" +
                        "Türkiye'nin başkenti neresidir?\n" +
                        "A) İstanbul\nB) Ankara\nC) İzmir\nD) Antalya\nE) Bursa\nB\n\n" +
                        "İkinci soru..."
                      }
                    />

                    <button
                      onClick={handleBulkAdd}
                      disabled={bulkLoading || !bulkText.trim()}
                      className="mt-3 w-full px-6 py-3 rounded-2xl font-extrabold text-white
                                 bg-gradient-to-r from-cyan-500 to-sky-500
                                 shadow-[0_14px_40px_rgba(6,182,212,0.18)]
                                 hover:brightness-105 transition
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {bulkLoading ? "Ekleniyor..." : "Soruları Ekle"}
                    </button>
                  </div>
                ) : (
                  <>
                    <Label>Soru</Label>
                    <textarea
                      className="w-full rounded-3xl border border-slate-900/10 bg-white/70 px-4 py-3 outline-none mb-4
                                 focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-300/20 transition"
                      placeholder="Soru metni"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      rows={4}
                    />

                    <div className="mb-4">
                      {!imagePreview ? (
                        <label className="flex flex-col items-center justify-center w-full h-36 rounded-3xl cursor-pointer border border-dashed border-slate-900/20 bg-white/60 hover:bg-white/70 transition">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-2xl bg-white/70 border border-slate-900/10 flex items-center justify-center mb-2">
                              <ImageIcon className="w-6 h-6 text-slate-400" />
                            </div>
                            <div className="text-sm text-slate-700 font-semibold">Resim yüklemek için tıkla</div>
                            <div className="text-xs text-slate-500 mt-1">PNG/JPG</div>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                      ) : (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-3xl border border-slate-900/10"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-rose-500 text-white p-2 rounded-2xl shadow-sm hover:brightness-105 transition"
                            title="Kaldır"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 mb-4">
                      <TextInput placeholder="Şık A" value={option1} onChange={setOption1} />
                      <TextInput placeholder="Şık B" value={option2} onChange={setOption2} />
                      <TextInput placeholder="Şık C" value={option3} onChange={setOption3} />
                      <TextInput placeholder="Şık D" value={option4} onChange={setOption4} />
                      <TextInput placeholder="Şık E" value={option5} onChange={setOption5} />
                    </div>

                    <Label>Doğru Cevap</Label>
                    <select
                      className="w-full rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-3 outline-none mb-4
                                 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-300/20 transition"
                      value={correct}
                      onChange={(e) => setCorrect(Number(e.target.value))}
                    >
                      <option value={0}>A</option>
                      <option value={1}>B</option>
                      <option value={2}>C</option>
                      <option value={3}>D</option>
                      <option value={4}>E</option>
                    </select>

                    <button
                      onClick={editMode ? updateQuestion : addQuestion}
                      className="w-full px-6 py-3 rounded-2xl font-extrabold text-white
                                 bg-gradient-to-r from-emerald-500 to-cyan-500
                                 shadow-[0_14px_40px_rgba(16,185,129,0.18)]
                                 hover:brightness-105 transition"
                    >
                      {editMode ? "Düzenlemeyi Kaydet" : "Soru Ekle"}
                    </button>

                    {editMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          setEditQuestionId(null);
                          resetQuestionForm();
                        }}
                        className="mt-2 w-full px-6 py-3 rounded-2xl font-bold text-slate-900
                                   bg-white/70 border border-slate-900/10 hover:bg-white transition"
                      >
                        Düzenlemeyi İptal Et
                      </button>
                    )}
                  </>
                )}
              </GlassCard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
/* ----------------- UI helpers ----------------- */
function GlassCard({ title, rightIcon, children }) {
  return (
    <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-extrabold text-slate-900">{title}</h2>
      
      </div>
      {children}
    </div>
  );
}
function Label({ children }) {
  return <div className="text-sm font-semibold text-slate-800 mb-2">{children}</div>;
}
function TextInput({ placeholder, value, onChange }) {
  return (
    <input
      className="w-full rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-3 outline-none
                 focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-300/20 transition"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
function OptionLine({ active, label, text }) {
  return (
    <div className={`flex gap-2 ${active ? "text-emerald-700 font-bold" : "text-slate-700"}`}>
      <span className="shrink-0">{label})</span>
      <span className="break-words">{text}</span>
    </div>
  );
}
function EmptyState({ text }) {
  return (
    <div className="text-center py-10">
      <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-white/70 border border-slate-900/10 flex items-center justify-center">
        <Upload className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-slate-600 font-semibold">{text}</p>
    </div>
  );
}
export default AdminExams;
