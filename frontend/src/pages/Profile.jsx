import { useEffect, useState } from "react";
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
} from "lucide-react";

function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [profileData, setProfileData] = useState(null);
  const [activities, setActivities] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
  }, []);

  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:5000/api/user/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setProfileData(data);
        setForm({
          name: data.name,
        });
      })
      .catch(err => console.error("Profil fetch hatası:", err));

    fetch(`http://localhost:5000/api/user/tests/${user.id}`)
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.error("Tests fetch hatası:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = e => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    if (!profileData) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch(
        `http://localhost:5000/api/user/${profileData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name, // sadece name
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Profil güncellenemedi.");
      }

      if (data.profile) {
        setProfileData(prev => ({
          ...prev,
          ...data.profile,
        }));
      } else {
        setProfileData(prev => ({
          ...prev,
          name: form.name,
        }));
      }

      const stored = JSON.parse(localStorage.getItem("user") || "null");
      if (stored) {
        stored.name = form.name;
        localStorage.setItem("user", JSON.stringify(stored));
      }

      setEditMode(false);
    } catch (err) {
      console.error("Profil güncelleme hatası:", err);
      setError(err.message || "Profil güncellenemedi.");
    } finally {
      setSaving(false);
    }
  };

  if (!profileData)
    return <p className="text-center mt-10">Yükleniyor...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-2">Profilim</h1>

      {/* Profil kartı + düzenle butonu */}
      <div className="bg-white shadow-xl rounded-2xl p-8 mb-4 flex flex-col md:flex-row md:items-center gap-8 border">
        <img
          src={`https://ui-avatars.com/api/?name=${profileData.name}&background=0D8ABC&color=fff&size=150`}
          className="w-32 h-32 rounded-full shadow"
        />

        <div className="flex-1 space-y-4">
          <div className="flex items-start md:items-center justify-between gap-3 flex-col md:flex-row">
            <div className="flex items-center gap-3">
              <User className="text-gray-600" />
              {!editMode ? (
                <p className="text-xl font-semibold">
                  {profileData.name}
                </p>
              ) : (
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 text-lg w-full"
                  placeholder="Ad Soyad"
                />
              )}
            </div>

            {/* Düzenle / Kaydet butonları */}
            <div className="flex items-center gap-2">
              {!editMode ? (
                <button
                  onClick={() => {
                    setForm({
                      name: profileData.name,
                    });
                    setEditMode(true);
                  }}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                >
                  <Edit3 size={16} />
                  <span>Düzenle</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setEditMode(false)}
                    disabled={saving}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                  >
                    <X size={16} />
                    <span>İptal</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  >
                    <Save size={16} />
                    <span>{saving ? "Kaydediliyor..." : "Kaydet"}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="text-gray-600" />
            <p className="text-gray-600 text-lg">
              {profileData.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Settings className="text-gray-600" />
            <p className="text-gray-600 text-lg">
              {profileData.role}
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
        </div>
      </div>

      {/* En son test tarihi */}
      <div className="bg-white shadow rounded-xl p-5 border">
        <h2 className="text-xl font-bold mb-2">En Son Test Tarihi</h2>
        <p className="text-lg text-gray-700 font-semibold">
          {profileData.last_test_date
            ? new Date(
                profileData.last_test_date
              ).toLocaleDateString("tr-TR")
            : "Henüz test çözülmedi"}
        </p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-600 text-white rounded-2xl shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Toplam Test</h3>
            <BarChart2 size={32} />
          </div>
          <p className="text-5xl font-bold">
            {profileData.total_tests}
          </p>
        </div>

        <div className="p-6 bg-purple-600 text-white rounded-2xl shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Genel Başarı</h3>
            <CheckCircle size={32} />
          </div>
          <p className="text-5xl font-bold">
            %{profileData.average_score}
          </p>
        </div>

        <div className="p-6 bg-green-600 text-white rounded-2xl shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Son Test</h3>
            <Clock size={32} />
          </div>
          <p className="text-2xl font-bold">
            {profileData.last_test_name || "-"}
          </p>
        </div>
      </div>

      {/* Son Aktiviteler - STİLİ DÜZELTİLMİŞ HAL */}
      <div className="bg-white border rounded-2xl shadow p-6 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Son Aktiviteler</h2>
          {activities.length > 0 && (
            <span className="text-xs text-gray-500">
              Son {activities.length} kayıt
            </span>
          )}
        </div>

        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Henüz test çözülmedi.
          </p>
        ) : (
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {activities.map((a, i) => (
              <li
                key={i}
                className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {a.exam_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(a.created_at).toLocaleString("tr-TR")}
                  </p>
                </div>

                <div className="flex items-center gap-3 md:min-w-[120px] md:justify-end">
                  <div className="flex flex-col items-end">
                    <span className="text-xs uppercase tracking-wide text-gray-400">
                      Başarı
                    </span>
                    <span className="text-xl font-bold text-blue-700">
                      %{a.score}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Profile;
