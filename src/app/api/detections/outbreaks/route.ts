import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { detections } from "@/db/schema";
import { desc } from "drizzle-orm";
import { clusterDetections } from "@/lib/ai-models";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const epsKm = parseFloat(searchParams.get("epsKm") || "15");

    // Fetch recent non-healthy detections
    const recentDetections = await db
      .select({
        id: detections.id,
        latitude: detections.latitude,
        longitude: detections.longitude,
        disease: detections.disease,
        severity: detections.severity,
        cropType: detections.cropType,
      })
      .from(detections)
      .orderBy(desc(detections.createdAt))
      .limit(1000);

    // Filter out healthy
    const diseased = recentDetections.filter(
      (d) => d.disease.toLowerCase() !== "healthy",
    );

    // Run DBSCAN-like clustering
    const clusters = clusterDetections(diseased, epsKm);

    return NextResponse.json({ outbreaks: clusters, totalDetections: diseased.length });
  } catch (error) {
    console.error("Outbreaks error:", error);
    return NextResponse.json(
      { error: "Failed to compute outbreaks", details: String(error) },
      { status: 500 },
    );
  }
}
