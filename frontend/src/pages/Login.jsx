import { Mail, Lock, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [recentEmails, setRecentEmails] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("recent_emails")) || [];
    setRecentEmails(saved);
  }, []);

  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      if (res.data.success) {
        const saved = JSON.parse(localStorage.getItem("recent_emails")) || [];
        if (!saved.includes(email)) {
          saved.push(email);
          localStorage.setItem("recent_emails", JSON.stringify(saved));
        }

        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);

        navigate("/student/dashboard");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Giriş bilgileri hatalı!";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* STUDENT LOGIN ÖZEL GRID */}
      <style>{`
        .student-grid {
          background-image:
            linear-gradient(#ff77ff20 1px, transparent 1px),
            linear-gradient(90deg, #ff77ff20 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      <div
        className="
          relative w-full h-screen overflow-hidden 
          flex items-center justify-center 
          student-grid
     bg-[radial-gradient(circle_at_center,_#fff1d6_0%,_#ffe0b8_50%,_#ffd1a6_100%)]

        "
      >
        {/* Glow Fog Layers */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,_rgba(255,0,255,0.18),_transparent_65%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,_rgba(255,120,255,0.12),_transparent_75%)]"></div>

        {/* Particle Background - Pink Theme */}
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
              color: { value: "#ff77ff" },
              links: {
                color: "#ff77ff",
                distance: 130,
                enable: true,
                opacity: 0.35,
                width: 1,
              },
              move: { enable: true, speed: 0.7 },
              number: { value: 120 },
              opacity: { value: 0.33 },
              shape: { type: "circle" },
              size: { value: 3 },
            },
          }}
        />

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="
            absolute top-6 left-6 z-20 
            text-pink-300 hover:text-white 
            text-lg font-semibold
          "
        >
          ← ANA SAYFA
        </button>

        {/* LOGIN CARD */}
        <form
          onSubmit={handleLogin}
          className="
            relative z-10 w-full max-w-lg 
            bg-black/40 backdrop-blur-2xl 
            border border-pink-400/40 
            shadow-[0_0_25px_rgba(255,0,255,0.4)]
            rounded-3xl p-10 
            text-pink-100 
            animate-[fadeInUp_0.7s_ease]
          "
        >
          <h1 className="text-4xl font-extrabold text-center text-pink-300 mb-8 tracking-wider">
            Öğrenci Girişi
          </h1>

          {error && (
            <div className="bg-red-600/80 text-white p-3 rounded-lg text-center font-medium mb-6">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="
            bg-white/10 p-4 rounded-xl 
            flex items-center gap-3 mb-6 
            border border-pink-400/20
            focus-within:border-pink-300 
            transition
          ">
            <Mail className="text-pink-300 w-6 h-6" />
            <input
              type="email"
              list="savedEmails"
              placeholder="E-posta"
              value={email}
              required
              className="bg-transparent text-white placeholder-pink-200/70 text-lg outline-none w-full"
              onChange={(e) => setEmail(e.target.value)}
            />

            <datalist id="savedEmails">
              {recentEmails.map((mail, index) => (
                <option key={index} value={mail} />
              ))}
            </datalist>
          </div>

          {/* Password */}
          <div className="
            bg-white/10 p-4 rounded-xl 
            flex items-center gap-3 mb-8
            border border-pink-400/20
            focus-within:border-pink-300 
            transition
          ">
            <Lock className="text-pink-300 w-6 h-6" />
            <input
              type="password"
              placeholder="Şifre"
              value={password}
              required
              className="bg-transparent text-white placeholder-pink-200/70 text-lg outline-none w-full"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full py-4 
              bg-pink-300 text-black font-extrabold text-xl
              rounded-xl shadow-[0_0_18px_rgba(255,0,255,0.5)]
              hover:bg-pink-200 transition
              flex items-center justify-center
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {isLoading ? <Loader className="animate-spin w-6 h-6" /> : "Giriş Yap"}
          </button>

          <p className="text-center text-pink-200/80 mt-6 text-sm">
            Hesabın yok mu?{" "}
            <Link
              to="/register"
              className="font-bold text-pink-300 hover:text-white underline"
            >
              Kayıt Ol
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}

export default Login;
