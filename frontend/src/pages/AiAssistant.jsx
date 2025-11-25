import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";

function AiAssistant() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Merhaba! Nasıl yardımcı olabilirim?" }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const aiResponse = {
        sender: "ai",
        text: `Bunu şöyle açıklayabilirim: "${userMessage.text}".`
      };
      setMessages((prev) => [...prev, aiResponse]);
      setLoading(false);
    }, 900);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">AI Asistan</h1>

      <div className="bg-white rounded-xl shadow p-4 h-[75vh] flex flex-col">

        {/* Mesajlar */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="bg-gray-200 rounded-full p-2">
                  <Bot size={20} className="text-gray-700" />
                </div>
              )}

              <div
                className={`max-w-[70%] p-3 rounded-2xl text-sm leading-relaxed shadow ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>

              {msg.sender === "user" && (
                <div className="bg-blue-600 p-2 rounded-full">
                  <User size={20} className="text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gray-200 rounded-full p-2">
                <Bot size={20} className="text-gray-700" />
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-2xl shadow text-gray-600">
                Yazıyor...
              </div>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* Input */}
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="Mesaj yaz…"
            className="flex-1 border p-3 rounded-xl bg-gray-50 shadow-inner outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 transition flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </div>

      </div>
    </div>
  );
}

export default AiAssistant;
