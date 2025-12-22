import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Bot,
  BarChart2,
  User,
  LogOut,
  Sparkles,
  Brain,
} from "lucide-react";

function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Scroll edilen container
  const scrollRef = useRef(null);

  const menu = [
    { name: "Ana Sayfa", icon: Home, path: "/student/dashboard" },
    { name: "Sınavlar", icon: Brain, path: "/student/exams" },
    { name: "Performans", icon: BarChart2, path: "/student/performance" },
    { name: "Profil", icon: User, path: "/student/profile" },
    { name: "AI Asistan", icon: Bot, path: "/student/ai" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Route değişince: menüyü kapat + sayfayı üste al
  useEffect(() => {
    setOpen(false);

    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, [location.pathname, location.search]);

  const PageBackground = () => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-cyan-200/45 rounded-full blur-3xl" />
      <div className="absolute top-10 right-[-180px] w-[560px] h-[560px] bg-emerald-200/45 rounded-full blur-3xl" />
      <div className="absolute bottom-[-220px] left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-sky-200/35 rounded-full blur-3xl" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,.18)_1px,transparent_0)] [background-size:26px_26px]" />
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-emerald-50 font-sans text-slate-900 relative overflow-x-hidden">
      <PageBackground />

      {/* IMPORTANT: flex-col değil, side layout var ama yükseklik yönetimi flex ile */}
      <div className="relative z-10 flex min-h-screen">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex w-72 p-6">
          <div className="w-full rounded-3xl bg-white/65 backdrop-blur-xl border border-slate-900/10 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-900/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-lg leading-tight">EduAI</div>
                  <div className="text-xs text-slate-600">Öğrenci Paneli</div>
                </div>
              </div>
            </div>

            <nav className="p-4 space-y-2 flex-1">
              {menu.map((m) => {
                const active =
                  location.pathname === m.path ||
                  (m.path === "/student/exams" &&
                    (location.pathname.startsWith("/student/exam") ||
                      location.pathname.startsWith("/student/exams")));

                const Icon = m.icon;

                return (
                  <Link
                    key={m.path}
                    to={m.path}
                    className={[
                      "flex items-center gap-3 px-4 py-3 rounded-2xl transition border",
                      active
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-transparent shadow-[0_12px_35px_rgba(6,182,212,0.22)]"
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
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-red-200 bg-red-50 text-red-700 font-bold hover:bg-red-100 transition"
              >
                <LogOut size={18} />
                Çıkış Yap
              </button>
            </div>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* MOBILE HEADER */}
          <div className="lg:hidden sticky top-0 z-[60] px-4 pt-4">
            <div className="rounded-2xl bg-white/65 backdrop-blur-xl border border-slate-900/10 shadow-sm px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                className="p-2 rounded-xl bg-white/70 border border-slate-900/10"
                aria-label="Menü"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <div className="font-extrabold leading-tight">EduAI</div>
                
              </div>
            </div>
          </div>

          {/* MOBILE OVERLAY */}
          {open && (
            <div
              className="fixed inset-0 bg-black/45 z-[80]"
              onClick={() => setOpen(false)}
            />
          )}

          {/* MOBILE SIDEBAR */}
          <aside
            className={[
              "fixed top-0 left-0 h-full w-72 z-[90] transform transition-transform duration-300",
              open ? "translate-x-0" : "-translate-x-full",
            ].join(" ")}
          >
            <div className="h-full m-4 rounded-3xl bg-white/80 backdrop-blur-2xl border border-slate-900/10 shadow-xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-900/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-extrabold text-lg">EduAI</div>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl bg-white/70 border border-slate-900/10"
                  aria-label="Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-4 space-y-2 flex-1">
                {menu.map((m) => {
                  const active =
                    location.pathname === m.path ||
                    (m.path === "/student/exams" &&
                      (location.pathname.startsWith("/student/exam") ||
                        location.pathname.startsWith("/student/exams")));

                  const Icon = m.icon;

                  return (
                    <Link
                      key={m.path}
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

          {/* SCROLL CONTAINER */}
          {/* IMPORTANT: h-screen yerine flex-1 min-h-0 */}
          <main
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 md:px-8 lg:px-10 pt-6 pb-12"
          >
            <div className="max-w-6xl mx-auto">
              <Outlet />
            </div>

            <footer className="text-center py-6 mt-10 text-slate-600 border-t border-slate-900/10 text-sm">
              © 2025 EduAI Platform · Tüm Hakları Saklıdır
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

export default StudentLayout;
