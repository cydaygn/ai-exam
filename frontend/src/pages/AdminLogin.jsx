import { Mail, Lock, Eye, EyeOff, Loader } from "lucide-react";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", {
        email,
        password,
      });

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
    <>
      <style>{`
        .cyber-grid {
          background-image:
            linear-gradient(#00eaff15 1px, transparent 1px),
            linear-gradient(90deg, #00eaff15 1px, transparent 1px);
          background-size: 45px 45px;
        }
      `}</style>

      <div className="
        relative w-full h-screen flex items-center justify-center
        cyber-grid bg-[radial-gradient(circle_at_center,#003b46_0%,#000_75%)]
        overflow-hidden
      ">
        {/* Glow layers */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(0,255,255,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(0,150,255,0.12),transparent_70%)]" />

        {/* Particles */}
        <Particles
          id="tsparticles"
          init={particlesInit}
          className="absolute inset-0 z-0"
          options={{
            background: { color: "transparent" },
            particles: {
              color: { value: "#00eaff" },
              links: { color: "#00eaff", enable: true, distance: 140, opacity: 0.4 },
              move: { enable: true, speed: 0.6 },
              number: { value: 110 },
              opacity: { value: 0.35 },
              size: { value: 3 },
            },
            interactivity: {
              events: { onHover: { enable: true, mode: "repulse" } },
            },
            fpsLimit: 60,
          }}
        />

        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 z-20 text-cyan-300 hover:text-white text-lg"
        >
          ← ANA SAYFA
        </button>

        {/* Login Card */}
        <form
          onSubmit={handleLogin}
          className="
            relative z-10 w-full max-w-md
            bg-black/40 backdrop-blur-xl 
            border border-cyan-400/40 
            shadow-[0_0_25px_rgba(0,255,255,0.4)]
            rounded-2xl p-10 text-cyan-100
          "
        >
          <h1 className="text-3xl font-bold mb-8 text-center text-cyan-300 tracking-widest">
            ADMIN GİRİŞİ
          </h1>

          {error && (
            <div className="bg-red-600 text-white p-3 rounded mb-4 text-center">
              {error}
            </div>
          )}

          <label className="text-sm text-cyan-200">Admin Email</label>
          <div className="flex items-center gap-3 bg-black/60 p-3 mt-1 mb-5
                          border border-cyan-700 rounded">
            <Mail className="text-cyan-300 w-5 h-5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none text-cyan-100 w-full"
            />
          </div>

          <label className="text-sm text-cyan-200">Şifre</label>
          <div className="flex items-center gap-3 bg-black/60 p-3 mt-1 mb-6 
              border border-cyan-700 rounded relative">
            <Lock className="text-cyan-300 w-5 h-5" />

            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent outline-none text-cyan-100 w-full"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-cyan-300 hover:text-white transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full py-3 bg-cyan-300 text-black font-bold rounded-lg 
              hover:bg-cyan-200 transition flex items-center justify-center
              shadow-[0_0_15px_rgba(0,255,255,0.4)]
            "
          >
            {isLoading ? <Loader className="animate-spin w-6 h-6" /> : "Giriş Yap"}
          </button>
        </form>
      </div>
    </>
  );
}

export default AdminLogin;
