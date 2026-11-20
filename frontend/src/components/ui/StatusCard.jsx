
function StatusCard({ title, value, subtitle, icon: Icon, color = "cyan" }) {
  const colors = {
    cyan: "text-cyan-400 bg-cyan-400/10",
    green: "text-emerald-400 bg-emerald-400/10",
    red: "text-red-400 bg-red-400/10",
    orange: "text-orange-400 bg-orange-400/10",
    blue: "text-blue-400 bg-blue-400/10",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-5 transition hover:border-cyan-400/30">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className={`rounded-xl p-2 ${colors[color] || colors.cyan}`}>
          <Icon size={19} />
        </div>
      </div>

      <h3 className="mt-5 text-3xl font-bold tracking-tight text-white">
        {value}
      </h3>

      <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

export default StatusCard;
