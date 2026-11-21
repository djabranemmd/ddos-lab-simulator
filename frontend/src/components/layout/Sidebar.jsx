
import {
  LayoutDashboard,
  Network,
  Activity,
  ShieldAlert,
  ShieldCheck,
  ChartNoAxesCombined,
  Settings,
  Radar,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigation = [
  { name: "Overview", path: "/", icon: LayoutDashboard },
  { name: "Monitoring", path: "/monitoring", icon: Activity },
  { name: "Network Topology", path: "/topology", icon: Network },
  { name: "Detection", path: "/detection", icon: ShieldAlert },
  { name: "Mitigation", path: "/mitigation", icon: ShieldCheck },
  { name: "Analytics", path: "/analytics", icon: ChartNoAxesCombined },
];

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-white/10 bg-[#0d1320]">
      {/* Brand */}
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
          <Radar size={23} />
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-wide text-white">
            DDOS<span className="text-cyan-400">Attack</span>
          </h1>

          <p className="text-[10px] uppercase tracking-[2px] text-slate-500">
            DDoS Lab Simulator
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 pt-8">
        <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[2px] text-slate-500">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                  isActive
                    ? "border border-cyan-400/20 bg-cyan-400/10 text-cyan-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700/50 text-slate-300">
            <Settings size={18} />
          </div>

          <div>
            <p className="text-xs font-medium text-white">
              System Settings
            </p>

            <p className="text-[10px] text-slate-500">
              Simulator v1.0
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
