import { NextResponse } from "next/server";
import { db } from "@/db";
import { fields, detections, soilReadings } from "@/db/schema";
import { sql, eq, and, gte } from "drizzle-orm";

export async function GET() {
  try {
    // Total counts
    const [fieldCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(fields);

    const [detectionCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(detections);

    const [soilCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(soilReadings);

    // Disease distribution
    const diseaseDistribution = await db
      .select({
        disease: detections.disease,
        count: sql<number>`count(*)::int`,
      })
      .from(detections)
      .where(sql`${detections.disease} != 'Healthy'`)
      .groupBy(detections.disease)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    // Severity distribution
    const severityDistribution = await db
      .select({
        severity: detections.severity,
        count: sql<number>`count(*)::int`,
      })
      .from(detections)
      .groupBy(detections.severity);

    // Crop type distribution
    const cropDistribution = await db
      .select({
        cropType: detections.cropType,
        count: sql<number>`count(*)::int`,
      })
      .from(detections)
      .groupBy(detections.cropType)
      .orderBy(sql`count(*) DESC`);

    // Active outbreaks (critical/high severity in last 30 days)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const [activeOutbreaks] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(detections)
      .where(
        and(
          sql`${detections.severity} IN ('critical', 'high')`,
          sql`${detections.disease} != 'Healthy'`,
          gte(detections.createdAt, cutoff),
        ),
      );

    // Average soil moisture
    const [avgMoisture] = await db
      .select({
        avg: sql<number>`round(avg(moisture_level)::numeric, 2)`,
      })
      .from(soilReadings);

    // Average predicted evaporation
    const [avgEvaporation] = await db
      .select({
        avg: sql<number>`round(avg(predicted_evaporation)::numeric, 2)`,
      })
      .from(soilReadings);

    // Regions affected
    const regionsAffected = await db
      .select({
        latitude: sql<number>`round(latitude::numeric, 0)::int`,
        longitude: sql<number>`round(longitude::numeric, 0)::int`,
        count: sql<number>`count(*)::int`,
      })
      .from(detections)
      .where(sql`${detections.disease} != 'Healthy'`)
      .groupBy(
        sql`round(latitude::numeric, 0)`,
        sql`round(longitude::numeric, 0)`,
      );

    return NextResponse.json({
      totals: {
        fields: fieldCount.count,
        detections: detectionCount.count,
        soilReadings: soilCount.count,
        activeOutbreaks: activeOutbreaks.count,
        avgMoisture: avgMoisture.avg ?? 0,
        avgEvaporation: avgEvaporation.avg ?? 0,
      },
      diseaseDistribution,
      severityDistribution,
      cropDistribution,
      regionsAffected: regionsAffected.length,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats", details: String(error) },
      { status: 500 },
    );
  }
}
