import { Mail, Lock, Eye, EyeOff, Loader, ArrowLeft, Brain, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from '../api';

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
   const res = await axios.post(`${API_URL}/admin/login`, { email, password });


      if (res.data.success) {
        localStorage.setItem("admin", JSON.stringify(res.data.admin));
        localStorage.setItem("adminToken", res.data.token);
        navigate("/admin/dashboard");
      }
    } catch {
      setError("Geçersiz yönetici bilgileri.");
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
          className="px-5 py-2 rounded-xl border border-slate-900/10 text-sm md:text-base
                     bg-white hover:bg-slate-50 shadow-sm transition"
        >
          Öğrenci Girişi
        </Link>
      </nav>

      <main className="relative z-10 px-6 md:px-10 lg:px-16 py-16 md:py-20 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/60 px-4 py-2 text-sm text-slate-700 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Yönetici paneli
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Admin girişi
            </h1>
            <p className="text-slate-700 mt-2">
              Panele erişmek için giriş yap.
            </p>
          </div>

          {/* Admin Login Card */}
          <form
            onSubmit={handleLogin}
            className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl p-8 md:p-10 shadow-sm"
          >
            {error && (
              <div className="mb-6 rounded-xl border border-red-500/20 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Admin e-posta
            </label>
            <div
              className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-3
                         focus-within:border-cyan-400/60 focus-within:ring-4 focus-within:ring-cyan-300/20 transition"
            >
              <Mail className="w-5 h-5 text-cyan-600" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mail.com"
                className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Password */}
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Şifre
            </label>
            <div
              className="mb-8 flex items-center gap-3 rounded-2xl border border-slate-900/10 bg-white/70 px-4 py-3 relative
                         focus-within:border-emerald-400/60 focus-within:ring-4 focus-within:ring-emerald-300/20 transition"
            >
              <Lock className="w-5 h-5 text-emerald-600" />

              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl px-6 py-3 md:py-4 font-bold text-white
                         bg-gradient-to-r from-emerald-500 to-cyan-500
                         shadow-[0_14px_40px_rgba(16,185,129,0.22)]
                         hover:brightness-105 transition
                         disabled:opacity-60 disabled:cursor-not-allowed
                         inline-flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>
        </div>
      </main>

    </div>
  );
}

export default AdminLogin;
