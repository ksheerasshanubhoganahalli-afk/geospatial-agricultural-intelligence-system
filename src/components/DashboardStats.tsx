"use client";

interface Stats {
  totals: {
    fields: number;
    detections: number;
    soilReadings: number;
    activeOutbreaks: number;
    avgMoisture: number;
    avgEvaporation: number;
  };
  diseaseDistribution: Array<{ disease: string; count: number }>;
  severityDistribution: Array<{ severity: string; count: number }>;
  cropDistribution: Array<{ cropType: string; count: number }>;
  regionsAffected: number;
}

interface DashboardStatsProps {
  stats: Stats | null;
  isLoading: boolean;
}

const SEVERITY_COLORS: Record<string, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
  critical: "#dc2626",
};

export default function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-7 bg-gray-200 rounded w-14 mb-1" />
            <div className="h-2 bg-gray-100 rounded w-28" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const totalDiseases = stats.diseaseDistribution.reduce((s, d) => s + d.count, 0);

  const statCards = [
    {
      label: "Monitored Fields",
      value: stats.totals.fields,
      icon: "🌾",
      color: "from-green-500 to-emerald-600",
      detail: `${stats.regionsAffected} regions affected`,
    },
    {
      label: "Disease Detections",
      value: stats.totals.detections,
      icon: "🔬",
      color: "from-amber-500 to-orange-600",
      detail: `${totalDiseases} confirmed infections`,
    },
    {
      label: "Active Outbreaks",
      value: stats.totals.activeOutbreaks,
      icon: "⚠️",
      color: "from-red-500 to-rose-600",
      detail: "High/Critical severity zones",
    },
    {
      label: "Avg Soil Moisture",
      value: `${stats.totals.avgMoisture}%`,
      icon: "💧",
      color: "from-blue-500 to-cyan-600",
      detail: `Evap: ${stats.totals.avgEvaporation} mm/day`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{card.icon}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${card.color}`}>
                LIVE
              </span>
            </div>
            <div className="text-2xl font-black text-gray-900">{card.value}</div>
            <div className="text-xs font-semibold text-gray-600 mt-0.5">{card.label}</div>
            <div className="text-[10px] text-gray-400 mt-1">{card.detail}</div>
          </div>
        ))}
      </div>

      {/* Disease + Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Disease Distribution */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Top Crop Diseases
          </h3>
          <div className="space-y-2">
            {stats.diseaseDistribution.slice(0, 6).map((d) => (
              <div key={d.disease} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="font-medium text-gray-700 truncate">{d.disease}</span>
                    <span className="text-gray-500 font-bold ml-2">{d.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                      style={{ width: `${(d.count / (stats.diseaseDistribution[0]?.count || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Severity + Crop Distribution */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Severity Breakdown
          </h3>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {["low", "medium", "high", "critical"].map((sev) => {
              const count = stats.severityDistribution.find((s) => s.severity === sev)?.count || 0;
              return (
                <div key={sev} className="text-center">
                  <div
                    className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white text-sm font-bold mb-1"
                    style={{ backgroundColor: SEVERITY_COLORS[sev] }}
                  >
                    {count}
                  </div>
                  <span className="text-[10px] font-medium text-gray-600 capitalize">{sev}</span>
                </div>
              );
            })}
          </div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">By Crop</h3>
          <div className="flex flex-wrap gap-1.5">
            {stats.cropDistribution.slice(0, 8).map((c) => (
              <span
                key={c.cropType}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-medium"
              >
                {c.cropType} ({c.count})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
