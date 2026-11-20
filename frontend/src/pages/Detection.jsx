
import { useState } from "react";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Play,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";

import useDashboardData from "../hooks/useDashboardData";
import api from "../services/api";

function StatCard({ title, value, description, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className={`rounded-xl bg-white/5 p-2 ${color}`}>
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-semibold text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const styles = {
    critical: "bg-red-500/10 text-red-400 border-red-500/20",
    high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    none: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  return (
    <span
      className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold uppercase ${
        styles[severity] || styles.none
      }`}
    >
      {severity || "unknown"}
    </span>
  );
}

function getAlertDetails(type) {
  const details = {
    high_traffic: {
      title: "High Traffic",
      description: "Unusually high traffic rate detected.",
    },
    simulated_attack_traffic: {
      title: "Simulated Attack Traffic",
      description: "Simulated attack traffic is present.",
    },
    high_cpu_usage: {
      title: "High CPU Usage",
      description: "High CPU utilization detected.",
    },
    high_response_time: {
      title: "High Response Time",
      description: "Unusually high response time detected.",
    },
  };

  return details[type] || {
    title: type?.replaceAll("_", " ") || "Unknown Alert",
    description: "Anomaly detected by the detection engine.",
  };
}

function formatDate(timestamp) {
  if (!timestamp) return "--";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleString();
}

function Detection() {
  const { data, loading, error, lastUpdated, refresh } =
    useDashboardData(1000);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const monitoring = data.monitoring;
  const alerts = data.alerts || [];

  const isMonitoring = monitoring?.monitoring === "running";

  const alertEvents = alerts.flatMap((event, eventIndex) =>
    (event.alerts || []).map((alert, alertIndex) => ({
      ...alert,
      severity: event.severity,
      detectedAt: event.analyzed_at,
      id: `${eventIndex}-${alertIndex}-${alert.type}`,
    }))
  );

  const detectionRate =
    monitoring?.analyzed_samples > 0
      ? (
          (monitoring.detected_samples /
            monitoring.analyzed_samples) *
          100
        ).toFixed(1)
      : "0.0";

  const latestAlert = alerts[alerts.length - 1];

  const runAction = async (action, successMessage) => {
    setActionLoading(true);
    setActionError(null);
    setActionMessage(null);

    try {
      await action();
      await refresh();
      setActionMessage(successMessage);
    } catch (err) {
      setActionError(
        err.response?.data?.detail ||
          "The requested operation could not be completed."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleAnalyze = () =>
    runAction(
      () => api.post("/detection/analyze"),
      "Traffic analysis completed successfully."
    );

  const handleMonitoring = () =>
    runAction(
      () =>
        api.post(
          `/detection/monitoring/${isMonitoring ? "stop" : "start"}`
        ),
      isMonitoring
        ? "Automatic monitoring stopped."
        : "Automatic monitoring started."
    );

  const handleClearAlerts = () =>
    runAction(
      () => api.delete("/detection/alerts"),
      "Detection alert history cleared successfully."
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={22} className="text-cyan-400" />
            <h1 className="text-2xl font-bold text-white">
              Threat Detection Center
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Monitor security alerts and analyze abnormal network traffic.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={actionLoading}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d1320] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {actionError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          <XCircle size={18} />
          {actionError}
        </div>
      )}

      {actionMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-400">
          <CheckCircle2 size={18} />
          {actionMessage}
        </div>
      )}

      {/* Detection Status */}
      <section className="rounded-2xl border border-white/10 bg-[#0d1320] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-xl p-3 ${
                isMonitoring
                  ? "bg-emerald-400/10 text-emerald-400"
                  : "bg-slate-500/10 text-slate-400"
              }`}
            >
              {isMonitoring ? (
                <ShieldCheck size={24} />
              ) : (
                <ShieldAlert size={24} />
              )}
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Automatic Detection Engine
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {isMonitoring
                  ? "The monitoring service is actively analyzing traffic."
                  : "Automatic monitoring is currently stopped."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-lg px-3 py-2 text-xs font-medium ${
                isMonitoring
                  ? "bg-emerald-400/10 text-emerald-400"
                  : "bg-slate-500/10 text-slate-400"
              }`}
            >
              {isMonitoring ? "ACTIVE" : "STOPPED"}
            </span>

            <button
              type="button"
              onClick={handleMonitoring}
              disabled={actionLoading}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isMonitoring
                  ? "border border-red-400/20 bg-red-400/10 text-red-400 hover:bg-red-400/20"
                  : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              }`}
            >
              {isMonitoring ? (
                <XCircle size={16} />
              ) : (
                <Play size={16} />
              )}

              {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
            </button>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Activity size={17} className="text-cyan-400" />
          <h2 className="font-semibold text-white">
            Detection Statistics
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Analyzed Samples"
            value={monitoring?.analyzed_samples ?? 0}
            description="Total traffic samples analyzed"
            icon={Activity}
            color="text-cyan-400"
          />

          <StatCard
            title="Detected Samples"
            value={monitoring?.detected_samples ?? 0}
            description="Samples containing detected anomalies"
            icon={ShieldAlert}
            color="text-red-400"
          />

          <StatCard
            title="Detection Rate"
            value={`${detectionRate}%`}
            description="Detected samples / analyzed samples"
            icon={AlertTriangle}
            color="text-orange-400"
          />

          <StatCard
            title="Stored Alert Events"
            value={alerts.length}
            description="Stored detection result events"
            icon={Bell}
            color="text-purple-400"
          />
        </div>
      </section>

      {/* Manual Analysis */}
      <section className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.03] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-white">
              Manual Traffic Analysis
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Execute an immediate analysis using the current simulation metrics.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={actionLoading}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Activity size={17} />
            Analyze Traffic
          </button>
        </div>
      </section>

      {/* Latest Detection */}
      <section className="rounded-2xl border border-white/10 bg-[#0d1320] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-semibold text-white">
            Latest Detection Result
          </h2>

          {latestAlert && (
            <SeverityBadge severity={latestAlert.severity} />
          )}
        </div>

        {latestAlert ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {latestAlert.detected ? (
                <AlertTriangle className="text-orange-400" size={20} />
              ) : (
                <CheckCircle2 className="text-emerald-400" size={20} />
              )}

              <p className="text-sm text-slate-300">
                {latestAlert.detected
                  ? `${latestAlert.alerts?.length ?? 0} anomalies detected in the latest stored event.`
                  : "No anomalies detected in the latest stored event."}
              </p>
            </div>

            <p className="text-xs text-slate-500">
              Analyzed at: {formatDate(latestAlert.analyzed_at)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No detection events have been stored yet. Start a simulation
            and run traffic analysis.
          </p>
        )}
      </section>

      {/* Alerts */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1320]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
          <div>
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-cyan-400" />
              <h2 className="font-semibold text-white">
                Security Alerts
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Individual anomalies reported by the detection engine
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearAlerts}
            disabled={actionLoading || alerts.length === 0}
            className="flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={14} />
            Clear Alerts
          </button>
        </div>

        <div className="divide-y divide-white/5">
          {loading && alertEvents.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading security alerts...
            </div>
          ) : alertEvents.length > 0 ? (
            alertEvents
              .slice()
              .reverse()
              .map((alert) => {
                const details = getAlertDetails(alert.type);

                return (
                  <div
                    key={alert.id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-red-400/10 p-2.5 text-red-400">
                        <AlertCircle size={19} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-medium text-white">
                            {details.title}
                          </h3>

                          <SeverityBadge severity={alert.severity} />
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                          {alert.message || details.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                          <span>
                            Observed:{" "}
                            <strong className="text-slate-300">
                              {alert.value ?? "--"}
                            </strong>
                          </span>

                          <span>
                            Threshold:{" "}
                            <strong className="text-slate-300">
                              {alert.threshold ?? "--"}
                            </strong>
                          </span>

                          <span>
                            <Clock3 size={12} className="mr-1 inline" />
                            {formatDate(alert.detectedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase tracking-wider text-slate-600">
                      {alert.type}
                    </span>
                  </div>
                );
              })
          ) : (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <ShieldCheck size={34} className="text-emerald-400" />

              <h3 className="mt-3 text-sm font-medium text-white">
                No Security Alerts
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                No stored anomalies are currently available.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500">
        <span>
          Last updated: {formatDate(lastUpdated)}
        </span>

        <span>Automatic refresh interval: 1 second</span>
      </div>
    </div>
  );
}

export default Detection;
