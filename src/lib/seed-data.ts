import { db } from "@/db";
import { fields, detections, soilReadings } from "@/db/schema";
import { classifyLeafDisease, predictSoilMoisture } from "./ai-models";

/**
 * Seed the database with realistic smallholder farm data
 * across major agricultural regions worldwide.
 */

const SEED_FIELDS = [
  // Sub-Saharan Africa
  { name: "Nyanza Lake Farm", cropType: "maize", latitude: -0.3136, longitude: 34.768, areaHectares: 2.5, soilType: "clay" },
  { name: "Kilimanjaro Slopes", cropType: "coffee", latitude: -3.3731, longitude: 37.358, areaHectares: 1.8, soilType: "loam" },
  { name: "Rift Valley Plot", cropType: "wheat", latitude: -0.3031, longitude: 36.08, areaHectares: 5.0, soilType: "loam" },
  { name: "Lake Victoria Shore", cropType: "rice", latitude: -0.1022, longitude: 33.988, areaHectares: 3.2, soilType: "silt" },
  // South Asia
  { name: "Punjab Wheat Belt", cropType: "wheat", latitude: 30.733, longitude: 76.779, areaHectares: 4.0, soilType: "loam" },
  { name: "Bihar Rice Paddy", cropType: "rice", latitude: 25.609, longitude: 85.137, areaHectares: 1.5, soilType: "clay" },
  { name: "Maharashtra Soybean", cropType: "soybean", latitude: 20.932, longitude: 77.771, areaHectares: 3.0, soilType: "sandy" },
  { name: "Tamil Nadu Coconut", cropType: "coconut", latitude: 10.805, longitude: 78.685, areaHectares: 2.0, soilType: "sandy" },
  // Southeast Asia
  { name: "Mekong Delta Field", cropType: "rice", latitude: 10.045, longitude: 105.746, areaHectares: 2.0, soilType: "silt" },
  { name: "Java Coffee Terrace", cropType: "coffee", latitude: -7.797, longitude: 110.37, areaHectares: 1.2, soilType: "loam" },
  // Latin America
  { name: "Oaxaca Corn Field", cropType: "maize", latitude: 17.073, longitude: -96.726, areaHectares: 3.5, soilType: "loam" },
  { name: "Minas Gerais Coffee", cropType: "coffee", latitude: -19.917, longitude: -43.935, areaHectares: 4.0, soilType: "clay" },
  { name: "Cauca Valley Cane", cropType: "sugarcane", latitude: 3.451, longitude: -76.532, areaHectares: 6.0, soilType: "loam" },
  { name: "Andean Potato Plot", cropType: "potato", latitude: -13.532, longitude: -71.967, areaHectares: 1.0, soilType: "loam" },
  // East Africa
  { name: "Amhara Teff Field", cropType: "teff", latitude: 11.594, longitude: 37.391, areaHectares: 2.5, soilType: "clay" },
  { name: "Buganda Bean Plot", cropType: "bean", latitude: 0.3136, longitude: 32.582, areaHectares: 1.8, soilType: "loam" },
  // Europe
  { name: "Languedoc Vineyard", cropType: "grape", latitude: 43.611, longitude: 3.877, areaHectares: 8.0, soilType: "silt" },
  { name: "Andalusia Olive Grove", cropType: "olive", latitude: 37.389, longitude: -5.984, areaHectares: 5.0, soilType: "sandy" },
];

// Generate jittered locations near a base point
function jitter(lat: number, lng: number, radiusKm = 8): { lat: number; lng: number } {
  const angle = Math.random() * Math.PI * 2;
  const dist = Math.random() * radiusKm;
  const dLat = (dist * Math.cos(angle)) / 111.32;
  const dLng = (dist * Math.sin(angle)) / (111.32 * Math.cos((lat * Math.PI) / 180));
  return { lat: lat + dLat, lng: lng + dLng };
}

const CROP_DISEASES: Record<string, string[]> = {
  maize: ["Leaf Blight", "Maize Streak Virus", "Gray Leaf Spot"],
  wheat: ["Leaf Rust", "Powdery Mildew", "Septoria Leaf Blotch"],
  rice: ["Rice Blast", "Bacterial Leaf Blight", "Brown Spot"],
  coffee: ["Coffee Leaf Rust", "Coffee Berry Disease"],
  potato: ["Late Blight", "Early Blight"],
  tomato: ["Bacterial Leaf Spot", "Fusarium Wilt"],
  soybean: ["Cercospora Leaf Spot", "Soybean Rust"],
  bean: ["Anthracnose", "Angular Leaf Spot"],
  grape: ["Downy Mildew", "Powdery Mildew"],
  sugarcane: ["Red Rot", "Smut"],
  coconut: ["Bud Rot", "Leaf Spot"],
  olive: ["Olive Knot", "Peacock Spot"],
  teff: ["Leaf Blight", "Rust"],
};

export async function seedDatabase() {
  // Check if already seeded
  const existingFields = await db.select().from(fields).limit(1);
  if (existingFields.length > 0) {
    return { message: "Database already seeded", fieldsCount: 0, detectionsCount: 0 };
  }

  // Insert fields
  const insertedFields = await db
    .insert(fields)
    .values(SEED_FIELDS)
    .returning();

  const detectionValues = [];
  const soilValues = [];

  for (const field of insertedFields) {
    // Generate 3-8 detections per field
    const numDetections = 3 + Math.floor(Math.random() * 6);
    for (let i = 0; i < numDetections; i++) {
      const { lat, lng } = jitter(field.latitude, field.longitude, 6);
      const pred = classifyLeafDisease();

      // Override crop type to match field
      const cropDiseases = CROP_DISEASES[field.cropType] || ["Leaf Spot"];
      const isHealthy = Math.random() < 0.15;
      const disease = isHealthy
        ? "Healthy"
        : cropDiseases[Math.floor(Math.random() * cropDiseases.length)];

      const severity = isHealthy
        ? "low"
        : Math.random() < 0.2
          ? "critical"
          : Math.random() < 0.4
            ? "high"
            : Math.random() < 0.7
              ? "medium"
              : "low";

      detectionValues.push({
        fieldId: field.id,
        disease,
        confidence: isHealthy
          ? 0.9 + Math.random() * 0.09
          : 0.6 + Math.random() * 0.35,
        severity,
        latitude: lat,
        longitude: lng,
        cropType: field.cropType,
        plantPart: "leaf",
        description: isHealthy
          ? "No disease detected. Leaf appears healthy."
          : `${disease} detected on ${field.cropType} leaf. ${severity} severity. Immediate monitoring recommended.`,
      });
    }

    // Generate soil readings
    const numSoil = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numSoil; i++) {
      const { lat, lng } = jitter(field.latitude, field.longitude, 4);
      const temp = 18 + Math.random() * 20;
      const humidity = 40 + Math.random() * 45;
      const wind = 2 + Math.random() * 15;
      const rain = Math.random() < 0.3 ? Math.random() * 30 : 0;
      const moisture = 10 + Math.random() * 35;

      const soilPred = predictSoilMoisture({
        temperature: temp,
        humidity,
        windSpeed: wind,
        rainfallMm: rain,
        soilType: field.soilType || "loam",
        currentMoisture: moisture,
      });

      soilValues.push({
        fieldId: field.id,
        latitude: lat,
        longitude: lng,
        moistureLevel: Math.round(moisture * 100) / 100,
        predictedEvaporation: soilPred.predictedEvaporation,
        temperature: Math.round(temp * 100) / 100,
        humidity: Math.round(humidity * 100) / 100,
        windSpeed: Math.round(wind * 100) / 100,
        rainfallMm: Math.round(rain * 100) / 100,
        soilType: field.soilType || "loam",
      });
    }
  }

  await db.insert(detections).values(detectionValues);
  await db.insert(soilReadings).values(soilValues);

  return {
    message: "Database seeded successfully",
    fieldsCount: insertedFields.length,
    detectionsCount: detectionValues.length,
    soilReadingsCount: soilValues.length,
  };
}
