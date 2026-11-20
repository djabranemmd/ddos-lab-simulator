
import { useState } from "react";

import {
  Activity,
  CheckCircle2,
  Gauge,
  Lock,
  LockOpen,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  Zap,
} from "lucide-react";

import useDashboardData from "../hooks/useDashboardData";
import api from "../services/api";

function MetricCard({ title, value, unit, description, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className={`rounded-xl bg-white/5 p-2 ${color}`}>
          <Icon size={19} />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-white">{value}</span>
        <span className="text-sm text-slate-500">{unit}</span>
      </div>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function Mitigation() {
  const { data, loading, error, lastUpdated, refresh } =
    useDashboardData(1000);

  const [requestLimit, setRequestLimit] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const mitigation = data.mitigation;
  const analysis = data.mitigationAnalysis;

  const isEnabled = mitigation?.enabled === true;
  const lastResult = mitigation?.last_result || {};

  const incomingRps = lastResult.incoming_rps ?? 0;
  const allowedRps = lastResult.allowed_rps ?? 0;
  const blockedRps = lastResult.blocked_rps ?? 0;
  const mitigationRate = lastResult.mitigation_rate ?? 0;

  const overallRate = analysis?.overall_mitigation_rate ?? 0;

  const runAction = async (action, successMessage) => {
    setSubmitting(true);
    setActionError(null);
    setActionMessage(null);

    try {
      await action();
      await refresh();
      setActionMessage(successMessage);
    } catch (err) {
      setActionError(
        err.response?.data?.detail ||
          "Unable to complete the mitigation operation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnable = () => {
    const limit = Number(requestLimit);

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      setActionError("Request limit must be an integer between 1 and 100.");
      return;
    }

    runAction(
      () => api.post("/mitigation/enable", { request_limit: limit }),
      `Rate limiting enabled with a limit of ${limit} RPS.`
    );
  };

  const handleDisable = () =>
    runAction(
      () => api.post("/mitigation/disable"),
      "Rate limiting has been disabled."
    );

  const handleReset = () =>
    runAction(
      () => api.delete("/mitigation/analysis"),
      "Mitigation statistics have been reset."
    );

  const protectionWidth = Math.min(
    Math.max(Number(overallRate) || 0, 0),
    100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={22} className="text-cyan-400" />
            <h1 className="text-2xl font-bold text-white">
              Mitigation Center
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Configure rate limiting and monitor simulated traffic protection.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d1320] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Errors and messages */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {actionError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {actionError}
        </div>
      )}

      {actionMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-400">
          <CheckCircle2 size={17} />
          {actionMessage}
        </div>
      )}

      {/* Protection Status */}
      <section className="rounded-2xl border border-white/10 bg-[#0d1320] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-xl p-3 ${
                isEnabled
                  ? "bg-emerald-400/10 text-emerald-400"
                  : "bg-slate-500/10 text-slate-400"
              }`}
            >
              {isEnabled ? <ShieldCheck size={25} /> : <ShieldAlert size={25} />}
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Rate Limiting Protection
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {isEnabled
                  ? `Protection active. Current limit: ${mitigation.request_limit} RPS.`
                  : "Protection is currently disabled."}
              </p>
            </div>
          </div>

          <span
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
              isEnabled
                ? "bg-emerald-400/10 text-emerald-400"
                : "bg-slate-500/10 text-slate-400"
            }`}
          >
            {isEnabled ? "PROTECTION ACTIVE" : "PROTECTION DISABLED"}
          </span>
        </div>
      </section>

      {/* Configuration */}
      <section className="rounded-2xl border border-white/10 bg-[#0d1320] p-5">
        <div className="mb-5 flex items-center gap-2">
          <Gauge size={19} className="text-cyan-400" />
          <h2 className="font-semibold text-white">
            Rate Limit Configuration
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="request-limit"
              className="mb-2 block text-xs font-medium text-slate-400"
            >
              Maximum Allowed Requests Per Second
            </label>

            <input
              id="request-limit"
              type="number"
              min="1"
              max="100"
              step="1"
              value={requestLimit}
              disabled={isEnabled || submitting}
              onChange={(event) => setRequestLimit(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#090d16] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-40"
            />

            <p className="mt-2 text-xs text-slate-500">
              Allowed configuration range: 1–100 RPS.
            </p>
          </div>

          <div className="flex flex-col justify-end gap-3">
            {!isEnabled ? (
              <button
                type="button"
                onClick={handleEnable}
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
              >
                <Lock size={17} />
                Enable Protection
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDisable}
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-400/20 disabled:opacity-50"
              >
                <LockOpen size={17} />
                Disable Protection
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Live Mitigation Metrics */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Activity size={17} className="text-cyan-400" />
          <h2 className="font-semibold text-white">
            Live Mitigation Metrics
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Incoming Traffic"
            value={incomingRps}
            unit="RPS"
            description="Incoming simulated requests"
            icon={Activity}
            color="text-cyan-400"
          />

          <MetricCard
            title="Allowed Traffic"
            value={allowedRps}
            unit="RPS"
            description="Requests accepted by rate limiter"
            icon={CheckCircle2}
            color="text-emerald-400"
          />

          <MetricCard
            title="Blocked Traffic"
            value={blockedRps}
            unit="RPS"
            description="Requests blocked by rate limiter"
            icon={ShieldAlert}
            color="text-red-400"
          />

          <MetricCard
            title="Mitigation Rate"
            value={mitigationRate}
            unit="%"
            description="Percentage of incoming traffic blocked"
            icon={TrendingDown}
            color="text-orange-400"
          />
        </div>
      </section>

      {/* Traffic Distribution */}
      <section className="rounded-2xl border border-white/10 bg-[#0d1320] p-5">
        <div className="mb-5">
          <h2 className="font-semibold text-white">
            Traffic Distribution
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Current allowed and blocked traffic distribution
          </p>
        </div>

        <div className="mb-3 flex justify-between text-xs">
          <span className="text-emerald-400">
            Allowed: {allowedRps} RPS
          </span>

          <span className="text-red-400">
            Blocked: {blockedRps} RPS
          </span>
        </div>

        <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-800">
          {incomingRps > 0 && (
            <>
              <div
                className="h-full bg-emerald-400 transition-all duration-500"
                style={{
                  width: `${(allowedRps / incomingRps) * 100}%`,
                }}
              />

              <div
                className="h-full bg-red-400 transition-all duration-500"
                style={{
                  width: `${(blockedRps / incomingRps) * 100}%`,
                }}
              />
            </>
          )}
        </div>

        {incomingRps === 0 && (
          <p className="mt-3 text-xs text-slate-500">
            Waiting for incoming traffic samples.
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-5 text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
            Allowed Requests
          </span>

          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-400" />
            Blocked Requests
          </span>
        </div>
      </section>

      {/* Historical Analysis */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Zap size={17} className="text-cyan-400" />
          <h2 className="font-semibold text-white">
            Protection Analytics
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            title="Protected Samples"
            value={analysis?.protected_samples ?? 0}
            unit="Samples"
            description="Samples processed while protection was enabled"
            icon={Shield}
            color="text-emerald-400"
          />

          <MetricCard
            title="Average Blocked Traffic"
            value={analysis?.average_blocked_rps ?? 0}
            unit="RPS"
            description="Average blocked requests per protected sample"
            icon={TrendingDown}
            color="text-red-400"
          />

          <MetricCard
            title="Overall Mitigation Rate"
            value={overallRate}
            unit="%"
            description="Total blocked traffic / total incoming protected traffic"
            icon={Gauge}
            color="text-cyan-400"
          />
        </div>
      </section>

      {/* Overall Protection Progress */}
      <section className="rounded-2xl border border-white/10 bg-[#0d1320] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-white">
              Overall Protection Performance
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Cumulative mitigation effectiveness
            </p>
          </div>

          <span className="text-2xl font-bold text-cyan-400">
            {overallRate}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-cyan-400 transition-all duration-500"
            style={{ width: `${protectionWidth}%` }}
          />
        </div>

        <div className="mt-3 flex justify-between text-xs text-slate-500">
          <span>0%</span>
          <span>100%</span>
        </div>
      </section>

      {/* Reset Statistics */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0d1320] p-5">
        <div>
          <h2 className="font-semibold text-white">
            Reset Protection Statistics
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Clear cumulative mitigation statistics without disabling protection.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={submitting || loading}
          className="flex items-center gap-2 rounded-xl border border-orange-400/20 bg-orange-400/5 px-4 py-2.5 text-sm text-orange-400 transition hover:bg-orange-400/10 disabled:opacity-40"
        >
          <RotateCcw size={15} />
          Reset Statistics
        </button>
      </section>

      <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500">
        <span>
          Last updated:{" "}
          {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "--"}
        </span>

        <span>Refresh interval: 1 second</span>
      </div>
    </div>
  );
}

export default Mitigation;
