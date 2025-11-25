import { useNavigate, Link } from "react-router-dom";
import {
  Brain,
  TrendingUp,
  Award,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Crown,
} from "lucide-react";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-black via-[#140920] to-black font-sans text-white relative overflow-hidden">
      {/* Özel CSS (neon text + distort animasyonları) */}
      <style>{`
        .hero-neon-text {
          text-shadow:
            0 0 12px rgba(168, 85, 247, 0.8),
            0 0 32px rgba(56, 189, 248, 0.7);
          transition: transform 0.5s ease, text-shadow 0.5s ease;
        }
        .hero-title-wrapper:hover .hero-neon-text {
          transform: perspective(900px) rotateX(6deg) rotateY(-6deg) translateY(-4px);
          text-shadow:
            0 0 18px rgba(168, 85, 247, 1),
            0 0 40px rgba(56, 189, 248, 1);
        }
        @keyframes pulseGlowLogo {
          0%, 100% {
            filter: drop-shadow(0 0 6px rgba(129, 140, 248, 0.9));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 14px rgba(244, 114, 182, 0.9));
            transform: scale(1.06);
          }
        }
        .logo-glow {
          animation: pulseGlowLogo 2.4s ease-in-out infinite;
        }
      `}</style>

      {/* Arka plan neon blur / grid hissi */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-[-100px] w-[420px] h-[420px] bg-cyan-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_0_0,#4c1d95_0,transparent_55%),radial-gradient(circle_at_100%_100%,#06b6d4_0,transparent_55%)]" />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-20 flex items-center justify-between px-8 md:px-12 py-5 bg-black/40 backdrop-blur-xl border-b border-fuchsia-500/30 shadow-[0_0_25px_rgba(217,70,239,0.35)]">
        <div className="flex items-center gap-3">
          <div className="logo-glow">
            <Brain className="w-9 h-9 text-indigo-300" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wider">
            Edu<span className="text-fuchsia-300">AI</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <Link
            to="/admin/login"
            className="text-sm md:text-base text-gray-200 hover:text-fuchsia-200 transition"
          >
            Yönetici Girişi
          </Link>

          <button
            onClick={() => navigate("/login")}
            className="hidden sm:inline-flex px-5 py-2 rounded-lg border border-cyan-400/60 text-sm md:text-base
                       bg-white/5 hover:bg-cyan-400/10 hover:border-cyan-300
                       shadow-[0_0_14px_rgba(34,211,238,0.35)] transition"
          >
            Giriş Yap
          </button>

          <button
            onClick={() => navigate("/register")}
            className="px-5 md:px-6 py-2 bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-300
                       text-sm md:text-base text-black font-bold rounded-lg
                       shadow-[0_0_22px_rgba(168,85,247,0.9)]
                       hover:brightness-110 transition"
          >
            Kayıt Ol
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 md:px-10 lg:px-16 py-20 md:py-24">
        <div className="hero-title-wrapper max-w-4xl mx-auto">
          <h1 className="hero-neon-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-fuchsia-300 via-purple-200 to-cyan-300 bg-clip-text text-transparent">
            Yapay Zeka ile
            <br />
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              Sınavlara Bir Üst Seviyeden Hazırlan
            </span>
          </h1>
        </div>

        <p className="text-base md:text-lg text-gray-200/90 max-w-3xl mb-10 md:mb-12">
          Kişiselleştirilmiş sınavlar, yapay zeka destekli açıklamalar ve detaylı başarı
          analiziyle çalışma sürecini daha verimli, hızlı ve akıllı hale getir.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <button
            onClick={() => navigate("/register")}
            className="group px-9 md:px-10 py-3 md:py-4 text-lg font-bold
                       bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400
                       text-black rounded-xl
                       shadow-[0_0_28px_rgba(168,85,247,0.9)]
                       hover:shadow-[0_0_36px_rgba(56,189,248,1)]
                       transition flex items-center gap-3"
          >
            Hemen Başla
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 rounded-xl border border-fuchsia-400/60 text-fuchsia-100
                       bg-white/5 hover:bg-fuchsia-500/10
                       shadow-[0_0_18px_rgba(217,70,239,0.55)]
                       text-sm md:text-base transition"
          >
            Hesabım Var, Giriş Yap
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 px-6 md:px-10 lg:px-16 py-16 md:py-20">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-12 md:mb-14">
          Öne Çıkan Özellikler
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Sparkles className="w-14 h-14 text-fuchsia-300" />}
            title="Yapay Zeka Destekli"
            desc="Sana özel zorluk seviyeleri, soru önerileri ve akıllı sınav kurguları ile çalışmalarını optimize et."
          />
          <FeatureCard
            icon={<TrendingUp className="w-14 h-14 text-cyan-300" />}
            title="Gelişim Analizi"
            desc="Konu bazlı başarı grafikleri, zamana göre performans değişimi ve detaylı sınav raporları."
          />
          <FeatureCard
            icon={<Award className="w-14 h-14 text-purple-300" />}
            title="Anında Geri Bildirim"
            desc="Her soru için yapay zeka tarafından yazılmış açıklayıcı çözüm ve strateji önerileri."
          />
        </div>
      </section>

      {/* PREMIUM SECTION */}
      <section className="relative z-10 px-6 md:px-10 lg:px-16 py-18 md:py-20 bg-white/5 backdrop-blur-2xl border-y border-white/10">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-center">
          Neden EduAI?
        </h2>
        <p className="text-base md:text-lg text-gray-200/90 max-w-2xl mx-auto mb-12 text-center">
          Sadece test çözdüren bir sistem değil; seni tanıyan, hedeflerini anlayan ve
          çalışma sürecini akıllıca yöneten bir sınav koçluğu platformu.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
          <InfoCard
            icon={<Crown className="w-12 h-12 text-yellow-300" />}
            title="Premium Deneyim"
            desc="Modern, hızlı, reklam karmaşasından uzak ve tamamen eğitim odaklı arayüz."
          />
          <InfoCard
            icon={<ShieldCheck className="w-12 h-12 text-emerald-300" />}
            title="Güvenli & Hızlı"
            desc="Verilerin güvenli şekilde saklanır, sınav sonuçların sadece sana özeldir."
          />
          <InfoCard
            icon={<Brain className="w-12 h-12 text-sky-300" />}
            title="Akıllı Öneri Sistemi"
            desc="Zayıf olduğun konuları tespit eder, tekrar etmen gereken alanları sana önerir."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 md:px-10 lg:px-16 py-18 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6">
          Hedeflerin İçin Hazırsan, Başlayalım
        </h2>
        <p className="text-base md:text-lg text-gray-200/90 max-w-2xl mx-auto mb-10">
          Deneme sınavlarını, konu analizlerini ve yapay zeka desteğini tek bir yerde topla.
          Bugün başla, farkı ilk haftada hisset.
        </p>

        <button
          onClick={() => navigate("/register")}
          className="px-10 md:px-12 py-4 md:py-5 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400
                     text-black font-bold text-lg md:text-2xl rounded-xl
                     shadow-[0_0_32px_rgba(168,85,247,0.95)]
                     hover:brightness-110 transition"
        >
          Ücretsiz Başla
        </button>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 text-center py-6 text-gray-400 border-t border-white/10 text-sm">
        © 2025 EduAI Platform · Tüm Hakları Saklıdır
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-fuchsia-400/30 rounded-2xl p-8 text-center 
                    hover:border-cyan-300/60 hover:shadow-[0_0_24px_rgba(56,189,248,0.6)] 
                    hover:-translate-y-1 transition">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl md:text-2xl font-bold mb-3">{title}</h3>
      <p className="text-gray-200 text-sm md:text-base">{desc}</p>
    </div>
  );
}

function InfoCard({ icon, title, desc }) {
  return (
    <div className="bg-black/40 border border-white/15 rounded-2xl p-7 md:p-8 shadow-lg backdrop-blur-xl 
                    hover:bg-white/5 hover:border-cyan-300/40 transition">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-lg md:text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-300 text-sm md:text-base">{desc}</p>
    </div>
  );
}

export default LandingPage;
