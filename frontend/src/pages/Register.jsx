import { Mail, Lock, User, Eye, EyeOff, Loader } from "lucide-react";
import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });

      if (res.data.success) {
        setSuccessMessage("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.";
      setError(errorMessage);
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

      <div
        className="
          relative w-full h-screen flex items-center justify-center
          overflow-hidden cyber-grid
          bg-[radial-gradient(circle_at_center,_#003b46_0%,_#000_75%)]
        "
      >
        {/* Glow katmanları */}
        <div className="
          absolute inset-0 
          bg-[radial-gradient(circle_at_60%_40%,_rgba(0,255,255,0.18),_transparent_60%)]
        " />
        <div className="
          absolute inset-0 
          bg-[radial-gradient(circle_at_30%_70%,_rgba(0,150,255,0.12),_transparent_70%)]
        " />

        {/* Particles */}
        <Particles
          id="tsparticles"
          init={particlesInit}
          className="absolute inset-0 z-0"
          options={{
            background: { color: "transparent" },
            fpsLimit: 60,
            interactivity: {
              events: { onHover: { enable: true, mode: "repulse" } },
            },
            particles: {
              color: { value: "#00eaff" },
              links: {
                color: "#00eaff",
                distance: 140,
                enable: true,
                opacity: 0.4,
                width: 1,
              },
              move: { enable: true, speed: 0.7 },
              number: { value: 150 },
              opacity: { value: 0.35 },
              shape: { type: "circle" },
              size: { value: 3 },
            },
          }}
        />

        {/* Geri butonu */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 z-20 text-cyan-300 hover:text-white text-lg font-semibold"
        >
          ← ANA SAYFA
        </button>

        {/* Register kartı */}
        <form
          onSubmit={handleRegister}
          autoComplete="off"
          className="
            relative z-10 w-full max-w-md
            bg-black/40 backdrop-blur-xl 
            border border-cyan-400/40 
            shadow-[0_0_25px_rgba(0,255,255,0.4)]
            rounded-2xl p-10 text-cyan-100
            animate-[fadeInUp_0.7s_ease]
          "
        >
          <h1 className="text-3xl font-bold text-center text-cyan-300 mb-8 tracking-widest">
            KAYIT OL
          </h1>

          {error && (
            <div className="bg-red-600 text-white p-3 rounded mb-4 text-center">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-600 text-white p-3 rounded mb-4 text-center">
              {successMessage}
            </div>
          )}

          {/* İsim */}
          <label className="text-sm text-cyan-200">Ad Soyad</label>
          <div className="flex items-center gap-3 bg-black/60 p-3 mt-1 mb-5 border border-cyan-700 rounded">
            <User className="text-cyan-300 w-5 h-5" />
            <input
              type="text"
              required
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent outline-none text-cyan-100 w-full"
            />
          </div>

          {/* Email */}
          <label className="text-sm text-cyan-200">E-posta</label>
          <div className="flex items-center gap-3 bg-black/60 p-3 mt-1 mb-5 border border-cyan-700 rounded">
            <Mail className="text-cyan-300 w-5 h-5" />
            <input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none text-cyan-100 w-full"
            />
          </div>

          {/* Şifre */}
          <label className="text-sm text-cyan-200">Şifre</label>
          <div
            className="
              flex items-center gap-3 bg-black/60 p-3 mt-1 mb-6 
              border border-cyan-700 rounded relative
            "
          >
            <Lock className="text-cyan-300 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent outline-none text-cyan-100 w-full"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 text-cyan-300 hover:text-white transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full py-3 font-bold text-black 
              bg-cyan-300 rounded-lg 
              hover:bg-cyan-200 transition
              shadow-[0_0_15px_rgba(0,255,255,0.4)]
              flex items-center justify-center
            "
          >
            {isLoading ? <Loader className="animate-spin w-6 h-6" /> : "Kayıt Ol"}
          </button>

          <p className="text-center text-cyan-200 mt-6 text-sm">
            Zaten hesabın var mı?{" "}
            <Link
              to="/login"
              className="font-bold text-cyan-300 hover:text-white underline"
            >
              Giriş Yap
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}

export default Register;
