
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock3,
  Gauge,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import useDashboardData from "../hooks/useDashboardData";

const CHART_COLORS = ["#f87171", "#fb923c", "#facc15", "#22d3ee"];

function AnalyticsCard({
  title,
  value,
  unit,
  description,
  icon: Icon,
  color,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className={`rounded-xl bg-white/5 p-2 ${color}`}>
          <Icon size={19} />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-white">
          {value}
        </span>
        <span className="text-sm text-slate-500">{unit}</span>
      </div>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function ChartContainer({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0d1320] p-5">
      <div className="mb-5">
        <h2 className="font-semibold text-white">{title}</h2>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      {children}
    </section>
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

function Analytics() {
  const { data, loading, error, lastUpdated, refresh } =
    useDashboardData(2000);

  const history = data.history || [];
  const alerts = data.alerts || [];
  const monitoring = data.monitoring;
  const mitigation = data.mitigation;
  const mitigationAnalysis = data.mitigationAnalysis;

  // Traffic calculations
  const trafficStats = history.reduce(
    (stats, sample) => {
      stats.total += sample.total_rps || 0;
      stats.attack += sample.attack_rps || 0;
      stats.legitimate += sample.legitimate_rps || 0;

      stats.maxTotal = Math.max(
        stats.maxTotal,
        sample.total_rps || 0
      );

      stats.maxAttack = Math.max(
        stats.maxAttack,
        sample.attack_rps || 0
      );

      stats.maxCpu = Math.max(
        stats.maxCpu,
        sample.cpu_usage || 0
      );

      return stats;
    },
    {
      total: 0,
      attack: 0,
      legitimate: 0,
      maxTotal: 0,
      maxAttack: 0,
      maxCpu: 0,
    }
  );

  const sampleCount = history.length;

  const averageTotal = sampleCount
    ? (trafficStats.total / sampleCount).toFixed(1)
    : "0.0";

  const averageAttack = sampleCount
    ? (trafficStats.attack / sampleCount).toFixed(1)
    : "0.0";

  const chartData = history.map((sample) => ({
    time: formatTime(sample.timestamp),
    total: sample.total_rps || 0,
    attack: sample.attack_rps || 0,
    legitimate: sample.legitimate_rps || 0,
    cpu: sample.cpu_usage || 0,
    responseTime: sample.response_time_ms || 0,
  }));

  // Detection calculations
  const allAlertDetails = alerts.flatMap((event) => event.alerts || []);

  const alertTypeCounts = allAlertDetails.reduce((counts, alert) => {
    counts[alert.type] = (counts[alert.type] || 0) + 1;
    return counts;
  }, {});

  const detectionChartData = Object.entries(alertTypeCounts).map(
    ([type, count]) => ({
      name: type.replaceAll("_", " "),
      count,
    })
  );

  const severityCounts = alerts.reduce(
    (counts, event) => {
      const severity = event.severity || "none";

      counts[severity] = (counts[severity] || 0) + 1;

      return counts;
    },
    {}
  );

  const severityChartData = Object.entries(severityCounts)
    .filter(([severity]) => severity !== "none")
    .map(([severity, count]) => ({
      name: severity.toUpperCase(),
      value: count,
    }));

  const analyzedSamples = monitoring?.analyzed_samples || 0;
  const detectedSamples = monitoring?.detected_samples || 0;

  const detectionRate = analyzedSamples
    ? ((detectedSamples / analyzedSamples) * 100).toFixed(1)
    : "0.0";

  // Mitigation calculations
  const mitigationRate =
    mitigationAnalysis?.overall_mitigation_rate || 0;

  const protectedSamples =
    mitigationAnalysis?.protected_samples || 0;

  const averageBlocked =
    mitigationAnalysis?.average_blocked_rps || 0;

  const averageAllowed =
    mitigationAnalysis?.average_allowed_rps || 0;

  const totalBlocked =
    mitigationAnalysis?.protected_blocked_rps_sum || 0;

  const totalIncoming =
    mitigationAnalysis?.protected_incoming_rps_sum || 0;

  const mitigationChartData = [
    {
      name: "Allowed",
      value: averageAllowed,
    },
    {
      name: "Blocked",
      value: averageBlocked,
    },
  ];

  const mitigationColors = ["#34d399", "#f87171"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={22} className="text-cyan-400" />

            <h1 className="text-2xl font-bold text-white">
              Security Analytics
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Historical analysis of traffic, threat detection, and mitigation performance.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d1320] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
        >
          <Activity size={15} />
          Refresh Data
        </button>
      </div>

      {/* API Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Traffic Summary */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Activity size={17} className="text-cyan-400" />
          <h2 className="font-semibold text-white">
            Traffic Analytics
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AnalyticsCard
            title="Average Traffic"
            value={averageTotal}
            unit="RPS"
            description="Average total traffic across recorded samples"
            icon={Activity}
            color="text-cyan-400"
          />

          <AnalyticsCard
            title="Average Attack Traffic"
            value={averageAttack}
            unit="RPS"
            description="Average simulated attack traffic"
            icon={Zap}
            color="text-red-400"
          />

          <AnalyticsCard
            title="Peak Traffic"
            value={trafficStats.maxTotal}
            unit="RPS"
            description="Highest recorded total traffic"
            icon={TrendingUp}
            color="text-orange-400"
          />

          <AnalyticsCard
            title="Peak CPU Usage"
            value={trafficStats.maxCpu}
            unit="%"
            description="Highest simulated CPU utilization"
            icon={Gauge}
            color="text-purple-400"
          />
        </div>
      </section>

      {/* Traffic Trend */}
      <ChartContainer
        title="Traffic Trends"
        description="Historical comparison of total, attack, and legitimate traffic"
      >
        <div className="h-[320px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
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
                />

                <Legend
                  wrapperStyle={{
                    fontSize: "12px",
                    paddingTop: "15px",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Traffic"
                  stroke="#22d3ee"
                  fill="#22d3ee"
                  fillOpacity={0.08}
                  strokeWidth={2}
                />

                <Area
                  type="monotone"
                  dataKey="attack"
                  name="Attack Traffic"
                  stroke="#f87171"
                  fill="#f87171"
                  fillOpacity={0.08}
                  strokeWidth={2}
                />

                <Area
                  type="monotone"
                  dataKey="legitimate"
                  name="Legitimate Traffic"
                  stroke="#34d399"
                  fill="transparent"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              {loading
                ? "Loading traffic history..."
                : "No traffic samples available. Start a simulation first."}
            </div>
          )}
        </div>
      </ChartContainer>

      {/* Performance Trends */}
      <ChartContainer
        title="System Performance Trends"
        description="CPU utilization and response time across recorded samples"
      >
        <div className="h-[280px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
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
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: "12px",
                    paddingTop: "15px",
                  }}
                />

                <Bar
                  dataKey="cpu"
                  name="CPU Usage (%)"
                  fill="#a78bfa"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="responseTime"
                  name="Response Time (ms)"
                  fill="#22d3ee"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No performance history available.
            </div>
          )}
        </div>
      </ChartContainer>

      {/* Detection Analytics */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle size={17} className="text-orange-400" />
          <h2 className="font-semibold text-white">
            Detection Analytics
          </h2>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AnalyticsCard
            title="Analyzed Samples"
            value={analyzedSamples}
            unit="Samples"
            description="Total samples processed by automatic monitoring"
            icon={Activity}
            color="text-cyan-400"
          />

          <AnalyticsCard
            title="Detection Rate"
            value={`${detectionRate}%`}
            unit=""
            description="Detected samples relative to analyzed samples"
            icon={AlertTriangle}
            color="text-orange-400"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartContainer
            title="Alert Types Distribution"
            description="Distribution of individual alert types in the stored alert history"
          >
            <div className="h-[280px] w-full">
              {detectionChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={detectionChartData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1e293b"
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      stroke="#64748b"
                      tick={{ fontSize: 10 }}
                      allowDecimals={false}
                    />

                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#64748b"
                      tick={{ fontSize: 10 }}
                      width={130}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />

                    <Bar
                      dataKey="count"
                      name="Alert Count"
                      fill="#f87171"
                      radius={[0, 5, 5, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  No alert type data available.
                </div>
              )}
            </div>
          </ChartContainer>

          <ChartContainer
            title="Severity Distribution"
            description="Distribution of stored detection events by severity"
          >
            <div className="h-[280px] w-full">
              {severityChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={90}
                      paddingAngle={3}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {severityChartData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={
                            CHART_COLORS[index % CHART_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />

                    <Legend
                      wrapperStyle={{
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  No severity data available.
                </div>
              )}
            </div>
          </ChartContainer>
        </div>
      </section>

      {/* Mitigation Analytics */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck size={17} className="text-emerald-400" />
          <h2 className="font-semibold text-white">
            Mitigation Analytics
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnalyticsCard
            title="Overall Mitigation Rate"
            value={mitigationRate}
            unit="%"
            description="Cumulative percentage of blocked incoming traffic"
            icon={ShieldCheck}
            color="text-emerald-400"
          />

          <AnalyticsCard
            title="Protected Samples"
            value={protectedSamples}
            unit="Samples"
            description="Samples processed while rate limiting was enabled"
            icon={Zap}
            color="text-cyan-400"
          />

          <AnalyticsCard
            title="Average Blocked Traffic"
            value={averageBlocked}
            unit="RPS"
            description="Average blocked requests per protected sample"
            icon={TrendingUp}
            color="text-red-400"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartContainer
            title="Allowed vs Blocked Traffic"
            description="Average traffic distribution during protected samples"
          >
            <div className="h-[260px] w-full">
              {protectedSamples > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mitigationChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label={({ name, value }) =>
                        `${name}: ${value} RPS`
                      }
                    >
                      {mitigationChartData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={mitigationColors[index]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />

                    <Legend
                      wrapperStyle={{
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  Enable protection and run a simulation to collect mitigation data.
                </div>
              )}
            </div>
          </ChartContainer>

          <ChartContainer
            title="Mitigation Summary"
            description="Current cumulative protection statistics"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-sm text-slate-400">
                  Total Incoming Requests
                </span>
                <span className="font-semibold text-white">
                  {totalIncoming}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-sm text-slate-400">
                  Total Blocked Requests
                </span>
                <span className="font-semibold text-red-400">
                  {totalBlocked}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-sm text-slate-400">
                  Average Allowed RPS
                </span>
                <span className="font-semibold text-emerald-400">
                  {averageAllowed}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Current Protection Status
                </span>

                <span
                  className={`rounded-lg px-2.5 py-1 text-xs ${
                    mitigation?.enabled
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "bg-slate-500/10 text-slate-400"
                  }`}
                >
                  {mitigation?.enabled ? "ACTIVE" : "DISABLED"}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
                <Clock3 size={14} />
                Current request limit: {mitigation?.request_limit ?? "--"} RPS
              </div>
            </div>
          </ChartContainer>
        </div>
      </section>

      {/* Historical Data Table */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1320]">
        <div className="border-b border-white/10 p-5">
          <h2 className="font-semibold text-white">
            Historical Traffic Records
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Latest recorded samples used in analytics calculations
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
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {history.length > 0 ? (
                history
                  .slice()
                  .reverse()
                  .slice(0, 10)
                  .map((sample, index) => (
                    <tr
                      key={`${sample.timestamp}-${index}`}
                      className="text-slate-300 transition hover:bg-white/[0.02]"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-400">
                        {formatTime(sample.timestamp)}
                      </td>

                      <td className="px-5 py-4 text-cyan-400">
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
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    No historical records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500">
        <span>
          Last updated:{" "}
          {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "--"}
        </span>

        <span>Analytics refresh interval: 2 seconds</span>
      </div>
    </div>
  );
}

export default Analytics;
