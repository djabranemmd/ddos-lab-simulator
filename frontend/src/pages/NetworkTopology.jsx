
import {
  Activity,
  ArrowDown,
  Bot,
  CheckCircle2,
  CircleDot,
  Cpu,
  Network,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  Wifi,
  XCircle,
} from "lucide-react";

import useDashboardData from "../hooks/useDashboardData";

function TopologyNode({
  title,
  subtitle,
  icon: Icon,
  status,
  color = "blue",
  children,
}) {
  const colors = {
    blue: "border-blue-500/30 bg-blue-500/5 text-blue-400",
    green: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
    red: "border-red-500/30 bg-red-500/5 text-red-400",
    purple: "border-purple-500/30 bg-purple-500/5 text-purple-400",
    amber: "border-amber-500/30 bg-amber-500/5 text-amber-400",
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-white/5 p-2">
            <Icon size={22} />
          </div>

          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>

        {status && (
          <span className="flex items-center gap-1.5 text-xs font-medium">
            <CircleDot size={12} />
            {status}
          </span>
        )}
      </div>

      {children && (
        <div className="mt-4 border-t border-white/10 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

function FlowConnector({ label, color = "text-slate-500" }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <ArrowDown size={20} className={color} />
      <span className="text-[10px] font-medium text-slate-500">
        {label}
      </span>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

export default function NetworkTopology() {
  const { data, loading, error } = useDashboardData(1000);

  const simulation = data.simulation || {};
  const monitoring = data.monitoring || {};
  const mitigation = data.mitigation || {};

  const isRunning = simulation.status === "running";
  const isAttack = simulation.mode === "attack";

  const protectionEnabled = mitigation.enabled === true;
  const monitoringActive = monitoring.monitoring === "running";

  const legitimateRps = simulation.legitimate_rps ?? 0;
  const attackRps = simulation.attack_rps ?? 0;
  const totalRps = simulation.total_rps ?? 0;
  const blockedRps = mitigation.last_result?.blocked_rps ?? 0;
  const allowedRps = mitigation.last_result?.allowed_rps ?? 0;
  const simulatedBots = simulation.simulated_bots ?? 0;

  const mitigationRate =
    mitigation.last_result?.mitigation_rate ?? 0;

  const trafficPercentage = (value) =>
    totalRps > 0 ? (value / totalRps) * 100 : 0;

  const components = [
    {
      name: "Simulation Engine",
      active: isRunning,
      icon: Activity,
    },
    {
      name: "Detection Engine",
      active: monitoringActive,
      icon: Shield,
    },
    {
      name: "Rate Limiting Engine",
      active: protectionEnabled,
      icon: ShieldCheck,
    },
    {
      name: "Target Server",
      active: isRunning,
      icon: Server,
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-blue-400">
            <Network size={16} />
            Network Architecture
          </div>

          <h1 className="text-2xl font-bold text-white">
            Network Topology
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Visual representation of the simulated DDoS environment.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 py-2">
          <span
            className={`h-2 w-2 rounded-full ${
              isRunning ? "animate-pulse bg-emerald-400" : "bg-slate-500"
            }`}
          />

          <span className="text-sm text-slate-300">
            {loading
              ? "Connecting..."
              : isRunning
                ? "Simulation Running"
                : "Simulation Stopped"}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-400">
          <ShieldAlert size={18} />
          Some API data could not be retrieved.
        </div>
      )}

      {/* Traffic metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
          <Metric label="Total Traffic" value={`${totalRps} RPS`} />
          <Activity className="mt-3 text-blue-400" size={20} />
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
          <Metric
            label="Legitimate Traffic"
            value={`${legitimateRps} RPS`}
          />
          <Users className="mt-3 text-emerald-400" size={20} />
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
          <Metric label="Attack Traffic" value={`${attackRps} RPS`} />
          <Bot className="mt-3 text-red-400" size={20} />
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
          <Metric label="Simulated Bots" value={simulatedBots} />
          <Wifi className="mt-3 text-purple-400" size={20} />
        </div>
      </div>

      {/* Network topology */}
      <section className="rounded-xl border border-white/10 bg-slate-900 p-5">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">
              Virtual Network Architecture
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Synthetic traffic flow and protection process
            </p>
          </div>

          <Network className="text-blue-400" size={22} />
        </div>

        <div className="mx-auto max-w-3xl space-y-3">
          {/* Traffic Sources */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TopologyNode
              title="Legitimate Users"
              subtitle="Normal client traffic"
              icon={Users}
              status={isRunning ? "ACTIVE" : "IDLE"}
              color="green"
            >
              <Metric
                label="Legitimate Traffic"
                value={`${legitimateRps} RPS`}
              />
            </TopologyNode>

            <TopologyNode
              title="Attacker / Botnet"
              subtitle="Simulated attack sources"
              icon={Bot}
              status={isAttack && isRunning ? "ACTIVE" : "IDLE"}
              color="red"
            >
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Simulated Bots" value={simulatedBots} />
                <Metric label="Attack Traffic" value={`${attackRps} RPS`} />
              </div>
            </TopologyNode>
          </div>

          <FlowConnector
            label="Incoming Synthetic Traffic"
            color={isAttack ? "text-red-400" : "text-emerald-400"}
          />

          {/* Detection */}
          <TopologyNode
            title="DDoS Detection Engine"
            subtitle="Traffic analysis and anomaly detection"
            icon={ShieldAlert}
            status={monitoringActive ? "MONITORING" : "STOPPED"}
            color="purple"
          >
            <div className="grid grid-cols-2 gap-3">
              <Metric
                label="Analyzed Samples"
                value={monitoring.analyzed_samples ?? 0}
              />

              <Metric
                label="Detected Samples"
                value={monitoring.detected_samples ?? 0}
              />
            </div>
          </TopologyNode>

          <FlowConnector
            label="Detection and Mitigation"
            color="text-purple-400"
          />

          {/* Mitigation */}
          <TopologyNode
            title="Rate Limiting Engine"
            subtitle="Simulated traffic filtering and request control"
            icon={ShieldCheck}
            status={protectionEnabled ? "PROTECTED" : "DISABLED"}
            color="amber"
          >
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Allowed RPS" value={allowedRps} />
              <Metric label="Blocked RPS" value={blockedRps} />

              <Metric
                label="Request Limit"
                value={`${mitigation.request_limit ?? 30} RPS`}
              />

              <Metric
                label="Mitigation Rate"
                value={`${mitigationRate}%`}
              />
            </div>
          </TopologyNode>

          <FlowConnector
            label="Filtered Traffic"
            color="text-amber-400"
          />

          {/* Target Server */}
          <TopologyNode
            title="Target Server"
            subtitle="Protected application endpoint"
            icon={Server}
            status={isRunning ? "ONLINE" : "IDLE"}
            color="blue"
          >
            <div className="grid grid-cols-2 gap-3">
              <Metric
                label="CPU Usage"
                value={`${simulation.cpu_usage ?? 0}%`}
              />

              <Metric
                label="Response Time"
                value={`${simulation.response_time_ms ?? 0} ms`}
              />
            </div>
          </TopologyNode>
        </div>
      </section>

      {/* Traffic distribution and components */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-slate-900 p-5">
          <h2 className="font-semibold text-white">
            Traffic Distribution
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Current synthetic traffic composition
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-emerald-400">
                  Legitimate Traffic
                </span>
                <span className="text-white">{legitimateRps} RPS</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${trafficPercentage(legitimateRps)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-red-400">Attack Traffic</span>
                <span className="text-white">{attackRps} RPS</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-red-500 transition-all duration-500"
                  style={{
                    width: `${trafficPercentage(attackRps)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900 p-5">
          <h2 className="font-semibold text-white">
            Security Components
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Current component availability
          </p>

          <div className="mt-5 space-y-4">
            {components.map((component) => (
              <div
                key={component.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <component.icon
                    size={17}
                    className="text-slate-400"
                  />

                  <span className="text-sm text-slate-300">
                    {component.name}
                  </span>
                </div>

                <span
                  className={`flex items-center gap-1.5 text-xs ${
                    component.active
                      ? "text-emerald-400"
                      : "text-slate-500"
                  }`}
                >
                  {component.active ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}

                  {component.active ? "Operational" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Cpu size={15} />
        Virtual topology visualization · Synthetic traffic environment
      </div>
    </div>
  );
}
