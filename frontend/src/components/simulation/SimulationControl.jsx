
import { useState } from "react";
import {
  Play,
  Square,
  Zap,
  Activity,
  Bot,
  Gauge,
  LoaderCircle,
} from "lucide-react";

import api from "../../services/api";

function SimulationControl({ simulation, onRefresh }) {
  const [mode, setMode] = useState("normal");
  const [bots, setBots] = useState(10);
  const [intensity, setIntensity] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const isRunning = simulation?.status === "running";

  const handleStart = async () => {
    setSubmitting(true);
    setActionError(null);

    try {
      await api.post("/simulation/start", {
        mode,
        bots: Number(bots),
        intensity: Number(intensity),
      });

      await onRefresh();
    } catch (error) {
      setActionError(
        error.response?.data?.detail ||
        "Unable to start the simulation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStop = async () => {
    setSubmitting(true);
    setActionError(null);

    try {
      await api.post("/simulation/stop");
      await onRefresh();
    } catch (error) {
      setActionError(
        error.response?.data?.detail ||
        "Unable to stop the simulation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0d1320] p-5">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={19} className="text-cyan-400" />
            <h3 className="font-semibold text-white">
              Simulation Control
            </h3>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Configure and control synthetic network traffic.
          </p>
        </div>

        <span
          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
            isRunning
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-slate-500/10 text-slate-400"
          }`}
        >
          {isRunning ? "Simulation Running" : "Simulation Stopped"}
        </span>
      </div>

      {/* Simulation Mode */}
      <div className="mb-5">
        <label className="mb-2 block text-xs font-medium text-slate-400">
          Simulation Mode
        </label>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isRunning || submitting}
            onClick={() => setMode("normal")}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
              mode === "normal"
                ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-400"
                : "border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/5"
            }`}
          >
            <Activity size={17} />
            Normal Traffic
          </button>

          <button
            type="button"
            disabled={isRunning || submitting}
            onClick={() => setMode("attack")}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
              mode === "attack"
                ? "border-red-400/40 bg-red-400/10 text-red-400"
                : "border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/5"
            }`}
          >
            <Zap size={17} />
            Attack Simulation
          </button>
        </div>
      </div>

      {/* Simulation Parameters */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
            <Bot size={15} />
            Simulated Bots
          </label>

          <input
            type="number"
            min="1"
            max="100"
            value={bots}
            disabled={isRunning || submitting || mode === "normal"}
            onChange={(event) => setBots(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#090d16] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-40"
          />

          <p className="mt-1 text-[10px] text-slate-500">
            Allowed range: 1–100 bots
          </p>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
            <Gauge size={15} />
            Attack Intensity
          </label>

          <input
            type="number"
            min="1"
            max="10"
            value={intensity}
            disabled={isRunning || submitting || mode === "normal"}
            onChange={(event) => setIntensity(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#090d16] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-40"
          />

          <p className="mt-1 text-[10px] text-slate-500">
            Allowed range: 1–10
          </p>
        </div>
      </div>

      {mode === "attack" && (
        <div className="mb-5 rounded-xl border border-orange-400/20 bg-orange-400/5 p-3">
          <p className="text-xs leading-5 text-orange-300">
            Attack mode generates synthetic traffic metrics inside the
            simulator. It does not send real attack traffic or packets.
          </p>
        </div>
      )}

      {isRunning && (
        <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3">
          <p className="text-xs text-emerald-300">
            Current mode: {simulation.mode || "Unknown"}
            {" · "}
            Active bots: {simulation.simulated_bots ?? 0}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Stop the current simulation before changing its configuration.
          </p>
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
          {actionError}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleStart}
          disabled={isRunning || submitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting && !isRunning ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Play size={17} />
          )}
          Start Simulation
        </button>

        <button
          type="button"
          onClick={handleStop}
          disabled={!isRunning || submitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting && isRunning ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Square size={16} />
          )}
          Stop Simulation
        </button>
      </div>
    </section>
  );
}

export default SimulationControl;
