import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import { Home, Users, FileText, LogOut, Menu, X, Sparkles } from "lucide-react";

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);

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

  useEffect(() => {
    setOpen(false);
    setDesktopOpen(false);
  }, [location.pathname]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative overflow-hidden">
      {/* Arka plan */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-cyan-200/45 rounded-full blur-3xl" />
        <div className="absolute top-10 right-[-180px] w-[560px] h-[560px] bg-emerald-200/45 rounded-full blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-sky-200/35 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,.18)_1px,transparent_0)] [background-size:26px_26px]" />
      </div>

      <div className="relative z-10 flex h-full">
        {/* DESKTOP: hamburger butonu */}
        <button
          onClick={() => setDesktopOpen(true)}
          type="button"
          aria-label="Sidebar'ı aç"
          title="Menü"
          className={[
            "hidden lg:inline-flex fixed left-4 top-6 z-[80]",
            "items-center justify-center",
            "h-11 w-11 rounded-2xl",
            "bg-white/70 backdrop-blur-xl",
            "border border-slate-900/10",
            "shadow-[0_14px_40px_rgba(15,23,42,0.14)]",
            "hover:bg-white",
            "hover:shadow-[0_18px_55px_rgba(15,23,42,0.18)]",
            "active:scale-95 transition",
            "focus:outline-none focus:ring-4 focus:ring-cyan-200/60",
            desktopOpen ? "opacity-0 pointer-events-none" : "opacity-100",
          ].join(" ")}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            className="text-slate-800"
          >
            <line x1="5" y1="7" x2="19" y2="7" />
            <line x1="5" y1="12" x2="19" y2="12" />
            <line x1="5" y1="17" x2="19" y2="17" />
          </svg>
        </button>

        {/* DESKTOP OVERLAY */}
        {desktopOpen && (
          <div
            className="hidden lg:block fixed inset-0 bg-black/35 z-[65]"
            onClick={() => setDesktopOpen(false)}
          />
        )}

        {/* DESKTOP SIDEBAR */}
        <aside
          className={[
            "hidden lg:flex flex-col fixed h-full left-0 top-0 z-[70] w-72",
            "transition-transform duration-300",
            desktopOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="w-full h-full m-4 rounded-3xl bg-white/65 backdrop-blur-xl border border-slate-900/10 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-900/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-extrabold text-lg leading-tight">EduAI Admin</div>
                  <div className="text-xs text-slate-600">Yönetim Paneli</div>
                </div>
              </div>

              <button
                onClick={() => setDesktopOpen(false)}
                className="p-2 rounded-xl bg-white/70 border border-slate-900/10 hover:bg-slate-50"
                aria-label="Sidebar'ı kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
              {menu.map((m, i) => (
                <Link
                  key={i}
                  to={m.path}
                  onClick={() => setDesktopOpen(false)}
                  className={[
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition border",
                    isActive(m.path)
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-transparent shadow-[0_12px_35px_rgba(6,182,212,0.22)]"
                      : "bg-white/50 hover:bg-white border-slate-900/10 text-slate-800",
                  ].join(" ")}
                >
                  <m.icon size={18} className="flex-shrink-0" />
                  <span className="font-semibold whitespace-nowrap">{m.name}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-900/10">
              <button
                onClick={() => {
                  setDesktopOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-red-200 bg-red-50 text-red-700 font-bold hover:bg-red-100 transition"
              >
                <LogOut size={18} />
                Çıkış Yap
              </button>
            </div>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <div className="flex-1 min-w-0 flex flex-col h-full">

          {/* MOBILE HEADER */}
          <div className="lg:hidden flex-shrink-0 px-4 pt-4">
            <div className="rounded-2xl bg-white/65 backdrop-blur-xl border border-slate-900/10 shadow-sm px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                className="p-2 rounded-xl bg-white/70 border border-slate-900/10"
                aria-label="Menü"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <div className="font-extrabold leading-tight">EduAI Admin</div>
              </div>
            </div>
          </div>

          {/* MOBILE OVERLAY */}
          {open && (
            <div
              className="fixed inset-0 bg-black/45 z-[80] lg:hidden"
              onClick={() => setOpen(false)}
            />
          )}

          {/* MOBILE SIDEBAR */}
          <aside
            className={[
              "fixed top-0 left-0 h-full w-72 z-[90] transform transition-transform duration-300 lg:hidden",
              open ? "translate-x-0" : "-translate-x-full",
            ].join(" ")}
          >
            <div className="h-full m-4 rounded-3xl bg-white/80 backdrop-blur-2xl border border-slate-900/10 shadow-xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-900/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-extrabold text-lg">EduAI Admin</div>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl bg-white/70 border border-slate-900/10"
                  aria-label="Menüyü kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                {menu.map((m, i) => {
                  const active = isActive(m.path);
                  const Icon = m.icon;

                  return (
                    <Link
                      key={i}
                      to={m.path}
                      onClick={() => setOpen(false)}
                      className={[
                        "flex items-center gap-3 px-4 py-3 rounded-2xl transition border",
                        active
                          ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-transparent"
                          : "bg-white/50 hover:bg-white border-slate-900/10 text-slate-800",
                      ].join(" ")}
                    >
                      <Icon size={18} />
                      <span className="font-semibold">{m.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-900/10">
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-red-200 bg-red-50 text-red-700 font-bold hover:bg-red-100 transition"
                >
                  <LogOut size={18} />
                  Çıkış Yap
                </button>
              </div>
            </div>
          </aside>

          {/* PAGE CONTENT - TEK SCROLL BURASI */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-8 lg:px-10 pt-6 pb-12">
            <Outlet />

            <footer className="text-center py-6 mt-10 text-slate-600 border-t border-slate-900/10 text-sm">
              © 2025 EduAI Platform · Tüm Hakları Saklıdır
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;