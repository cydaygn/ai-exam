import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  User,
  Settings,
  Clock,
  BarChart2,
  CheckCircle,
} from "lucide-react";

function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [profileData, setProfileData] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!user) navigate("/login");
  }, []);

  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:5000/api/user/${user.id}`)
      .then((res) => res.json())
      .then((data) => setProfileData(data));

    fetch(`http://localhost:5000/api/user/tests/${user.id}`)
      .then((res) => res.json())
      .then((data) => setActivities(data));
  }, [user]);

  if (!profileData)
    return <p className="text-center mt-10">Yükleniyor...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Profilim</h1>

      {/* PROFIL KARTI */}
      <div className="bg-white shadow-xl rounded-2xl p-8 mb-10 flex items-center gap-8 border">
        <img
          src={`https://ui-avatars.com/api/?name=${profileData.name}&background=0D8ABC&color=fff&size=150`}
          className="w-32 h-32 rounded-full shadow"
        />

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <User className="text-gray-600" />
            <p className="text-xl font-semibold">{profileData.name}</p>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="text-gray-600" />
            <p className="text-gray-600 text-lg">{profileData.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <Settings className="text-gray-600" />
            <p className="text-gray-600 text-lg">{profileData.role}</p>
          </div>
        </div>
      </div>

      {/* SON TEST TARIHI */}
      <div className="bg-white shadow rounded-xl p-5 mb-10 border">
        <h2 className="text-xl font-bold mb-2">En Son Test Tarihi</h2>
        <p className="text-lg text-gray-700 font-semibold">
          {profileData.last_test_date
            ? new Date(profileData.last_test_date).toLocaleDateString("tr-TR")
            : "Henüz test çözülmedi"}
        </p>
      </div>

      {/* ISTATISTIKLER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-blue-600 text-white rounded-2xl shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Toplam Test</h3>
            <BarChart2 size={32} />
          </div>
          <p className="text-5xl font-bold">{profileData.total_tests}</p>
        </div>

        <div className="p-6 bg-purple-600 text-white rounded-2xl shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Genel Başarı</h3>
            <CheckCircle size={32} />
          </div>
          <p className="text-5xl font-bold">%{profileData.average_score}</p>
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

      {/* SON AKTIVITELER */}
      <div className="bg-white border rounded-2xl shadow p-6 mb-10">
        <h2 className="text-2xl font-bold mb-4">Son Aktiviteler</h2>
        <ul className="space-y-3">
          {activities.map((a, i) => (
            <li
              key={i}
              className="p-4 bg-gray-50 rounded-xl border flex justify-between"
            >
              <span className="font-semibold">{a.exam_name}</span>
              <span className="text-blue-700 font-semibold">%{a.score}</span>
              <span className="text-gray-500">
                {new Date(a.created_at).toLocaleString("tr-TR")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Profile;
