"use client";

import { useState, useRef, type FormEvent } from "react";

interface DetectionResult {
  detection: {
    id: string;
    disease: string;
    confidence: number;
    severity: string;
    cropType: string;
    description: string;
    latitude: number;
    longitude: number;
  };
  prediction: {
    disease: string;
    confidence: number;
    severity: string;
    description: string;
    treatment: string;
    cropType: string;
  };
}

interface DiseaseDetectorProps {
  onDetectionComplete?: (result: DetectionResult) => void;
}

const CROP_TYPES = [
  "wheat", "rice", "maize", "potato", "tomato", "soybean",
  "coffee", "grape", "bean", "sugarcane", "cotton", "general",
];

const SEVERITY_STYLES: Record<string, string> = {
  low: "bg-green-100 text-green-800 border-green-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  critical: "bg-red-100 text-red-800 border-red-300",
};

export default function DiseaseDetector({ onDetectionComplete }: DiseaseDetectorProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [latitude, setLatitude] = useState("10.045");
  const [longitude, setLongitude] = useState("105.746");
  const [cropType, setCropType] = useState("rice");
  const [useGps, setUseGps] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      const file = fileRef.current?.files?.[0];
      if (file) formData.append("image", file);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("cropType", cropType);

      const res = await fetch("/api/detect", { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Detection failed: ${res.statusText}`);

      const data: DetectionResult = await res.json();
      setResult(data);
      onDetectionComplete?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Detection failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const detectGps = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setUseGps(true);
      },
      () => setError("Failed to get GPS location"),
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-6 py-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Disease Detection
        </h2>
        <p className="text-emerald-100 text-sm mt-1">Upload a leaf image for AI-powered disease classification</p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Leaf Image</label>
          <div
            className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-emerald-400 transition cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            {imagePreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Leaf preview"
                  className="max-h-40 mx-auto rounded-lg shadow-sm"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagePreview(null);
                    setResult(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="py-6">
                <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-sm">Click to upload leaf image</p>
                <p className="text-gray-400 text-xs mt-1">JPG, PNG up to 10MB</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => { setLatitude(e.target.value); setUseGps(false); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => { setLongitude(e.target.value); setUseGps(false); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
              required
            />
          </div>
        </div>
        <button
          type="button"
          onClick={detectGps}
          className="w-full py-2 px-3 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition flex items-center justify-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {useGps ? "✓ GPS Location Set" : "Use Current GPS Location"}
        </button>

        {/* Crop Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Crop Type</label>
          <select
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
          >
            {CROP_TYPES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isAnalyzing}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Analyzing with MobileNet AI...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Run Disease Analysis
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

      {/* Result */}
      {result && (
        <div className="mx-5 mb-5 border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-bold text-gray-800 text-sm">AI Analysis Result</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Disease</span>
              <span className="font-bold text-gray-900">{result.prediction.disease}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Confidence</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${result.prediction.confidence * 100}%` }}
                  />
                </div>
                <span className="font-bold text-gray-900 text-sm">
                  {(result.prediction.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Severity</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${SEVERITY_STYLES[result.prediction.severity]}`}
              >
                {result.prediction.severity.toUpperCase()}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-600 leading-relaxed">{result.prediction.description}</p>
            </div>
            {result.prediction.disease !== "Healthy" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-800 mb-1">💊 Recommended Treatment</p>
                <p className="text-xs text-blue-700">{result.prediction.treatment}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
