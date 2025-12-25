import { useEffect, useRef, useState } from "react";
import { Bot, User, Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { API_URL } from "../api";

function AiAssistant() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const chatScrollRef = useRef(null);

  const getChatKey = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return `ai_chat_history_${user?.id || "guest"}`;
  };

  const getUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      return user?.id ?? null;
    } catch {
      return null;
    }
  };

  // Auto-scroll
  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Save to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(getChatKey(), JSON.stringify(messages));
    }
  }, [messages]);

  // Initialize chat
  useEffect(() => {
    if (!isInitialized) initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  const loadInitialSuggestions = async () => {
    try {
      const userId = getUserId();
      const response = await axios.get(`${API_URL}/ai/suggestions`, {
        params: { userId, context: "initial" },
      });
      if (response.data?.success) {
        setCurrentSuggestions(response.data.suggestions || []);
      }
    } catch (err) {
      console.error("Öneri yükleme hatası:", err);
      setCurrentSuggestions([
        { id: "1", text: "📊 Son sınavımı analiz et", prompt: "Son sınavımı detaylı analiz et" },
        { id: "2", text: "📚 Hangi konuya çalışmalıyım?", prompt: "Zayıf olduğum konuları belirle" },
        { id: "3", text: "📝 Çalışma planı oluştur", prompt: "Bana detaylı çalışma planı hazırla" },
      ]);
    }
  };

  const initializeChat = async () => {
    const saved = localStorage.getItem(getChatKey());

    if (saved) {
      try {
        const history = JSON.parse(saved);
        setMessages(history);

        const lastAi = [...history].reverse().find((m) => m.sender === "ai");
        if (lastAi?.suggestions?.length) {
          setCurrentSuggestions(lastAi.suggestions);
        } else {
          await loadInitialSuggestions();
        }

        setIsInitialized(true);
        return;
      } catch (err) {
        console.error("Geçmiş yükleme hatası:", err);
        localStorage.removeItem(getChatKey());
      }
    }

    setLoading(true);
    try {
      await loadInitialSuggestions();

      const welcome = {
        sender: "ai",
        text:
          "Merhaba! 👋\n\nSınav hazırlığında sana yardımcı olmak için buradayım. Aşağıdaki baloncuklardan birini seçerek başlayabilirsin:",
        suggestions: [],
      };
      setMessages([welcome]);
    } catch (err) {
      console.error("Başlatma hatası:", err);
      setError("Bağlantı kurulamadı. Sayfayı yenileyin.");
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    if (loading || cooldown > 0) return;

    setError(null);
    setLoading(true);

    const userMessage = { sender: "user", text: suggestion.text };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const userId = getUserId();

      const response = await axios.post(`${API_URL}/ai/chat`, {
        message: suggestion.prompt,
        userId,
        conversationHistory: messages.slice(-10),
      });

      if (!response.data?.success) {
        throw new Error(response.data?.error || "Bir hata oluştu");
      }

      const aiResponse = {
        sender: "ai",
        text: response.data.message,
        suggestions: response.data.suggestions || [],
      };

      setMessages((prev) => [...prev, aiResponse]);

      if (aiResponse.suggestions.length > 0) {
        setCurrentSuggestions(aiResponse.suggestions);
      } else {
        await loadInitialSuggestions();
      }
    } catch (err) {
      const status = err.response?.status;

      if (status === 429) {
        const retryAfter =
          Number(err.response?.data?.retryAfter) ||
          Number(err.response?.headers?.["retry-after"]) ||
          30;

        setCooldown(retryAfter);
        setError(`⏳ Çok hızlısın! ${retryAfter} saniye bekle.`);

        setMessages((prev) => prev.slice(0, -1));
        setLoading(false);
        return;
      }

      const msg = err.response?.data?.error || err.message || "AI yanıtı alınamadı";
      setError(msg);

      const errorResponse = {
        sender: "ai",
        text: `❌ Üzgünüm, bir hata oluştu: ${msg}\n\nLütfen tekrar dene veya başka bir seçenek dene.`,
        suggestions: [],
      };
      setMessages((prev) => [...prev, errorResponse]);

      await loadInitialSuggestions();
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    const confirm = window.confirm(
      "Konuşma geçmişini temizlemek istediğine emin misin?\n\nBu işlem geri alınamaz."
    );
    if (!confirm) return;

    setMessages([]);
    setCurrentSuggestions([]);
    setIsInitialized(false);
    setCooldown(0);
    setError(null);
    localStorage.removeItem(getChatKey());

    await initializeChat();
  };

  const PageBackground = () => (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-cyan-200/45 rounded-full blur-3xl" />
      <div className="absolute top-10 right-[-180px] w-[560px] h-[560px] bg-emerald-200/45 rounded-full blur-3xl" />
      <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-sky-200/35 rounded-full blur-3xl" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,.18)_1px,transparent_0)] [background-size:26px_26px]" />
    </div>
  );

  if (!isInitialized) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative antialiased">
        <PageBackground />
        <div className="relative z-10 min-h-screen grid place-items-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-900/10 bg-white/65 backdrop-blur-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 animate-pulse" />
              <div className="flex-1">
                <div className="h-3 w-40 rounded bg-slate-200 animate-pulse mb-2" />
                <div className="h-3 w-56 rounded bg-slate-200 animate-pulse" />
              </div>
            </div>
            <div className="mt-6 h-10 rounded-xl bg-slate-200 animate-pulse" />
            <p className="mt-4 text-sm text-slate-600">AI asistan hazırlanıyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative antialiased">
      <PageBackground />

      <div className="relative z-10">
        {/* HEADER */}
        <div className="mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between gap-3 bg-white/65 backdrop-blur-xl rounded-2xl px-4 sm:px-6 py-4 shadow-sm border border-slate-900/10">
            <div className="min-w-0 flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white flex items-center justify-center shadow-sm">
                <Sparkles size={18} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 truncate">
                  Sınav Hazırlık Asistanı
                </h1>
                <p className="text-xs sm:text-sm text-slate-700 mt-1">
                  Baloncuklara tıklayarak ilerle, yazı yazmana gerek yok 💬
                </p>
              </div>
            </div>

            <button
              onClick={handleClearChat}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-slate-900/10 bg-white/70 px-3 sm:px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-white transition"
              title="Sohbeti sıfırla"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Yeni Sohbet</span>
            </button>
          </div>

          {/* ERROR BANNER */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50/80 backdrop-blur px-4 py-3 text-sm text-red-700 flex items-start justify-between gap-3 shadow-sm">
              <div className="flex gap-2">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <span className="leading-relaxed">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="rounded-lg px-2 py-1 hover:bg-red-100 shrink-0"
                aria-label="Hata mesajını kapat"
              >
                ✕
              </button>
            </div>
          )}

          {/* CHAT CONTAINER */}
          <div className="mt-4 rounded-2xl border border-slate-900/10 bg-white/65 backdrop-blur-xl shadow-sm overflow-hidden">
            <div className="h-[72vh] sm:h-[78vh] flex flex-col">
              {/* MESSAGES AREA */}
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
                {messages.length === 0 ? (
                  <div className="h-full grid place-items-center text-center">
                    <div className="max-w-sm">
                      <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white flex items-center justify-center shadow-sm">
                        <Bot size={26} />
                      </div>
                      <p className="font-extrabold text-slate-900 text-lg">Baloncuklardan birini seç</p>
                      <p className="text-sm text-slate-700 mt-2">Yazı yazmana gerek yok, baloncuklarla akış ilerler 🎈</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isUser = msg.sender === "user";
                    return (
                      <div key={i} className={`flex items-end gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                        {!isUser && (
                          <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm shrink-0">
                            <Bot size={16} />
                          </div>
                        )}

                        {/* MESSAGE BUBBLE (Sadece AI için markdown + daha iyi tipografi) */}
                        <div
                          className={[
                            "px-4 py-3 text-sm leading-relaxed shadow-sm rounded-2xl",
                            isUser
                              ? "bg-slate-900 text-white"
                              : "bg-white/70 text-slate-800 border border-slate-900/10",
                            "max-w-[78%] sm:max-w-[70%]",
                            !isUser && "prose prose-slate prose-sm max-w-none",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {isUser ? (
                            <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>
                          ) : (
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          )}
                        </div>

                        {isUser && (
                          <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm shrink-0">
                            <User size={16} />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* LOADING INDICATOR */}
                {loading && (
                  <div className="flex items-end gap-3 justify-start">
                    <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-3 shadow-sm">
                      <div className="flex gap-2">
                        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                      </div>
                      <p className="text-xs text-slate-600 mt-2">Düşünüyorum...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* SUGGESTIONS BAR */}
              <div className="border-t border-slate-900/10 bg-white/60 px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-slate-700">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/70 text-slate-900 border border-slate-900/10">
                      <Sparkles size={14} />
                    </span>
                    DEVAM SEÇENEKLERİ
                  </div>

                  {cooldown > 0 ? (
                    <div className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                      ⏳ {cooldown}s
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600">Tıklayarak ilerle</div>
                  )}
                </div>

                {currentSuggestions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentSuggestions.map((sug) => (
                      <button
                        key={sug.id}
                        onClick={() => handleSuggestionClick(sug)}
                        disabled={loading || cooldown > 0}
                        className={[
                          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                          "border border-slate-900/10 bg-white/70 text-slate-900",
                          "hover:bg-white hover:shadow-md hover:scale-105",
                          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                        ].join(" ")}
                      >
                        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
                        <span className="text-left">{sug.text}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                    Öneriler yüklenemedi. Sayfayı yenile veya yeni sohbet başlat.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER NOTE */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-600">
              💡 <strong>İpucu:</strong> Her yanıttan sonra, devam etmek için yeni baloncuklar belirir
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiAssistant;
