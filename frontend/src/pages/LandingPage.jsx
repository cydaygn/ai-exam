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
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative overflow-hidden">
      {/* Arka plan soft glow + hafif grid */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-cyan-200/45 rounded-full blur-3xl" />
        <div className="absolute top-10 right-[-180px] w-[560px] h-[560px] bg-emerald-200/45 rounded-full blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-sky-200/35 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,.18)_1px,transparent_0)] [background-size:26px_26px]" />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-20 flex items-center justify-between px-8 md:px-12 py-5 bg-white/65 backdrop-blur-xl border-b border-slate-900/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-md">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">
            Edu<span className="text-emerald-600">AI</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <Link
            to="/admin/login"
            className="text-sm md:text-base text-slate-700 hover:text-slate-900 transition"
          >
            Yönetici
          </Link>

          <button
            onClick={() => navigate("/login")}
            className="hidden sm:inline-flex px-5 py-2 rounded-xl border border-slate-900/10 text-sm md:text-base
                       bg-white hover:bg-slate-50
                       shadow-sm transition"
          >
            Giriş Yap
          </button>

          <button
            onClick={() => navigate("/register")}
            className="px-5 md:px-6 py-2 rounded-xl text-sm md:text-base font-bold text-white
                       bg-gradient-to-r from-emerald-500 to-cyan-500
                       shadow-[0_10px_30px_rgba(6,182,212,0.25)]
                       hover:brightness-105 transition"
          >
            Kayıt Ol
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 md:px-10 lg:px-16 py-20 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/60 px-4 py-2 text-sm text-slate-700 mb-6">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Yapay zeka destekli sınav koçluğu
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
            Yapay Zeka ile
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Sınavlara Akıllıca Hazırlan
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-700 max-w-3xl mx-auto mb-10 md:mb-12">
            Kişiselleştirilmiş denemeler, yapay zeka destekli açıklamalar ve konu bazlı
            analizlerle çalışma sürecini daha verimli hale getir.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <button
              onClick={() => navigate("/register")}
              className="group px-9 md:px-10 py-3 md:py-4 text-lg font-bold
                         bg-gradient-to-r from-emerald-500 to-cyan-500
                         text-white rounded-2xl
                         shadow-[0_14px_40px_rgba(16,185,129,0.25)]
                         hover:brightness-105 transition flex items-center gap-3"
            >
              Hemen Başla
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 rounded-2xl border border-slate-900/10 text-slate-900
                         bg-white/70 hover:bg-white
                         shadow-sm text-sm md:text-base transition"
            >
              Hesabım Var, Giriş Yap
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 px-6 md:px-10 lg:px-16 py-16 md:py-20">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-12 md:mb-14">
          Öne Çıkan Özellikler
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Sparkles className="w-12 h-12 text-emerald-600" />}
            title="Yapay Zeka Destekli"
            desc="Sana özel zorluk seviyeleri, soru önerileri ve akıllı sınav kurguları ile çalışmanı optimize et."
          />
          <FeatureCard
            icon={<TrendingUp className="w-12 h-12 text-cyan-600" />}
            title="Gelişim Analizi"
            desc="Konu bazlı başarı takibi, performans değişimi ve detaylı sınav raporları."
          />
          <FeatureCard
            icon={<Award className="w-12 h-12 text-sky-600" />}
            title="Anında Geri Bildirim"
            desc="Her soru için anlaşılır çözüm, açıklama ve strateji önerileri."
          />
        </div>
      </section>

      {/* INFO SECTION */}
      <section className="relative z-10 px-6 md:px-10 lg:px-16 py-18 md:py-20 bg-white/55 backdrop-blur-2xl border-y border-slate-900/10">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-center">
          Neden EduAI?
        </h2>
        <p className="text-base md:text-lg text-slate-700 max-w-2xl mx-auto mb-12 text-center">
          Sadece test çözdüren bir sistem değil; seni tanıyan, hedeflerini anlayan ve
          çalışma sürecini akıllıca yöneten bir sınav koçluğu platformu.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
          <InfoCard
            icon={<Crown className="w-11 h-11 text-amber-500" />}
            title="Sade ve Hızlı"
            desc="Modern, hızlı ve dikkat dağıtmayan bir deneyim."
          />
          <InfoCard
            icon={<ShieldCheck className="w-11 h-11 text-emerald-600" />}
            title="Güvenli"
            desc="Verilerin güvenli saklanır, sonuçların yalnızca sana özeldir."
          />
          <InfoCard
            icon={<Brain className="w-11 h-11 text-cyan-600" />}
            title="Akıllı Öneriler"
            desc="Zayıf konuları tespit eder, tekrar etmen gereken alanları önerir."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 md:px-10 lg:px-16 py-18 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6">
          Hazırsan, başlayalım
        </h2>
        <p className="text-base md:text-lg text-slate-700 max-w-2xl mx-auto mb-10">
          Denemeleri, konu analizlerini ve yapay zeka desteğini tek bir yerde topla.
        </p>

        <button
          onClick={() => navigate("/register")}
          className="px-10 md:px-12 py-4 md:py-5 rounded-2xl
                     bg-gradient-to-r from-emerald-500 to-cyan-500
                     text-white font-bold text-lg md:text-2xl
                     shadow-[0_18px_55px_rgba(6,182,212,0.25)]
                     hover:brightness-105 transition"
        >
          Ücretsiz Başla
        </button>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div
      className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-2xl p-8 text-center
                 shadow-sm hover:shadow-md hover:-translate-y-1 transition"
    >
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl md:text-2xl font-bold mb-3">{title}</h3>
      <p className="text-slate-700 text-sm md:text-base">{desc}</p>
    </div>
  );
}

function InfoCard({ icon, title, desc }) {
  return (
    <div
      className="bg-white/70 border border-slate-900/10 rounded-2xl p-7 md:p-8 shadow-sm backdrop-blur-xl
                 hover:bg-white hover:shadow-md transition"
    >
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-lg md:text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-700 text-sm md:text-base">{desc}</p>
    </div>
  );
}

export default LandingPage;
