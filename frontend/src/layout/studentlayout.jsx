import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  Home,
  Bot,
  FileText,
  BarChart2,
  User,
  Menu,
  X,
  LogOut,
  Brain
} from "lucide-react";

function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menu = [
    { name: "Ana Sayfa", icon: Home, path: "/student/dashboard" },
    { name: "AI Asistan", icon: Bot, path: "/student/ai" },
    { name: "Sınavlarım", icon: FileText, path: "/student/exams" },
    { name: "Performans", icon: BarChart2, path: "/student/performance" },
    { name: "Profil", icon: User, path: "/student/profile" }
  ];

  return (
    <div className="flex min-h-screen">

      {/* ---- SIDEBAR (DESKTOP) ---- */}
      <aside className="hidden lg:flex flex-col w-64 bg-gray-900 text-white fixed h-full">
        <div className="p-6 border-b border-gray-700 flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-500" />
          <span className="text-2xl font-bold">AI Exam</span>
        </div>

        {/* Menü */}
        <nav className="p-4 space-y-2">
          {menu.map((m, i) => (
            <Link
              key={i}
              to={m.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all 
                ${
                  location.pathname === m.path
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
            >
              <m.icon size={20} />
              {m.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Çıkış */}
        <div className="px-4 pb-4">
          <button
            onClick={handleLogout}
            className="w-full p-3 bg-red-900/40 text-red-300 rounded-lg hover:bg-red-900/60"
          >
            <div className="flex items-center gap-3">
              <LogOut size={20} /> Çıkış Yap
            </div>
          </button>
        </div>
      </aside>

      {/* ---- CONTENT AREA ---- */}
      <div className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">

        {/* ---- MOBILE HEADER ---- */}
        <div className="lg:hidden bg-white shadow p-4 flex items-center gap-4">
          <button onClick={() => setOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">AI Exam</h1>
        </div>

        {/* ---- MOBILE OVERLAY ---- */}
        {open && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setOpen(false)}
          />
        )}

        {/* ---- MOBILE SIDEBAR ---- */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-xl z-50
            transform transition-transform duration-300
            ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="p-6 border-b border-gray-700 flex justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold">AI Exam</span>
            </div>
            <button onClick={() => setOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {menu.map((m, i) => (
              <Link
                key={i}
                to={m.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all 
                  ${
                    location.pathname === m.path
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
              >
                <m.icon size={20} />
                {m.name}
              </Link>
            ))}
          </nav>

          {/* --- Mobil Çıkış (Eksik olan buydu) --- */}
          <div className="px-4 pb-4">
            <button
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              className="w-full p-3 bg-red-900/40 text-red-300 rounded-lg hover:bg-red-900/60"
            >
              <div className="flex items-center gap-3">
                <LogOut size={20} /> Çıkış Yap
              </div>
            </button>
          </div>
        </aside>

        {/* ---- PAGE CONTENT ---- */}
        <main className="p-6 pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
