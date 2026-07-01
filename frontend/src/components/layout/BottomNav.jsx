import { NavLink } from "react-router-dom";
import { Plus } from "lucide-react";
import { MOBILE_NAV } from "../../constants/navigation";

export default function BottomNav({ onAddClick }) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md
                 border-t border-slate-800/80 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]"
    >
      <div className="flex items-center justify-between max-w-md mx-auto">
        {MOBILE_NAV.map((item) => {
          if (item.id === "add") {
            return (
              <button
                key="add"
                onClick={onAddClick}
                className="relative -mt-7 flex flex-col items-center justify-center"
                aria-label="Add transaction"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 ring-4 ring-slate-950 active:scale-95 transition-transform">
                  <Plus size={26} strokeWidth={2.5} className="text-slate-950" />
                </span>
              </button>
            );
          }

          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1 px-3 py-1.5 min-w-[56px]"
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={21}
                    strokeWidth={isActive ? 2.4 : 2}
                    className={isActive ? "text-emerald-400" : "text-slate-500"}
                  />
                  <span
                    className={`text-[10.5px] font-medium ${
                      isActive ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
