import type { ReactNode } from "react";
import { useAppSelector } from "../../store";
import { Store, User, LogOut } from "lucide-react";
import { useAppDispatch } from "../../store";
import { logout } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../utils/routes";

interface RoleLayoutProps {
  children: ReactNode;
  roleTitle: string;
  navItems: { label: string; path: string; icon: any }[];
}

const RoleLayout = ({ children, roleTitle, navItems }: RoleLayoutProps) => {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-56 bg-primary-950 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-4 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white shrink-0">
            <Store size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              Subway
            </h1>
            <p className="text-[10px] text-slate-500">{roleTitle}</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all hover:bg-white/5 hover:text-white group"
            >
              <item.icon
                size={18}
                className="text-slate-500 group-hover:text-primary-400"
              />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white border border-white/10 overflow-hidden">
              <User size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-danger-400 hover:bg-danger-400/10 transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
            {roleTitle} Portal
          </h2>
          <div className="text-[10px] text-slate-400 font-medium">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default RoleLayout;
