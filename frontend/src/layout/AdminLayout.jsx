import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { Home, Users, FileText, LogOut, Menu, X, Brain, Sparkles } from "lucide-react";

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const menu = useMemo(
    () => [
      { name: "Ana Sayfa", icon: Home, path: "/admin/dashboard" },
      { name: "Öğrenciler", icon: Users, path: "/admin/students" },
      { name: "Sınavlar", icon: FileText, path: "/admin/exams" },
    ],
    []
  );

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative overflow-hidden">
      {/* Arka plan soft glow + hafif grid (Landing ile aynı) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-cyan-200/45 rounded-full blur-3xl" />
        <div className="absolute top-10 right-[-180px] w-[560px] h-[560px] bg-emerald-200/45 rounded-full blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-sky-200/35 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,.18)_1px,transparent_0)] [background-size:26px_26px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* ---- SIDEBAR (DESKTOP) ---- */}
        <aside className="hidden lg:flex flex-col w-72 fixed h-full">
          <div className="h-full m-6 rounded-3xl bg-white/65 backdrop-blur-xl border border-slate-900/10 shadow-sm overflow-hidden flex flex-col">
            {/* Brand */}
            <div className="p-6 border-b border-slate-900/10 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-sm">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-extrabold leading-tight">Admin Panel</div>
                <div className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Yönetim alanı
                </div>
              </div>
            </div>

            {/* Menu */}
            <nav className="p-4 space-y-2 flex-1">
              {menu.map((m, i) => (
                <Link
                  key={i}
                  to={m.path}
                  className={[
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition",
                    "border border-transparent",
                    isActive(m.path)
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-[0_12px_35px_rgba(6,182,212,0.22)]"
                      : "bg-white/40 text-slate-700 hover:bg-white/70 hover:border-slate-900/10",
                  ].join(" ")}
                >
                  <m.icon size={20} />
                  <span className="font-semibold">{m.name}</span>
                </Link>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-4 pt-0">
              <button
                onClick={handleLogout}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl
                           bg-white/60 hover:bg-white transition
                           border border-slate-900/10 text-slate-800 font-bold"
              >
                <LogOut size={18} />
                Çıkış Yap
              </button>
            </div>
          </div>
        </aside>

        {/* ---- CONTENT AREA ---- */}
        <div className="flex-1 lg:ml-72 min-h-screen">
          {/* ---- MOBILE HEADER ---- */}
          <div className="lg:hidden sticky top-0 z-30">
            <div className="mx-4 mt-4 rounded-2xl bg-white/65 backdrop-blur-xl border border-slate-900/10 shadow-sm px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                className="p-2 rounded-xl bg-white/60 border border-slate-900/10 hover:bg-white transition"
                aria-label="Menüyü aç"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-sm">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold leading-tight">Admin Panel</div>
                </div>
              </div>
            </div>
          </div>

          {/* ---- MOBILE OVERLAY ---- */}
          {open && (
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setOpen(false)}
            />
          )}

          {/* ---- MOBILE SIDEBAR ---- */}
          <aside
            className={[
              "fixed top-0 left-0 h-full w-72 z-50",
              "transform transition-transform duration-300",
              open ? "translate-x-0" : "-translate-x-full",
            ].join(" ")}
          >
            <div className="h-full m-4 rounded-3xl bg-white/75 backdrop-blur-2xl border border-slate-900/10 shadow-xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-900/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-sm">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold">Admin Panel</div>
                    <div className="text-xs text-slate-600">Yönetim alanı</div>
                  </div>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl bg-white/60 border border-slate-900/10 hover:bg-white transition"
                  aria-label="Menüyü kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-4 space-y-2 flex-1">
                {menu.map((m, i) => (
                  <Link
                    key={i}
                    to={m.path}
                    onClick={() => setOpen(false)}
                    className={[
                      "flex items-center gap-3 px-4 py-3 rounded-2xl transition",
                      "border border-transparent",
                      isActive(m.path)
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-[0_12px_35px_rgba(6,182,212,0.22)]"
                        : "bg-white/40 text-slate-700 hover:bg-white/70 hover:border-slate-900/10",
                    ].join(" ")}
                  >
                    <m.icon size={20} />
                    <span className="font-semibold">{m.name}</span>
                  </Link>
                ))}
              </nav>

              <div className="p-4 pt-0">
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl
                             bg-white/60 hover:bg-white transition
                             border border-slate-900/10 text-slate-800 font-bold"
                >
                  <LogOut size={18} />
                  Çıkış Yap
                </button>
              </div>
            </div>
          </aside>

          {/* ---- PAGE CONTENT ---- */}
          <main className="px-4 md:px-8 lg:px-10 pt-6 pb-12">
            <div className="max-w-6xl mx-auto">
              <Outlet />
            </div>
          </main>

          {/* Footer */}
          <footer className="text-center py-6 text-slate-600 border-t border-slate-900/10 text-sm">
            © 2025 EduAI Platform · Tüm Hakları Saklıdır
          </footer>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
