import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader,
  ArrowLeft,
  Brain,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from '../api';
function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const saveRecentEmail = (mail) => {
    const normalized = String(mail || "").trim().toLowerCase();
    if (!normalized) return;

    const saved = JSON.parse(localStorage.getItem("recent_emails") || "[]");
    const arr = Array.isArray(saved) ? saved : [];

    const next = [normalized, ...arr.filter((x) => x !== normalized)].slice(0, 8);
    localStorage.setItem("recent_emails", JSON.stringify(next));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedName = String(name || "").trim();
    const rawPassword = String(password || "");

    const tryLogin = async (attempt = 1) => {
      try {
       const loginRes = await axios.post(`${API_URL}/auth/login`, {
          email: normalizedEmail,
          password: rawPassword,
        });

        if (!loginRes.data?.success) {
          throw new Error(loginRes.data?.message || "Giriş başarısız");
        }

        localStorage.setItem("user", JSON.stringify(loginRes.data.user));
        localStorage.setItem("token", loginRes.data.token);

        saveRecentEmail(normalizedEmail);

        setSuccessMessage("Kayıt başarılı! Oturum açıldı, yönlendiriliyorsun...");
        setTimeout(() => navigate("/student/dashboard"), 300);
        return true;
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "";

        const notFound =
          String(msg).toLowerCase().includes("kullanıcı bulunamadı") ||
          String(msg).toLowerCase().includes("user not found");

        if (notFound && attempt < 4) {
          const delays = [300, 700, 1200];
          await new Promise((r) => setTimeout(r, delays[attempt - 1] || 1200));
          return tryLogin(attempt + 1);
        }

        throw err;
      }
    };

    try {
      // REGISTER
     const regRes = await axios.post(`${API_URL}/auth/register`, {
        name: normalizedName,
        email: normalizedEmail,
        password: rawPassword,
      });

      const ok = regRes.status >= 200 && regRes.status < 300;
      if (!ok) throw new Error("Kayıt başarısız.");

      // AUTO LOGIN
      await tryLogin(1);
    } catch (err) {
      const status = err?.response?.status;

      // bazı durumlarda backend 500 dönse bile kayıt DB’ye yazılmış olabiliyor -> login dene
      if (status >= 500 || !status) {
        try {
          await tryLogin(1);
          return;
        } catch {
          // devam
        }
      }

      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-cyan-200/45 rounded-full blur-3xl" />
        <div className="absolute top-10 right-[-180px] w-[560px] h-[560px] bg-emerald-200/45 rounded-full blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-sky-200/35 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,.18)_1px,transparent_0)] [background-size:26px_26px]" />
      </div>

      <nav className="relative z-20 flex items-center justify-between px-8 md:px-12 py-5 bg-white/65 backdrop-blur-xl border-b border-slate-900/10">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Ana Sayfa
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-md">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl md:text-2xl font-extrabold tracking-wide">
            Edu<span className="text-emerald-600">AI</span>
          </span>
        </div>

        <Link
          to="/login"
          className="px-5 py-2 rounded-xl border border-slate-900/10 text-sm md:text-base bg-white hover:bg-slate-50 shadow-sm transition"
        >
          Giriş Yap
        </Link>
      </nav>

      <main className="relative z-10 px-6 md:px-10 lg:px-16 py-16 md:py-20 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/60 px-4 py-2 text-sm text-slate-700 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Hesap oluştur
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              EduAI’ye kayıt ol
            </h1>
            <p className="text-slate-700 mt-2">
              1 dakikada hesabını oluştur, hemen çalışmaya başla.
            </p>
          </div>

          <form
            onSubmit={handleRegister}
            autoComplete="on"
            className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl p-8 md:p-10 shadow-sm"
          >
            {error && (
              <div className="mb-6 rounded-xl border border-red-500/20 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-50 text-emerald-800 px-4 py-3 text-sm">
                {successMessage}
              </div>
            )}

            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Ad Soyad
            </label>
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-3 focus-within:border-emerald-400/60 focus-within:ring-4 focus-within:ring-emerald-300/20 transition">
              <User className="w-5 h-5 text-emerald-600" />
              <input
                type="text"
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ad Soyad"
                className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <label className="block text-sm font-semibold text-slate-800 mb-2">
              E-posta
            </label>
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-3 focus-within:border-cyan-400/60 focus-within:ring-4 focus-within:ring-cyan-300/20 transition">
              <Mail className="w-5 h-5 text-cyan-600" />
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Şifre
            </label>
            <div className="mb-8 flex items-center gap-3 rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-3 relative focus-within:border-emerald-400/60 focus-within:ring-4 focus-within:ring-emerald-300/20 transition">
              <Lock className="w-5 h-5 text-emerald-600" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 6 karakter"
                className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400 pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-4 text-slate-500 hover:text-slate-900 transition"
                aria-label="Şifreyi göster/gizle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl px-6 py-3 md:py-4 font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_14px_40px_rgba(16,185,129,0.22)] hover:brightness-105 transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Kayıt yapılıyor...
                </>
              ) : (
                "Kayıt Ol"
              )}
            </button>

            <p className="text-center text-sm text-slate-700 mt-6">
              Zaten hesabın var mı?{" "}
              <Link
                to="/login"
                className="font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                Giriş Yap
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Register;
