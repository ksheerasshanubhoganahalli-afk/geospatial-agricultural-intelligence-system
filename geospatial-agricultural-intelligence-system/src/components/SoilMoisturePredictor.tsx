"use client";

import { useState, type FormEvent } from "react";

interface Prediction {
  predictedEvaporation: number;
  moistureAfter24h: number;
  moistureAfter72h: number;
  irrigationRecommendation: string;
  riskLevel: string;
  confidence: number;
}

const RISK_STYLES: Record<string, string> = {
  low: "bg-green-100 text-green-800 border-green-300",
  moderate: "bg-yellow-100 text-yellow-800 border-yellow-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  critical: "bg-red-100 text-red-800 border-red-300",
};

const RISK_ICONS: Record<string, string> = {
  low: "🟢",
  moderate: "🟡",
  high: "🟠",
  critical: "🔴",
};

export default function SoilMoisturePredictor() {
  const [form, setForm] = useState({
    temperature: "28",
    humidity: "65",
    windSpeed: "8",
    rainfallMm: "5",
    soilType: "loam",
    currentMoisture: "25",
    latitude: "10.045",
    longitude: "105.746",
  });
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/soil/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperature: parseFloat(form.temperature),
          humidity: parseFloat(form.humidity),
          windSpeed: parseFloat(form.windSpeed),
          rainfallMm: parseFloat(form.rainfallMm),
          soilType: form.soilType,
          currentMoisture: parseFloat(form.currentMoisture),
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
        }),
      });

      if (!res.ok) throw new Error("Prediction failed");
      const data = await res.json();
      setPrediction(data.prediction);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-700 px-6 py-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Soil Moisture Predictor
        </h2>
        <p className="text-blue-100 text-sm mt-1">Sequential regression model for evaporation forecasting</p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Environmental Parameters */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            Environmental Parameters
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={form.temperature}
                onChange={(e) => updateField("temperature", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Humidity (%)</label>
              <input
                type="number"
                step="0.1"
                value={form.humidity}
                onChange={(e) => updateField("humidity", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Wind Speed (km/h)</label>
              <input
                type="number"
                step="0.1"
                value={form.windSpeed}
                onChange={(e) => updateField("windSpeed", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Rainfall (mm/24h)</label>
              <input
                type="number"
                step="0.1"
                value={form.rainfallMm}
                onChange={(e) => updateField("rainfallMm", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Soil Parameters */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            Soil Parameters
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Soil Type</label>
              <select
                value={form.soilType}
                onChange={(e) => updateField("soilType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              >
                <option value="clay">Clay (high retention)</option>
                <option value="loam">Loam (balanced)</option>
                <option value="sandy">Sandy (fast drain)</option>
                <option value="silt">Silt (moderate)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Current Moisture (%)</label>
              <input
                type="number"
                step="0.1"
                value={form.currentMoisture}
                onChange={(e) => updateField("currentMoisture", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                required
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => updateField("latitude", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => updateField("longitude", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Running Regression Model...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Predict Moisture Evaporation
            </>
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mx-5 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {prediction && (
        <div className="mx-5 mb-5 space-y-3">
          {/* Risk Badge */}
          <div className={`p-3 rounded-xl border ${RISK_STYLES[prediction.riskLevel]}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{RISK_ICONS[prediction.riskLevel]}</span>
              <div>
                <span className="font-bold text-sm">Risk Level: {prediction.riskLevel.toUpperCase()}</span>
                <span className="ml-2 text-xs opacity-70">
                  ({(prediction.confidence * 100).toFixed(0)}% confidence)
                </span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
              <div className="text-lg font-bold text-blue-800">{prediction.predictedEvaporation}</div>
              <div className="text-[10px] text-blue-600 font-medium mt-0.5">mm/day Evap.</div>
            </div>
            <div className="bg-cyan-50 rounded-lg p-3 text-center border border-cyan-100">
              <div className="text-lg font-bold text-cyan-800">{prediction.moistureAfter24h}%</div>
              <div className="text-[10px] text-cyan-600 font-medium mt-0.5">Moisture 24h</div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-100">
              <div className="text-lg font-bold text-indigo-800">{prediction.moistureAfter72h}%</div>
              <div className="text-[10px] text-indigo-600 font-medium mt-0.5">Moisture 72h</div>
            </div>
          </div>

          {/* Moisture Bar */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Current: {form.currentMoisture}%</span>
              <span>72h: {prediction.moistureAfter72h}%</span>
            </div>
            <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (prediction.moistureAfter72h / 60) * 100)}%` }}
              />
              {/* Danger zone marker */}
              <div
                className="absolute inset-y-0 w-0.5 bg-red-400"
                style={{ left: `${(10 / 60) * 100}%` }}
                title="Critical threshold (10%)"
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>Critical: 10%</span>
              <span>Optimal: 25-35%</span>
              <span>Saturated: 60%</span>
            </div>
          </div>

          {/* Irrigation Recommendation */}
          <div className={`p-3 rounded-xl border ${
            prediction.riskLevel === "critical" || prediction.riskLevel === "high"
              ? "bg-red-50 border-red-200"
              : "bg-blue-50 border-blue-200"
          }`}>
            <p className="text-xs font-semibold text-gray-700 mb-1">💧 Irrigation Recommendation</p>
            <p className="text-xs text-gray-600 leading-relaxed">{prediction.irrigationRecommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
