import { Link } from "react-router-dom";
import { ChevronRight, LogOut } from "lucide-react";
import { MORE_ITEMS } from "../constants/navigation";
import PageStub from "../components/common/PageStub";

export default function Profile() {
  return (
    <div className="max-w-md mx-auto md:max-w-none">
      {/* Profile summary card — mobile only */}
      <div className="md:hidden flex items-center gap-3.5 rounded-2xl bg-slate-900 border border-slate-800/80 px-4 py-4 mb-5">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[14px] font-semibold text-slate-950">
          JD
        </div>
        <div className="min-w-0">
          <p className="text-[14.5px] font-semibold text-slate-50 truncate">Jordan Diaz</p>
          <p className="text-[12.5px] text-slate-500 truncate">jordan@finch.app</p>
        </div>
      </div>

      <p className="md:hidden text-[11px] font-medium uppercase tracking-wider text-slate-500 px-1 mb-2">
        More
      </p>

      {/* "More" list — only needed on mobile, since the sidebar already links these on desktop */}
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
              <span className="flex-1 text-[14px] text-slate-200">{item.label}</span>
              <ChevronRight size={17} className="text-slate-600" />
            </Link>
          );
        })}
        <button className="flex items-center gap-3.5 w-full px-4 py-3.5 hover:bg-rose-500/10 transition-colors text-left">
          <LogOut size={19} strokeWidth={2} className="text-rose-400" />
          <span className="flex-1 text-[14px] text-rose-400 font-medium">Logout</span>
        </button>
      </div>

      {/* Desktop: just the regular profile content */}
      <div className="hidden md:block">
        <PageStub title="Profile" />
      </div>
    </div>
  );
}
