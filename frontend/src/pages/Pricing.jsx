import { useEffect, useMemo, useState } from "react";
import {
  Check,
  X,
  Crown,
  Sparkles,
  Zap,
  Brain,
  Shield,
  CreditCard,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api";

function Pricing() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [user, setUser] = useState(null);

  // kart formu
  const [card, setCard] = useState({
    name: "",
    number: "",
    exp: "",
    cvc: "",
  });

  // hata mesajları (kırmızı border + yazı)
  const [fieldErr, setFieldErr] = useState({
    name: "",
    number: "",
    exp: "",
    cvc: "",
  });

  // kullanıcı inputa dokunmadan hata gösterme
  const [touched, setTouched] = useState({
    name: false,
    number: false,
    exp: false,
    cvc: false,
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(userData);
  }, [navigate]);

  const plan = user?.plan || "free";
  const isPlus = plan === "plus";

  // ---------- helpers ----------
  const digitsOnly = (v) => String(v || "").replace(/\D/g, "");

  // 16 rakam max, ekranda 19 karakter (boşluklarla)
  const formatCardNumber = (value) => {
    const digits = digitsOnly(value).slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  // MMYY -> MM/YY (kullanıcı / koymaz)
  const formatExp = (value) => {
    const digits = digitsOnly(value).slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  // CVC sadece 3 rakam
  const formatCvc = (value) => digitsOnly(value).slice(0, 3);

  const validateFields = (nextCard) => {
    const name = String(nextCard.name || "").trim();
    const numberDigits = digitsOnly(nextCard.number);
    const exp = String(nextCard.exp || "").trim();
    const cvcDigits = digitsOnly(nextCard.cvc);

    const errs = { name: "", number: "", exp: "", cvc: "" };

    // İsim: kullanıcı bir şey yazdıysa validasyon yap
    if (!name) errs.name = "Kart üzerindeki isim zorunlu.";

    // Kart no: 16 rakam
    if (numberDigits.length !== 16) errs.number = "Kart numarası 16 haneli olmalı.";

    // SKT: MM/YY ve geçmiş olamaz
    if (!/^\d{2}\/\d{2}$/.test(exp)) {
      errs.exp = "SKT formatı AA/YY olmalı (örn: 12/29).";
    } else {
      const [mmStr, yyStr] = exp.split("/");
      const mm = parseInt(mmStr, 10);
      const yy = parseInt(yyStr, 10);

      if (mm < 1 || mm > 12) errs.exp = "SKT ay (AA) 01-12 arası olmalı.";

      if (!errs.exp) {
        const now = new Date();
        const curYY = now.getFullYear() % 100;
        const curMM = now.getMonth() + 1;

        if (yy < curYY || (yy === curYY && mm < curMM)) {
          errs.exp = "Kartın son kullanma tarihi geçmiş olamaz.";
        }
      }
    }

    // CVC: 3 rakam
    if (cvcDigits.length !== 3) errs.cvc = "CVC 3 haneli olmalı.";

    const ok = !errs.name && !errs.number && !errs.exp && !errs.cvc;
    return { ok, errs };
  };

  // yalnızca dokunulan alanda hata göster (ilk açılışta boş)
  const liveValidateForUI = (nextCard, nextTouched = touched) => {
    const { errs } = validateFields(nextCard);
    setFieldErr({
      name: nextTouched.name ? errs.name : "",
      number: nextTouched.number ? errs.number : "",
      exp: nextTouched.exp ? errs.exp : "",
      cvc: nextTouched.cvc ? errs.cvc : "",
    });
  };

  const markTouched = (key) => {
    const nextTouched = { ...touched, [key]: true };
    setTouched(nextTouched);
    liveValidateForUI(card, nextTouched);
  };

  const canPay = useMemo(() => validateFields(card).ok, [card]);

  // ---------- handlers ----------
  const handleNameChange = (e) => {
    const next = { ...card, name: e.target.value };
    setCard(next);
    if (touched.name) liveValidateForUI(next);
  };

  const handleCardNumberChange = (e) => {
    const next = { ...card, number: formatCardNumber(e.target.value) };
    setCard(next);
    if (touched.number) liveValidateForUI(next);
  };

  const handleExpChange = (e) => {
    const next = { ...card, exp: formatExp(e.target.value) };
    setCard(next);
    if (touched.exp) liveValidateForUI(next);
  };

  const handleCvcChange = (e) => {
    const next = { ...card, cvc: formatCvc(e.target.value) };
    setCard(next);
    if (touched.cvc) liveValidateForUI(next);
  };

  const openPayment = () => {
    setPayOpen(true);
    setLoading(false);

    // modal açılınca hiç hata gösterme
    setTouched({ name: false, number: false, exp: false, cvc: false });
    setFieldErr({ name: "", number: "", exp: "", cvc: "" });

    // istersen burada kartı resetle:
    setCard({ name: "", number: "", exp: "", cvc: "" });
  };

  const closePayment = () => {
    if (loading) return;
    setPayOpen(false);
  };

  const handleUpgrade = async () => {
    if (!user) return;

    // Onayla'ya basınca tüm alanları touched yap ve hataları göster
    const allTouched = { name: true, number: true, exp: true, cvc: true };
    setTouched(allTouched);

    const v = validateFields(card);
    setFieldErr(v.errs);

    if (!v.ok) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/user/${user.id}/upgrade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "plus" }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Yükseltme başarısız");
      }

      const updatedUser = { ...user, plan: "plus" };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setPayOpen(false);
      alert("🎉 Ödeme onaylandı! Plus aktif.");
      navigate("/student/dashboard");
    } catch (e) {
      alert("Bir hata oluştu: " + (e?.message || "Bilinmeyen hata"));
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:ring-2";
  const okBorder = "border-slate-900/10 focus:ring-emerald-200";
  const errBorder = "border-red-500 focus:ring-red-200";

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 flex items-center justify-center">
        <div className="text-slate-700 font-semibold">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-900/10 mb-4">
            
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Senin için en uygun planı seç
            </span>
          </h1>

          <p className="text-lg text-slate-700 max-w-2xl mx-auto">
            Yapay zeka destekli öğrenme deneyimi için Plus&apos;a geç
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold">Ücretsiz</h3>
                <p className="text-sm text-slate-600">Temel özellikler</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold">₺0</span>
                <span className="text-slate-600">/ay</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <Feature icon={<Check className="w-5 h-5" />} text="Sınırsız test çözme" included />
              <Feature icon={<Check className="w-5 h-5" />} text="Temel istatistikler" included />
              <Feature icon={<Check className="w-5 h-5" />} text="Performans takibi" included />
              <Feature icon={<X className="w-5 h-5" />} text="AI destekli analiz" />
              <Feature icon={<X className="w-5 h-5" />} text="Akıllı soru önerileri" />
              <Feature icon={<X className="w-5 h-5" />} text="Kişiselleştirilmiş öğrenme" />
            </ul>

            <button
              disabled
              className={`w-full py-3 rounded-2xl font-bold border transition ${
                isPlus
                  ? "text-white bg-slate-700 border-slate-700"
                  : "text-slate-600 bg-slate-100 border-slate-200 cursor-not-allowed"
              }`}
            >
              {isPlus ? "Aktif Plan (Plus)" : "Mevcut Planın"}
            </button>
          </div>

          {/* Plus Plan */}
          <div className="relative bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl p-8 shadow-2xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="px-4 py-1.5 rounded-full bg-amber-400 border-2 border-white shadow-lg">
                <span className="text-xs font-extrabold text-slate-900">EN POPÜLER</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-white">Plus</h3>
                <p className="text-sm text-white/80">Tüm özellikler</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-white">₺49</span>
                <span className="text-white/80">/ay</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <Feature icon={<Check className="w-5 h-5" />} text="Tüm ücretsiz özellikler" included white />
              <Feature icon={<Brain className="w-5 h-5" />} text="AI destekli soru analizi" included white />
              <Feature icon={<Zap className="w-5 h-5" />} text="Akıllı soru önerileri" included white />
              <Feature icon={<Shield className="w-5 h-5" />} text="Gelişmiş performans raporları" included white />
              <Feature icon={<Crown className="w-5 h-5" />} text="Kişiselleştirilmiş öğrenme yolu" included white />
              <Feature icon={<Sparkles className="w-5 h-5" />} text="Öncelikli destek" included white />
            </ul>

            <button
              onClick={openPayment}
              disabled={isPlus}
              className={`w-full py-3 rounded-2xl font-bold transition shadow-lg ${
                isPlus
                  ? "text-slate-500 bg-white/50 cursor-not-allowed"
                  : "text-emerald-600 bg-white hover:bg-gray-50"
              }`}
            >
              {isPlus ? "Aktif Plan ✓" : "Plus’a Geç"}
            </button>
          </div>
        </div>

        {/* Payment Modal */}
        {payOpen && (
          <>
            <div className="fixed inset-0 bg-black/45 z-[90]" onClick={closePayment} />
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-900/10 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-900/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <div className="font-extrabold text-slate-900">Ödeme</div>
                  </div>
                  <button
                    onClick={closePayment}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 disabled:opacity-60"
                  >
                    Kapat
                  </button>
                </div>

                <div className="p-6 space-y-2">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 mb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-extrabold text-slate-900">EduAI Plus</div>
                        <div className="text-xs text-slate-600">Aylık abonelik</div>
                      </div>
                      <div className="text-lg font-extrabold text-slate-900">₺49</div>
                    </div>
                    <div className="mt-3 text-xs text-slate-600 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <label className="text-sm font-semibold text-slate-800 mt-2">
                    Kart Üzerindeki İsim
                  </label>
                  <input
                    value={card.name}
                    onChange={handleNameChange}
                    onBlur={() => markTouched("name")}
                    className={`${inputBase} ${fieldErr.name ? errBorder : okBorder}`}
                    placeholder="Ad Soyad"
                  />
                  {fieldErr.name && (
                    <div className="text-xs text-red-600 font-semibold">{fieldErr.name}</div>
                  )}

                  <label className="text-sm font-semibold text-slate-800 mt-2">
                    Kart Numarası
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={card.number}
                    onChange={handleCardNumberChange}
                    onBlur={() => markTouched("number")}
                    className={`${inputBase} ${fieldErr.number ? errBorder : okBorder}`}
                    placeholder="0000 0000 0000 0000"
                  />
                  {fieldErr.number && (
                    <div className="text-xs text-red-600 font-semibold">{fieldErr.number}</div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="text-sm font-semibold text-slate-800">SKT (AA/YY)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        value={card.exp}
                        onChange={handleExpChange}
                        onBlur={() => markTouched("exp")}
                        className={`${inputBase} ${fieldErr.exp ? errBorder : okBorder}`}
                        placeholder="12/29"
                      />
                      {fieldErr.exp && (
                        <div className="text-xs text-red-600 font-semibold">{fieldErr.exp}</div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-800">CVC</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        value={card.cvc}
                        onChange={handleCvcChange}
                        onBlur={() => markTouched("cvc")}
                        className={`${inputBase} ${fieldErr.cvc ? errBorder : okBorder}`}
                        placeholder="123"
                      />
                      {fieldErr.cvc && (
                        <div className="text-xs text-red-600 font-semibold">{fieldErr.cvc}</div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleUpgrade}
                    disabled={loading || !canPay}
                    className="w-full mt-4 py-3 rounded-2xl font-extrabold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-105 transition disabled:opacity-60"
                  >
                    {loading ? "Onaylanıyor..." : "Ödemeyi Onayla"}
                  </button>

                  <button
                    onClick={closePayment}
                    disabled={loading}
                    className="w-full py-3 rounded-2xl font-bold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                  >
                    Vazgeç
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mt-16 text-center">
         
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, text, included = false, white = false }) {
  const iconColor = white
    ? included
      ? "text-white"
      : "text-white/40"
    : included
    ? "text-emerald-600"
    : "text-slate-300";

  const textColor = white
    ? included
      ? "text-white"
      : "text-white/60"
    : included
    ? "text-slate-900"
    : "text-slate-400";

  return (
    <li className="flex items-center gap-3">
      <span className={iconColor}>{icon}</span>
      <span className={`text-sm font-medium ${textColor}`}>{text}</span>
    </li>
  );
}

export default Pricing;
