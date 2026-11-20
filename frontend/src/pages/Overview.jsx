import SimulationControl from "../components/simulation/SimulationControl";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Cpu,
  ShieldAlert,
  ShieldCheck,
  Clock,
  RefreshCw,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import StatusCard from "../components/ui/StatusCard";
import useDashboardData from "../hooks/useDashboardData";

function Overview() {
  const { data, loading, error, lastUpdated, refresh } =
    useDashboardData(1000);

  const simulation = data.simulation || {};
  const monitoring = data.monitoring || {};
  const mitigation = data.mitigation || {};
  const mitigationResult = mitigation.last_result || {};
  const mitigationAnalysis = data.mitigationAnalysis || {};

  const formatValue = (value, suffix = "") =>
    value !== null && value !== undefined
      ? `${value}${suffix}`
      : "--";

  const chartData = data.history.map((item, index) => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    traffic: item.total_rps || 0,
    attack: item.attack_rps || 0,
    legitimate: item.legitimate_rps || 0,
    index,
  }));

  const latestAlerts = data.alerts.slice(0, 5);

  return (
    <div className="space-y-7">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Security Overview
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Real-time network traffic and security monitoring.
          </p>
        </div>

        <button
          onClick={refresh}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/10"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Connection Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0d1320] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${
            error ? "bg-red-500" : "bg-emerald-400"
          }`} />
<SimulationControl
  simulation={simulation}
  onRefresh={refresh}
/>
          <span className="text-sm font-medium text-slate-300">
            {error ? "Backend connection issue" : "Backend connected"}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
          <span>
            Simulation: {simulation.status || "Unknown"}
          </span>
          <span>
            Monitoring: {monitoring.monitoring || "Unknown"}
          </span>
          <span>
            Protection: {mitigation.enabled ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Traffic Metrics */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Activity size={18} className="text-cyan-400" />
          <h3 className="font-semibold text-white">Traffic Metrics</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatusCard
            title="Total Traffic"
            value={formatValue(simulation.total_rps, " RPS")}
            subtitle="Incoming requests per second"
            icon={Activity}
            color="cyan"
          />

          <StatusCard
            title="Attack Traffic"
            value={formatValue(simulation.attack_rps, " RPS")}
            subtitle="Simulated malicious traffic"
            icon={ShieldAlert}
            color="red"
          />

          <StatusCard
            title="Legitimate Traffic"
            value={formatValue(simulation.legitimate_rps, " RPS")}
            subtitle="Normal simulated traffic"
            icon={ArrowUpFromLine}
            color="green"
          />

          <StatusCard
            title="Simulated Bots"
            value={formatValue(simulation.simulated_bots)}
            subtitle="Active simulated attackers"
            icon={Activity}
            color="orange"
          />
        </div>
      </section>

      {/* Performance Metrics */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Cpu size={18} className="text-cyan-400" />
          <h3 className="font-semibold text-white">System Performance</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatusCard
            title="CPU Usage"
            value={formatValue(simulation.cpu_usage, "%")}
            subtitle="Simulated resource utilization"
            icon={Cpu}
            color="orange"
          />

          <StatusCard
            title="Response Time"
            value={formatValue(simulation.response_time_ms, " ms")}
            subtitle="Simulated response latency"
            icon={Clock}
            color="blue"
          />

          <StatusCard
            title="Detection Samples"
            value={formatValue(monitoring.analyzed_samples)}
            subtitle={`${monitoring.detected_samples || 0} detected samples`}
            icon={ShieldAlert}
            color="red"
          />
        </div>
      </section>

      {/* Traffic Chart */}
      <section className="rounded-2xl border border-white/10 bg-[#0d1320] p-5">
        <div className="mb-6">
          <h3 className="font-semibold text-white">Network Traffic Analysis</h3>
          <p className="mt-1 text-xs text-slate-500">
            Historical traffic samples
          </p>
        </div>

        <div className="h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  minTickGap={25}
                />

                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                />

                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="traffic"
                  stroke="#06b6d4"
                  fill="url(#trafficGradient)"
                  strokeWidth={2}
                  name="Total Traffic"
                />

                <Area
                  type="monotone"
                  dataKey="attack"
                  stroke="#ef4444"
                  fill="transparent"
                  strokeWidth={2}
                  name="Attack Traffic"
                />

                <Area
                  type="monotone"
                  dataKey="legitimate"
                  stroke="#10b981"
                  fill="transparent"
                  strokeWidth={2}
                  name="Legitimate Traffic"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              {loading ? "Loading traffic history..." : "No traffic history available."}
            </div>
          )}
        </div>
      </section>

      {/* Mitigation and Alerts */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        <section className="rounded-2xl border border-white/10 bg-[#0d1320] p-5">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-white">Mitigation Overview</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">Allowed RPS</p>
              <p className="mt-2 text-2xl font-bold text-emerald-400">
                {formatValue(mitigationResult.allowed_rps)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Blocked RPS</p>
              <p className="mt-2 text-2xl font-bold text-red-400">
                {formatValue(mitigationResult.blocked_rps)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Mitigation Rate</p>
              <p className="mt-2 text-2xl font-bold text-cyan-400">
                {formatValue(mitigationResult.mitigation_rate, "%")}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Request Limit</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {formatValue(mitigation.request_limit, " RPS")}
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="text-xs text-slate-500">
              Overall Mitigation Rate
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {formatValue(mitigationAnalysis.overall_mitigation_rate, "%")}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0d1320] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-red-400" />
              <h3 className="font-semibold text-white">Recent Alerts</h3>
            </div>

            <span className="rounded-lg bg-red-500/10 px-2.5 py-1 text-xs text-red-400">
              {data.alerts.length} alerts
            </span>
          </div>

          <div className="space-y-3">
            {latestAlerts.length > 0 ? (
              latestAlerts.map((alert, index) => (
                <div
                  key={`${alert.analyzed_at || alert.type}-${index}`}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-200">
                      {alert.alerts?.[0]?.message || alert.message || alert.type}
                    </p>

                    <span className="shrink-0 rounded-md bg-red-500/10 px-2 py-1 text-[10px] uppercase text-red-400">
                      {alert.severity || "Alert"}
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] text-slate-500">
                    {alert.analyzed_at
                      ? new Date(alert.analyzed_at).toLocaleString()
                      : "Detection event"}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">
                No detection alerts available.
              </p>
            )}
          </div>
        </section>

      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>
          Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "--"}
        </span>
        <span className="flex items-center gap-2">
          <ArrowDownToLine size={13} />
          Live API Data
        </span>
      </div>

    </div>
  );
}

export default Overview;
