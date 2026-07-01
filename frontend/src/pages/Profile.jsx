import { Link } from "react-router-dom";
import { ChevronRight, LogOut } from "lucide-react";
import { MORE_ITEMS } from "../constants/navigation";
import PageStub from "../components/common/PageStub";
import { useAuth } from "../context/AuthContext";
import { useLogout } from "../hooks/useLogout";
import LogoutModal from "../components/common/LogoutModal";

export default function Profile() {
  const { user } = useAuth();
  const { isOpen, open, cancel, confirm } = useLogout();

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  return (
    <>
      <div className="max-w-md mx-auto md:max-w-none">
        {/* Profile summary card — mobile only */}
        <div className="md:hidden flex items-center gap-3.5 rounded-2xl bg-slate-900 border border-slate-800/80 px-4 py-4 mb-5">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[14px] font-semibold text-slate-950">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[14.5px] font-semibold text-slate-50 truncate">
              {user?.username}
            </p>
            <p className="text-[12.5px] text-slate-500 truncate">
              Personal account
            </p>
          </div>
        </div>

        <p className="md:hidden text-[11px] font-medium uppercase tracking-wider text-slate-500 px-1 mb-2">
          More
        </p>

        {/* More list — mobile only */}
        <div className="md:hidden rounded-2xl bg-slate-900 border border-slate-800/80 divide-y divide-slate-800/80 overflow-hidden">
          {MORE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3.5 w-full px-4 py-3.5 hover:bg-slate-800/60 transition-colors text-left"
              >
                <Icon size={19} strokeWidth={2} className="text-slate-400" />
                <span className="flex-1 text-[14px] text-slate-200">
                  {item.label}
                </span>
                <ChevronRight size={17} className="text-slate-600" />
              </Link>
            );
          })}

          <button
            onClick={open}
            className="flex items-center gap-3.5 w-full px-4 py-3.5 hover:bg-rose-500/10 transition-colors text-left"
          >
            <LogOut size={19} strokeWidth={2} className="text-rose-400" />
            <span className="flex-1 text-[14px] text-rose-400 font-medium">
              Logout
            </span>
          </button>
        </div>

        {/* Desktop: regular profile content */}
        <div className="hidden md:block">
          <PageStub title="Profile" />
        </div>
      </div>

      <LogoutModal isOpen={isOpen} onConfirm={confirm} onCancel={cancel} />
    </>
  );
}
