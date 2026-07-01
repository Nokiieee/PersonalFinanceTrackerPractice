import { NavLink } from "react-router-dom";

export default function SidebarItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 w-full rounded-xl px-2.5 lg:px-3 py-2.5
         transition-colors duration-150
         ${
           isActive
             ? "bg-emerald-500/12 text-emerald-400"
             : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
         }`
      }
      title={label}
    >
      {({ isActive }) =>
        isActive ? (
          <>
            <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-emerald-400" />
            <Icon size={19} strokeWidth={2} className="shrink-0" />
            <span className="hidden lg:block text-[13.5px] font-medium truncate">{label}</span>
          </>
        ) : (
          <>
            <Icon size={19} strokeWidth={2} className="shrink-0" />
            <span className="hidden lg:block text-[13.5px] font-medium truncate">{label}</span>
          </>
        )
      }
    </NavLink>
  );
}
