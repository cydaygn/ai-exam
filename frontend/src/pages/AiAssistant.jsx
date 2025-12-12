import { useState, useRef, useEffect } from "react";
import { Bot, User, Sparkles, RefreshCw } from "lucide-react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function AiAssistant() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!isInitialized) initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ai_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.id ?? null;
  };

  const loadSuggestions = async () => {
    try {
      const userId = getUserId();
      const response = await axios.get(`${API_BASE}/api/ai/suggestions`, {
        params: { userId },
      });

      if (response.data.success) {
        setCurrentSuggestions(response.data.suggestions || []);
      }
    } catch (err) {
      console.error("Öneri yükleme hatası:", err);
    }
  };

  const initializeChat = async () => {
    const saved = localStorage.getItem("ai_chat_history");
    if (saved) {
      const history = JSON.parse(saved);
      setMessages(history);

      const lastAiMessage = [...history].reverse().find((m) => m.sender === "ai");
      if (lastAiMessage?.suggestions?.length) {
        setCurrentSuggestions(lastAiMessage.suggestions);
      } else {
        await loadSuggestions();
      }

      setIsInitialized(true);
      return;
    }

    setLoading(true);
    try {
      const userId = getUserId();

      // ilk mesaj: backend greeting
      const response = await axios.post(`${API_BASE}/api/ai/chat`, {
        message: "merhaba",
        userId,
      });

      if (response.data.success) {
        const welcomeMessage = {
          sender: "ai",
          text: response.data.message,
          suggestions: response.data.suggestions || [],
        };
        setMessages([welcomeMessage]);
        setCurrentSuggestions(response.data.suggestions || []);
      } else {
        await loadSuggestions();
      }
    } catch (err) {
      console.error("Başlatma hatası:", err);
      setError("Bağlantı kurulamadı. Sayfayı yenileyin.");
      await loadSuggestions();
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    if (loading) return;

    setError(null);
    setLoading(true);

    // kullanıcı baloncuğu
    const userMessage = { sender: "user", text: suggestion.text };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const userId = getUserId();

      const response = await axios.post(`${API_BASE}/api/ai/chat`, {
        message: suggestion.prompt,
        userId,
      });

      if (response.data.success) {
        const aiResponse = {
          sender: "ai",
          text: response.data.message,
          suggestions: response.data.suggestions || [],
        };

        setMessages((prev) => [...prev, aiResponse]);

        // ✅ her zaman öneri göster
        if (aiResponse.suggestions.length > 0) {
          setCurrentSuggestions(aiResponse.suggestions);
        } else {
          await loadSuggestions();
        }
      } else {
        throw new Error(response.data.error || "Bir hata oluştu");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "AI yanıtı alınamadı";
      setError(errorMessage);

      // hata mesajı
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: `Hata: ${errorMessage}` },
      ]);

      await loadSuggestions();
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    const confirm = window.confirm("Konuşma geçmişini temizlemek istediğinize emin misiniz?");
    if (!confirm) return;

    setMessages([]);
    setCurrentSuggestions([]);
    setIsInitialized(false);
    localStorage.removeItem("ai_chat_history");

    await initializeChat();
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">AI asistan hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="text-yellow-500" />
            Sınav Hazırlık Asistanı
          </h1>
          <p className="text-gray-600 mt-2">
            Sadece baloncuklara tıklayarak ilerleyin.
          </p>
        </div>
        <button
          onClick={handleClearChat}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
        >
          <RefreshCw size={18} />
          Yeni Sohbet
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            ✕
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-[72vh] flex flex-col">
        {/* Mesajlar */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <Bot size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="mb-2">Baloncuklardan birini seçin.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={`flex items-start gap-3 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "ai" && (
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-2.5 shadow-md flex-shrink-0">
                      <Bot size={20} className="text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed shadow-md ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-50 text-gray-800 rounded-bl-none border border-gray-200"
                    }`}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {msg.text}
                  </div>

                  {msg.sender === "user" && (
                    <div className="bg-blue-600 p-2.5 rounded-full shadow-md flex-shrink-0">
                      <User size={20} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-2.5 shadow-md">
                <Bot size={20} className="text-white animate-pulse" />
              </div>
              <div className="bg-gray-50 px-5 py-3 rounded-2xl shadow-md text-gray-600 border border-gray-200">
                Yanıt hazırlanıyor...
              </div>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* Baloncuklar (tek giriş yöntemi) */}
        <div className="border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white px-6 py-4">
          <p className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-yellow-500" />
            Baloncuk seçerek devam edin
          </p>

          <div className="grid grid-cols-2 gap-2">
            {(currentSuggestions || []).map((sug) => (
              <button
                key={sug.id}
                onClick={() => handleSuggestionClick(sug)}
                disabled={loading}
                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm hover:shadow-md text-left disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sug.text}
              </button>
            ))}
          </div>

          {!loading && (!currentSuggestions || currentSuggestions.length === 0) && (
            <div className="mt-3 text-xs text-gray-500">
              Öneriler yüklenemedi. Sayfayı yenileyin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AiAssistant;
