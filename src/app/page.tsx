"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import DashboardStats from "@/components/DashboardStats";
import AgriMap from "@/components/AgriMap";
import DiseaseDetector from "@/components/DiseaseDetector";
import SoilMoisturePredictor from "@/components/SoilMoisturePredictor";

type Tab = "map" | "detect" | "soil" | "stats";

interface Detection {
  id: string;
  disease: string;
  confidence: number;
  severity: string;
  latitude: number;
  longitude: number;
  cropType: string;
  description: string | null;
  createdAt: string | null;
}

interface Outbreak {
  centerLat: number;
  centerLng: number;
  radius: number;
  disease: string;
  severity: string;
  count: number;
  detectionIds: string[];
}

interface Field {
  id: string;
  name: string;
  cropType: string;
  latitude: number;
  longitude: number;
  areaHectares: number | null;
}

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

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("map");
  const [detections, setDetections] = useState<Detection[]>([]);
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [detRes, outRes, fieldRes, statsRes] = await Promise.all([
        fetch("/api/detections?limit=500"),
        fetch("/api/detections/outbreaks"),
        fetch("/api/fields"),
        fetch("/api/stats"),
      ]);

      if (detRes.ok) {
        const data = await detRes.json();
        setDetections(data.detections || []);
      }
      if (outRes.ok) {
        const data = await outRes.json();
        setOutbreaks(data.outbreaks || []);
      }
      if (fieldRes.ok) {
        const data = await fieldRes.json();
        setFields(data.fields || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Seed failed:", err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDetectionComplete = () => {
    // Refresh data after a new detection
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isSeeding={isSeeding}
        onSeed={handleSeed}
      />

      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {/* Hero Banner when no data */}
        {!isLoading && detections.length === 0 && (
          <div className="mb-6 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" viewBox="0 0 400 200">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-2xl font-black mb-2">Welcome to AgriCrop Intelligence</h2>
              <p className="text-emerald-100 text-sm leading-relaxed mb-4">
                Geospatial plant disease detection and soil moisture monitoring for smallholder farms worldwide.
                Upload leaf images for AI-powered disease identification, predict soil moisture evaporation,
                and track crop outbreak zones across regions.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSeed}
                  disabled={isSeeding}
                  className="px-5 py-2.5 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition text-sm flex items-center gap-2 shadow-lg"
                >
                  {isSeeding ? (
                    <div className="animate-spin w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full" />
                  ) : (
                    <span>🌱</span>
                  )}
                  Load Demo Data
                </button>
                <button
                  onClick={() => setActiveTab("detect")}
                  className="px-5 py-2.5 bg-white/15 text-white font-bold rounded-xl hover:bg-white/25 transition text-sm border border-white/30"
                >
                  🔬 Try Disease Detection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        {(activeTab === "map" || activeTab === "stats") && (
          <div className="mb-6">
            <DashboardStats stats={stats} isLoading={isLoading} />
          </div>
        )}

        {/* Main Content */}
        {activeTab === "map" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Global Outbreak Map
                </h2>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Low</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Medium</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> High</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-700" /> Critical</span>
                </div>
              </div>
              <div className="h-[600px]">
                <AgriMap
                  detections={detections}
                  outbreaks={outbreaks}
                  fields={fields}
                  onSelectDetection={setSelectedDetection}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Selected Detection Detail */}
              {selectedDetection && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-800 text-sm">Detection Detail</h3>
                    <button
                      onClick={() => setSelectedDetection(null)}
                      className="text-gray-400 hover:text-gray-600 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Disease</span>
                      <span className="font-bold">{selectedDetection.disease}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Severity</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        selectedDetection.severity === "critical" ? "bg-red-100 text-red-700" :
                        selectedDetection.severity === "high" ? "bg-orange-100 text-orange-700" :
                        selectedDetection.severity === "medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {selectedDetection.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Confidence</span>
                      <span className="font-bold">{(selectedDetection.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Crop</span>
                      <span className="font-medium">{selectedDetection.cropType}</span>
                    </div>
                    {selectedDetection.description && (
                      <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">{selectedDetection.description}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Outbreak Summary */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-rose-600 px-5 py-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="animate-pulse">⚠️</span>
                    Active Outbreak Zones
                  </h3>
                </div>
                <div className="p-4 max-h-[400px] overflow-y-auto space-y-2">
                  {outbreaks.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No outbreak clusters detected</p>
                  ) : (
                    outbreaks.slice(0, 12).map((outbreak, i) => (
                      <div
                        key={i}
                        className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-red-200 transition"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-gray-800">{outbreak.disease}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            outbreak.severity === "critical" ? "bg-red-100 text-red-700" :
                            outbreak.severity === "high" ? "bg-orange-100 text-orange-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {outbreak.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 space-y-0.5">
                          <div>📍 {outbreak.centerLat.toFixed(2)}°, {outbreak.centerLng.toFixed(2)}°</div>
                          <div>🔢 {outbreak.count} detections · ~{outbreak.radius.toFixed(1)}km radius</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Detections */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800">Recent Detections</h3>
                </div>
                <div className="p-3 max-h-[300px] overflow-y-auto space-y-1.5">
                  {detections.slice(0, 15).map((det) => (
                    <div
                      key={det.id}
                      onClick={() => setSelectedDetection(det)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    >
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        det.severity === "critical" ? "bg-red-600" :
                        det.severity === "high" ? "bg-orange-500" :
                        det.severity === "medium" ? "bg-yellow-500" :
                        "bg-green-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-800 truncate">{det.disease}</div>
                        <div className="text-[10px] text-gray-400">{det.cropType}</div>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {(det.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "detect" && (
          <div className="max-w-xl mx-auto">
            <DiseaseDetector onDetectionComplete={handleDetectionComplete} />
          </div>
        )}

        {activeTab === "soil" && (
          <div className="max-w-xl mx-auto">
            <SoilMoisturePredictor />
          </div>
        )}

        {activeTab === "stats" && !isLoading && stats && (
          <div className="mt-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Network Intelligence Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200">
                <h3 className="font-bold text-emerald-800 text-sm mb-2">🌍 Geographic Coverage</h3>
                <p className="text-3xl font-black text-emerald-900">{stats.regionsAffected}</p>
                <p className="text-xs text-emerald-600 mt-1">Active regions with disease detections</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
                <h3 className="font-bold text-blue-800 text-sm mb-2">💧 Soil Intelligence</h3>
                <p className="text-3xl font-black text-blue-900">{stats.totals.avgMoisture}%</p>
                <p className="text-xs text-blue-600 mt-1">Average soil moisture across network</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border border-red-200">
                <h3 className="font-bold text-red-800 text-sm mb-2">🦠 Disease Pressure</h3>
                <p className="text-3xl font-black text-red-900">{stats.diseaseDistribution.length}</p>
                <p className="text-xs text-red-600 mt-1">Unique disease types in the network</p>
              </div>
            </div>

            {/* Full disease table */}
            <div className="mt-6">
              <h3 className="font-bold text-gray-800 text-sm mb-3">Disease Distribution</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-2 font-semibold text-gray-600 rounded-l-lg">Disease</th>
                      <th className="px-4 py-2 font-semibold text-gray-600 text-right">Detections</th>
                      <th className="px-4 py-2 font-semibold text-gray-600 text-right rounded-r-lg">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.diseaseDistribution.map((d, i) => (
                      <tr key={d.disease} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                        <td className="px-4 py-2 font-medium text-gray-800">{d.disease}</td>
                        <td className="px-4 py-2 text-right font-bold text-gray-900">{d.count}</td>
                        <td className="px-4 py-2 text-right text-gray-500">
                          {((d.count / (stats.diseaseDistribution.reduce((s, x) => s + x.count, 0) || 1)) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-12">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌱</span>
              <span className="font-bold text-white text-sm">AgriCrop</span>
              <span className="text-xs text-gray-500">Geospatial Plant Disease & Soil Moisture Intelligence Network</span>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-4">
              <span>MobileNet Disease AI</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>Soil Moisture Regression</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>Geospatial Indexing</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>Leaflet.js Mapping</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
