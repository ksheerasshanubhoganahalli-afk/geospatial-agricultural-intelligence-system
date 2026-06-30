/**
 * AI Model Layer for AgriCrop
 *
 * Simulates two models:
 * 1. MobileNet-based crop disease classifier from leaf images
 * 2. Sequential regression model for soil moisture evaporation prediction
 */

// ─── Disease Classification (MobileNet simulation) ───

export interface DiseasePrediction {
  disease: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  treatment: string;
  cropType: string;
  plantPart: string;
}

const DISEASE_DATABASE: Omit<DiseasePrediction, "confidence">[] = [
  {
    disease: "Late Blight",
    severity: "critical",
    description:
      "Phytophthora infestans causes dark, water-soaked lesions on leaves and stems. Spreads rapidly in cool, moist conditions and can destroy entire fields within days.",
    treatment:
      "Apply copper-based fungicides immediately. Remove and destroy infected plants. Improve air circulation between rows.",
    cropType: "potato",
    plantPart: "leaf",
  },
  {
    disease: "Powdery Mildew",
    severity: "medium",
    description:
      "White powdery fungal growth on leaf surfaces caused by Erysiphales. Reduces photosynthesis and weakens plant vigor over time.",
    treatment:
      "Apply sulfur-based fungicide or neem oil. Increase plant spacing for better airflow. Avoid overhead irrigation.",
    cropType: "wheat",
    plantPart: "leaf",
  },
  {
    disease: "Leaf Rust",
    severity: "high",
    description:
      "Puccinia species produce orange-brown pustules on leaves. Severe infections cause premature leaf death and significant yield loss.",
    treatment:
      "Apply triazole fungicides at early signs. Plant resistant varieties. Monitor fields weekly during humid seasons.",
    cropType: "wheat",
    plantPart: "leaf",
  },
  {
    disease: "Bacterial Leaf Spot",
    severity: "medium",
    description:
      "Xanthomonas bacteria create dark, water-soaked spots with yellow halos on leaves. Spreads via splashing rain and contaminated tools.",
    treatment:
      "Apply copper-based bactericides. Practice crop rotation. Remove infected debris. Avoid working in wet fields.",
    cropType: "tomato",
    plantPart: "leaf",
  },
  {
    disease: "Septoria Leaf Blotch",
    severity: "high",
    description:
      "Septoria tritici causes irregular brown lesions with dark specks (pycnidia) on lower leaves, progressing upward. Major threat to wheat yields.",
    treatment:
      "Apply strobilurin + triazole fungicide mixtures at flag leaf emergence. Use certified disease-free seed.",
    cropType: "wheat",
    plantPart: "leaf",
  },
  {
    disease: "Anthracnose",
    severity: "medium",
    description:
      "Colletotrichum species cause dark, sunken lesions on leaves and stems. Favored by warm, wet conditions.",
    treatment:
      "Apply chlorothalonil or mancozeb fungicides. Ensure proper drainage. Rotate crops for 2-3 years.",
    cropType: "bean",
    plantPart: "leaf",
  },
  {
    disease: "Downy Mildew",
    severity: "high",
    description:
      "Peronospora species cause yellow patches on upper leaf surfaces with gray-purple mold underneath. Thrives in cool, humid conditions.",
    treatment:
      "Apply metalaxyl-based fungicides preventively. Improve ventilation. Avoid evening irrigation.",
    cropType: "grape",
    plantPart: "leaf",
  },
  {
    disease: "Fusarium Wilt",
    severity: "critical",
    description:
      "Fusarium oxysporum blocks water-conducting vessels, causing wilting and yellowing of lower leaves. Soil-borne pathogen persists for years.",
    treatment:
      "Use resistant varieties. Solarize soil before planting. Apply Trichoderma biocontrol agents. Practice long crop rotations.",
    cropType: "tomato",
    plantPart: "leaf",
  },
  {
    disease: "Cercospora Leaf Spot",
    severity: "medium",
    description:
      "Cercospora species produce small, circular brown spots with reddish margins. Can cause premature defoliation in severe cases.",
    treatment:
      "Apply azoxystrobin fungicide. Maintain adequate plant nutrition. Remove volunteer plants and crop debris.",
    cropType: "soybean",
    plantPart: "leaf",
  },
  {
    disease: "Rice Blast",
    severity: "critical",
    description:
      "Magnaporthe oryzae causes diamond-shaped lesions on leaves and can infect panicles. One of the most destructive rice diseases worldwide.",
    treatment:
      "Apply tricyclazole or isoprothiolane. Use balanced fertilization (avoid excess nitrogen). Plant resistant cultivars.",
    cropType: "rice",
    plantPart: "leaf",
  },
  {
    disease: "Healthy",
    severity: "low",
    description:
      "No disease detected. The leaf appears healthy with normal coloration and no visible signs of fungal or bacterial infection.",
    treatment: "Continue regular monitoring and maintenance practices.",
    cropType: "general",
    plantPart: "leaf",
  },
];

/**
 * Simulates a MobileNet-based disease classifier.
 * In production, this would call a TensorFlow.js model or Python microservice.
 * Uses image filename/size entropy as a pseudo-random seed for consistent results.
 */
export function classifyLeafDisease(
  imageBuffer?: ArrayBuffer | null,
  filename?: string,
): DiseasePrediction {
  // Generate a deterministic-ish seed from filename or random
  let seed = 42;
  if (filename) {
    for (let i = 0; i < filename.length; i++) {
      seed = (seed * 31 + filename.charCodeAt(i)) & 0xffffff;
    }
  }
  if (imageBuffer) {
    const view = new Uint8Array(imageBuffer.slice(0, Math.min(256, imageBuffer.byteLength)));
    for (let i = 0; i < view.length; i++) {
      seed = (seed * 31 + view[i]) & 0xffffff;
    }
  }

  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  // Weight toward diseases (not healthy) to make the demo more interesting
  const diseaseWeights = [
    0.12, 0.1, 0.1, 0.09, 0.1, 0.08, 0.09, 0.1, 0.08, 0.09, 0.05,
  ];

  const r = rand();
  let cumulative = 0;
  let selectedIndex = DISEASE_DATABASE.length - 1; // default healthy
  for (let i = 0; i < diseaseWeights.length; i++) {
    cumulative += diseaseWeights[i];
    if (r < cumulative) {
      selectedIndex = i;
      break;
    }
  }

  const selected = DISEASE_DATABASE[selectedIndex];

  // Generate confidence based on severity
  const baseConfidence =
    selected.severity === "critical"
      ? 0.82 + rand() * 0.16
      : selected.severity === "high"
        ? 0.7 + rand() * 0.2
        : selected.severity === "medium"
          ? 0.6 + rand() * 0.25
          : 0.85 + rand() * 0.14;

  return {
    ...selected,
    confidence: Math.round(baseConfidence * 100) / 100,
  };
}

// ─── Soil Moisture Evaporation Regression Model ───

export interface SoilMoistureInput {
  temperature: number; // °C
  humidity: number; // %
  windSpeed: number; // km/h
  rainfallMm: number; // mm in last 24h
  soilType: string; // clay, loam, sandy, silt
  currentMoisture: number; // % volumetric water content
  solarRadiation?: number; // W/m² (optional, defaults based on time)
  elevation?: number; // meters above sea level
}

export interface SoilMoisturePrediction {
  predictedEvaporation: number; // mm/day
  moistureAfter24h: number; // %
  moistureAfter72h: number; // %
  irrigationRecommendation: string;
  riskLevel: "low" | "moderate" | "high" | "critical";
  confidence: number;
}

/**
 * Sequential regression model for soil moisture evaporation prediction.
 * Implements a simplified Penman-Monteith equation combined with
 * soil-type retention factors.
 *
 * In production, this would be a trained TensorFlow/Keras sequential model.
 */
export function predictSoilMoisture(
  input: SoilMoistureInput,
): SoilMoisturePrediction {
  const {
    temperature,
    humidity,
    windSpeed,
    rainfallMm,
    soilType,
    currentMoisture,
    solarRadiation = 250, // default moderate
    elevation = 500,
  } = input;

  // Soil water retention factors (higher = retains more water)
  const soilFactors: Record<string, number> = {
    clay: 0.55,
    loam: 0.7,
    sandy: 1.3,
    silt: 0.8,
  };
  const soilFactor = soilFactors[soilType] ?? 0.7;

  // Saturation vapor pressure (kPa)
  const es =
    0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
  // Actual vapor pressure
  const ea = es * (humidity / 100);
  // Vapor pressure deficit
  const vpd = es - ea;

  // Simplified Penman-Monteith reference evapotranspiration (mm/day)
  const delta = (4098 * es) / Math.pow(temperature + 237.3, 2);
  const gamma = 0.000665 * 101.3 * Math.pow((293 - 0.0065 * elevation) / 293, 5.26);
  const rn = solarRadiation * 0.0864 * 0.75; // net radiation approximation
  const G = 0; // soil heat flux approx 0 for daily

  const et0Num =
    0.408 * delta * (rn - G) + gamma * (900 / (temperature + 273)) * windSpeed * vpd;
  const et0Den = delta + gamma * (1 + 0.34 * windSpeed);
  const et0 = Math.max(0.1, et0Num / et0Den);

  // Adjust for soil type (sandy soils lose moisture faster)
  const evaporation = et0 * soilFactor;

  // Rainfall replenishment
  const rainfallContribution = rainfallMm * 0.4; // ~40% infiltrates effectively

  // Net moisture change over 24h (mm)
  const netChange24h = rainfallContribution - evaporation;

  // Convert to volumetric % change (approximate, based on soil depth of 30cm)
  const moistureChange24Pct = (netChange24h / (300 * soilFactor)) * 100;
  const moisture24h = Math.max(
    0,
    Math.min(60, currentMoisture + moistureChange24Pct),
  );

  // 72h projection (compound with slight variation)
  const dailyVariation = 0.02 * Math.sin(Date.now() / 86400000); // slight daily oscillation
  const moisture72h = Math.max(
    0,
    Math.min(60, moisture24h + moistureChange24Pct * 2 * (1 + dailyVariation)),
  );

  // Risk assessment
  let riskLevel: SoilMoisturePrediction["riskLevel"];
  if (moisture24h < 10) riskLevel = "critical";
  else if (moisture24h < 18) riskLevel = "high";
  else if (moisture24h < 25) riskLevel = "moderate";
  else riskLevel = "low";

  // Irrigation recommendation
  let irrigationRecommendation: string;
  if (moisture24h < 10) {
    irrigationRecommendation =
      "URGENT: Immediate irrigation required. Soil moisture at critical deficit. Apply 25-30mm of water within the next 12 hours.";
  } else if (moisture24h < 18) {
    irrigationRecommendation =
      "Schedule irrigation within 24 hours. Apply 15-20mm of water. Consider drip irrigation for water efficiency.";
  } else if (moisture24h < 25) {
    irrigationRecommendation =
      "Monitor soil moisture closely. Light irrigation (10mm) may be beneficial if no rain forecast in next 48 hours.";
  } else {
    irrigationRecommendation =
      "Soil moisture adequate. No irrigation needed. Continue monitoring. Next check recommended in 3-5 days.";
  }

  const confidence = Math.min(
    0.95,
    0.6 + humidity / 500 + (soilFactor > 0 ? 0.15 : 0),
  );

  return {
    predictedEvaporation: Math.round(evaporation * 100) / 100,
    moistureAfter24h: Math.round(moisture24h * 100) / 100,
    moistureAfter72h: Math.round(moisture72h * 100) / 100,
    irrigationRecommendation,
    riskLevel,
    confidence: Math.round(confidence * 100) / 100,
  };
}

// ─── Outbreak Clustering (DBSCAN-like) ───

export interface OutbreakCluster {
  centerLat: number;
  centerLng: number;
  radius: number; // km
  disease: string;
  severity: string;
  count: number;
  detectionIds: string[];
}

/**
 * Simple density-based clustering of detection points
 * to identify outbreak zones on the map.
 */
export function clusterDetections(
  points: Array<{
    id: string;
    latitude: number;
    longitude: number;
    disease: string;
    severity: string;
  }>,
  epsKm = 15,
): OutbreakCluster[] {
  const visited = new Set<string>();
  const clusters: OutbreakCluster[] = [];

  function haversine(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function getNeighbors(idx: number): number[] {
    const neighbors: number[] = [];
    for (let j = 0; j < points.length; j++) {
      if (
        idx !== j &&
        haversine(
          points[idx].latitude,
          points[idx].longitude,
          points[j].latitude,
          points[j].longitude,
        ) <= epsKm
      ) {
        neighbors.push(j);
      }
    }
    return neighbors;
  }

  for (let i = 0; i < points.length; i++) {
    if (visited.has(points[i].id)) continue;

    const neighbors = getNeighbors(i);
    // Need at least 2 nearby points to form a cluster
    if (neighbors.length < 1) continue;

    const clusterPoints = [i, ...neighbors];
    visited.add(points[i].id);
    neighbors.forEach((n) => visited.add(points[n].id));

    const lats = clusterPoints.map((p) => points[p].latitude);
    const lngs = clusterPoints.map((p) => points[p].longitude);
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

    // Radius = max distance from center to any point
    let radius = 0;
    for (const p of clusterPoints) {
      const d = haversine(centerLat, centerLng, points[p].latitude, points[p].longitude);
      if (d > radius) radius = d;
    }

    // Most common disease in cluster
    const diseaseCounts: Record<string, number> = {};
    const severityOrder = ["low", "medium", "high", "critical"];
    let maxSeverity = 0;
    for (const p of clusterPoints) {
      diseaseCounts[points[p].disease] =
        (diseaseCounts[points[p].disease] || 0) + 1;
      const sevIdx = severityOrder.indexOf(points[p].severity);
      if (sevIdx > maxSeverity) maxSeverity = sevIdx;
    }

    const dominantDisease = Object.entries(diseaseCounts).sort(
      (a, b) => b[1] - a[1],
    )[0][0];

    clusters.push({
      centerLat,
      centerLng,
      radius: Math.max(2, radius),
      disease: dominantDisease,
      severity: severityOrder[maxSeverity],
      count: clusterPoints.length,
      detectionIds: clusterPoints.map((p) => points[p].id),
    });
  }

  return clusters;
}
