
import {
  Activity,
  Clock3,
  Cpu,
  Gauge,
  RefreshCw,
  ShieldAlert,
  Users,
  Wifi,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import useDashboardData from "../hooks/useDashboardData";

function MetricCard({ title, value, unit, icon: Icon, color, description }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className={`rounded-xl bg-white/5 p-2 ${color}`}>
          <Icon size={19} />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight text-white">
          {value}
        </span>
        <span className="text-sm text-slate-500">{unit}</span>
      </div>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function formatTime(timestamp) {
  if (!timestamp) return "--";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function Monitoring() {
  const { data, loading, error, lastUpdated, refresh } =
    useDashboardData(1000);

  const simulation = data.simulation;
  const history = data.history || [];

  const isRunning = simulation?.status === "running";

  const chartData = history.map((sample) => ({
    ...sample,
    time: formatTime(sample.timestamp),
  }));

  const recentSamples = [...history].reverse().slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="text-cyan-400" size={22} />
            <h1 className="text-2xl font-bold text-white">
              Live Network Monitoring
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Real-time monitoring of synthetic network traffic and system
            performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0d1320] px-3 py-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isRunning ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
              }`}
            />
            <span className="text-xs text-slate-300">
              {isRunning ? "Monitoring Active" : "Simulation Stopped"}
            </span>
          </div>

          <button
            onClick={refresh}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0d1320] px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>

      {/* API Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Traffic Metrics */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Wifi size={17} className="text-cyan-400" />
          <h2 className="font-semibold text-white">Traffic Overview</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Traffic"
            value={simulation?.total_rps ?? 0}
            unit="RPS"
            icon={Activity}
            color="text-cyan-400"
            description="Total simulated requests per second"
          />

          <MetricCard
            title="Attack Traffic"
            value={simulation?.attack_rps ?? 0}
            unit="RPS"
            icon={ShieldAlert}
            color="text-red-400"
            description="Simulated malicious traffic rate"
          />

          <MetricCard
            title="Legitimate Traffic"
            value={simulation?.legitimate_rps ?? 0}
            unit="RPS"
            icon={Users}
            color="text-emerald-400"
            description="Simulated legitimate requests"
          />

          <MetricCard
            title="Active Bots"
            value={simulation?.simulated_bots ?? 0}
            unit="Bots"
            icon={Wifi}
            color="text-orange-400"
            description="Number of simulated attack sources"
          />
        </div>
      </section>

      {/* Traffic Chart */}
      <section className="rounded-2xl border border-white/10 bg-[#0d1320] p-5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-white">
              Network Traffic Analysis
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Traffic distribution over recent monitoring samples
            </p>
          </div>

          <span className="rounded-lg bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-400">
            Live Data
          </span>
        </div>

        <div className="h-[320px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient id="attackGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />

                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={35}
                />

                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  labelStyle={{ color: "#94a3b8", marginBottom: 8 }}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: "12px",
                    paddingTop: "15px",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="total_rps"
                  name="Total Traffic"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fill="url(#totalGradient)"
                  connectNulls
                />

                <Area
                  type="monotone"
                  dataKey="attack_rps"
                  name="Attack Traffic"
                  stroke="#f87171"
                  strokeWidth={2}
                  fill="url(#attackGradient)"
                  connectNulls
                />

                <Area
                  type="monotone"
                  dataKey="legitimate_rps"
                  name="Legitimate Traffic"
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="transparent"
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <Activity size={32} className="text-slate-600" />
              <p className="text-sm text-slate-400">
                {loading
                  ? "Loading traffic data..."
                  : "No traffic history available yet."}
              </p>
              <p className="text-xs text-slate-600">
                Start a simulation to generate monitoring data.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Performance Metrics */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Gauge size={17} className="text-cyan-400" />
          <h2 className="font-semibold text-white">System Performance</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MetricCard
            title="CPU Usage"
            value={simulation?.cpu_usage ?? 0}
            unit="%"
            icon={Cpu}
            color="text-orange-400"
            description="Simulated target CPU utilization"
          />

          <MetricCard
            title="Response Time"
            value={simulation?.response_time_ms ?? 0}
            unit="ms"
            icon={Clock3}
            color="text-purple-400"
            description="Simulated target response latency"
          />
        </div>
      </section>

      {/* Traffic History Table */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1320]">
        <div className="border-b border-white/10 p-5">
          <h2 className="font-semibold text-white">Recent Traffic Samples</h2>
          <p className="mt-1 text-xs text-slate-500">
            Latest recorded network monitoring samples
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-white/[0.02] text-xs text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium">Timestamp</th>
                <th className="px-5 py-4 font-medium">Total RPS</th>
                <th className="px-5 py-4 font-medium">Attack RPS</th>
                <th className="px-5 py-4 font-medium">Legitimate RPS</th>
                <th className="px-5 py-4 font-medium">CPU Usage</th>
                <th className="px-5 py-4 font-medium">Mode</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {recentSamples.map((sample, index) => (
                <tr
                  key={`${sample.timestamp}-${index}`}
                  className="text-slate-300 transition hover:bg-white/[0.02]"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-400">
                    {formatTime(sample.timestamp)}
                  </td>
                  <td className="px-5 py-4 font-medium text-cyan-400">
                    {sample.total_rps ?? 0}
                  </td>
                  <td className="px-5 py-4 text-red-400">
                    {sample.attack_rps ?? 0}
                  </td>
                  <td className="px-5 py-4 text-emerald-400">
                    {sample.legitimate_rps ?? 0}
                  </td>
                  <td className="px-5 py-4">
                    {sample.cpu_usage ?? 0}%
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-md px-2 py-1 text-[10px] font-medium ${
                        sample.mode === "attack"
                          ? "bg-red-400/10 text-red-400"
                          : "bg-cyan-400/10 text-cyan-400"
                      }`}
                    >
                      {sample.mode || "normal"}
                    </span>
                  </td>
                </tr>
              ))}

              {recentSamples.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    No traffic samples recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          Last updated: {lastUpdated ? formatTime(lastUpdated) : "--"}
        </span>
        <span>Refresh interval: 1 second</span>
      </div>
    </div>
  );
}

export default Monitoring;