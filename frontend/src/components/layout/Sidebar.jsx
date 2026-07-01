import { Wallet } from "lucide-react";
import SidebarItem from "./SidebarItem";
import { PRIMARY_NAV, FOOTER_NAV } from "../../constants/navigation";

export default function Sidebar() {
  return (
    <aside
      className="hidden md:flex md:w-20 lg:w-64 flex-col shrink-0 bg-slate-900 border-r border-slate-800/80
                 transition-all duration-300 ease-in-out"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 lg:px-6 h-16 border-b border-slate-800/80">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
          <Wallet size={18} strokeWidth={2.25} />
        </div>
        <span className="hidden lg:block font-semibold text-[15px] tracking-tight text-slate-50">
          Monetra<span className="text-emerald-400">.</span>
        </span>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto px-3 lg:px-4 py-5 space-y-1">
        <p className="hidden lg:block px-2 mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
          Workspace
        </p>
        {PRIMARY_NAV.map((item) => (
          <SidebarItem
            key={item.path}
            to={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </nav>

      {/* Footer nav, separated by a divider */}
      <div className="px-3 lg:px-4 py-4 border-t border-slate-800/80 space-y-1">
        {FOOTER_NAV.map((item) => (
          <SidebarItem
            key={item.path}
            to={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}

        <div className="hidden lg:flex items-center gap-2.5 mt-3 px-2.5 py-2 rounded-xl bg-slate-800/60">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[12px] font-semibold text-slate-950">
            JD
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-slate-100 truncate">
              Jordan Diaz
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              jordan@finch.app
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
