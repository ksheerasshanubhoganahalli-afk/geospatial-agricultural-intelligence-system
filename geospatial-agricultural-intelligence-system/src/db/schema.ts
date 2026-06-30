import {
  pgTable,
  text,
  doublePrecision,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";

/* ───────────────────── Fields ───────────────────── */
export const fields = pgTable(
  "fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    cropType: text("crop_type").notNull(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    areaHectares: doublePrecision("area_hectares"),
    soilType: text("soil_type").default("loam"),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  },
  (t) => [
    index("fields_geo_idx").on(t.latitude, t.longitude),
  ],
);

/* ───────────────── Disease Detections ───────────────── */
export const detections = pgTable(
  "detections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fieldId: uuid("field_id").references(() => fields.id),
    disease: text("disease").notNull(),
    confidence: doublePrecision("confidence").notNull(),
    severity: text("severity").notNull(), // low | medium | high | critical
    imageUrl: text("image_url"),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    cropType: text("crop_type").notNull(),
    plantPart: text("plant_part").default("leaf"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  },
  (t) => [
    index("detections_geo_idx").on(t.latitude, t.longitude),
    index("detections_disease_idx").on(t.disease),
    index("detections_severity_idx").on(t.severity),
    index("detections_created_idx").on(t.createdAt),
  ],
);

/* ──────────────── Soil Moisture Readings ──────────────── */
export const soilReadings = pgTable(
  "soil_readings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fieldId: uuid("field_id").references(() => fields.id),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    moistureLevel: doublePrecision("moisture_level").notNull(),
    predictedEvaporation: doublePrecision("predicted_evaporation"),
    temperature: doublePrecision("temperature"),
    humidity: doublePrecision("humidity"),
    windSpeed: doublePrecision("wind_speed"),
    rainfallMm: doublePrecision("rainfall_mm"),
    soilType: text("soil_type").default("loam"),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  },
  (t) => [
    index("soil_geo_idx").on(t.latitude, t.longitude),
    index("soil_field_idx").on(t.fieldId),
  ],
);

/* ────────────────── Type exports ────────────────── */
export type Field = typeof fields.$inferSelect;
export type NewField = typeof fields.$inferInsert;
export type Detection = typeof detections.$inferSelect;
export type NewDetection = typeof detections.$inferInsert;
export type SoilReading = typeof soilReadings.$inferSelect;
export type NewSoilReading = typeof soilReadings.$inferInsert;
