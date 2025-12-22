import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  User,
  Settings,
  Clock,
  BarChart2,
  CheckCircle,
  Edit3,
  X,
  Save,
  Sparkles,
} from "lucide-react";
import { API_URL, API_BASE } from '../api';
function Profile() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const [profileData, setProfileData] = useState(null);
  const [activities, setActivities] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [navigate, user]);

  useEffect(() => {
    if (!user) return;
fetch(`${API_URL}/user/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setProfileData(data);
        setForm({ name: data.name || "" });
      })
      .catch((err) => console.error("Profil fetch hatası:", err));

   fetch(`${API_URL}/user/tests/${user.id}`)
      .then((res) => res.json())
      .then((data) => setActivities(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Tests fetch hatası:", err));
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleSave = async () => {
    if (!profileData) return;
    setSaving(true);
    setError("");
    try {
    const res = await fetch(`${API_URL}/user/${profileData.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: form.name }),
  });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Profil güncellenemedi.");
      }
      if (data.profile) {
        setProfileData((prev) => ({ ...prev, ...data.profile }));
      } else {
        setProfileData((prev) => ({ ...prev, name: form.name }));
      }
      const stored = (() => {
        try {
          return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
          return null;
        }
      })();
      if (stored) {
        stored.name = form.name;
        localStorage.setItem("user", JSON.stringify(stored));
      }
      setEditMode(false);
    } catch (err) {
      console.error("Profil güncelleme hatası:", err);
      setError(err?.message || "Profil güncellenemedi.");
    } finally {
      setSaving(false);
    }
  };
  if (!profileData) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative overflow-hidden">
        {/* Arka plan soft glow + hafif grid */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-cyan-200/45 rounded-full blur-3xl" />
          <div className="absolute top-10 right-[-180px] w-[560px] h-[560px] bg-emerald-200/45 rounded-full blur-3xl" />
          <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-sky-200/35 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,.18)_1px,transparent_0)] [background-size:26px_26px]" />
        </div>
        <div className="relative z-10 px-6 md:px-10 lg:px-16 pt-14 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/60 px-4 py-2 text-sm text-slate-700 mb-6">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Profil verileri hazırlanıyor
            </div>
            <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-2xl p-10 shadow-sm">
              <p className="text-center text-slate-700">Yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const displayName = (profileData?.name || "")
  .trim()
  .toLocaleLowerCase("tr-TR")
  .replace(/\s+/g, " ")
  .split(" ")
  .filter(Boolean)
  .map((w) => w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1))
  .join(" ");

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName  || "")}&background=10b981&color=fff&size=150`;
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative overflow-hidden">
      {/* Arka plan soft glow + hafif grid */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-cyan-200/45 rounded-full blur-3xl" />
        <div className="absolute top-10 right-[-180px] w-[560px] h-[560px] bg-emerald-200/45 rounded-full blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-sky-200/35 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,.18)_1px,transparent_0)] [background-size:26px_26px]" />
      </div>
      <div className="relative z-10 px-6 md:px-10 lg:px-16 pt-10 pb-14">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3">
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Profilim
            </span>
          </h1>
          <p className="text-slate-700 max-w-2xl mb-10">
            Adını güncelle, son testlerini ve istatistiklerini tek yerde gör.
          </p>
          {/* Profil kartı */}
          <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-2xl p-7 md:p-8 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-7">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-28 h-28 md:w-32 md:h-32 rounded-full shadow-sm border border-white/60"
              />
              <div className="flex-1">
                <div className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">                   
                      {!editMode ? (
                        <p className="text-xl md:text-2xl font-extrabold break-words">
                          {displayName}
                        </p>
                      ) : (
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          className="w-full md:w-[360px] rounded-xl border border-slate-900/10 bg-white/70 px-4 py-2.5 text-lg outline-none focus:ring-2 focus:ring-emerald-300"
                          placeholder="Ad Soyad"
                        />
                      )}
                    </div>

                    <div className="mt-5 space-y-3">
                      <InfoRow
                        icon={<Mail className="w-5 h-5 text-slate-600" />}
                        text={profileData.email}
                      />
                      <InfoRow
                        icon={<Settings className="w-5 h-5 text-slate-600" />}
                        text={profileData.role}
                      />
                    </div>

                    {error && (
                      <p className="mt-3 text-sm text-red-600">{error}</p>
                    )}
                  </div>

                  {/* Butonlar */}
                  <div className="flex items-center gap-2">
                    {!editMode ? (
                      <button
                        onClick={() => {
                          setForm({ name: profileData.name || "" });
                          setEditMode(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-900/10 bg-white/70 hover:bg-white transition text-sm font-semibold"
                      >
                        <Edit3 size={16} />
                        Düzenle
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditMode(false)}
                          disabled={saving}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-900/10 bg-white/70 hover:bg-white transition text-sm font-semibold"
                        >
                          <X size={16} />
                          İptal
                        </button>

                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm
                                     bg-gradient-to-r from-emerald-500 to-cyan-500
                                     shadow-[0_10px_30px_rgba(6,182,212,0.25)]
                                     hover:brightness-105 transition disabled:opacity-60"
                        >
                          <Save size={16} />
                          {saving ? "Kaydediliyor..." : "Kaydet"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

       


          {/* Son Aktiviteler */}
          <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-2xl shadow-sm p-6 md:p-7 mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-extrabold">
                Son Aktiviteler
              </h2>
              {activities.length > 0 && (
                <span className="text-xs text-slate-600 bg-white/60 border border-slate-900/10 rounded-full px-3 py-1">
                  Son {activities.length} kayıt
                </span>
              )}
            </div>

            {activities.length === 0 ? (
              <p className="text-slate-700 text-sm">Henüz test çözülmedi.</p>
            ) : (
              <ul className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {activities.map((a, i) => (
                  <li
                    key={i}
                    className="p-4 rounded-2xl border border-slate-900/10 bg-white/60 hover:bg-white transition
                               flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 break-words">
                        {a.exam_name}
                      </p>
    <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
  <span>{new Date(a.created_at).toLocaleString("tr-TR")}</span>

  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
    {a.correct ?? 0}/{a.total ?? 0}
  </span>
</div>

                    </div>

                    <div className="flex items-center gap-3 md:min-w-[140px] md:justify-end">
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-slate-500">
                          Başarı
                        </div>
                        <div className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                          %{a.score}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, text }) {
  return (
    <div className="flex items-center gap-3 text-slate-700">
      <span className="shrink-0">{icon}</span>
      <p className="text-base md:text-lg break-words">{text}</p>
    </div>
  );
}

function StatCard({ title, value, icon, accent, small }) {
  return (
    <div className="bg-white/65 backdrop-blur-xl border border-slate-900/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-slate-700 text-sm font-semibold">{title}</h3>
          <p className={`${small ? "text-2xl" : "text-4xl md:text-5xl"} font-extrabold mt-2`}>
            {value}
          </p>
        </div>

        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-sm`}
        >
          <div className="text-white">{icon}</div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
