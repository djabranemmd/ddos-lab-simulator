
import { Bell, Search, CircleHelp } from "lucide-react";
import { useLocation } from "react-router-dom";

const pageTitles = {
  "/": "Overview",
  "/monitoring": "Network Monitoring",
  "/detection": "Threat Detection",
  "/mitigation": "Mitigation Center",
  "/analytics": "Performance Analytics",
};

function Topbar() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <header className="flex h-20 items-center justify-between border-b border-white/10 bg-[#0d1320]/80 px-8">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-xs text-slate-500">
          Monitor and manage your network security environment
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-xs text-slate-400 md:flex">
          <Search size={15} />
          Search
        </button>

        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-400 hover:bg-white/5">
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400" />
        </button>

        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-400 hover:bg-white/5">
          <CircleHelp size={18} />
        </button>

        <div className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/15 text-sm font-bold text-cyan-400">
          NG
        </div>
      </div>
    </header>
  );
}

export default Topbar;
