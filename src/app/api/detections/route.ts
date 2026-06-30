import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { detections } from "@/db/schema";
import { and, gte, lte, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bounds = searchParams.get("bounds"); // "south,west,north,east"
    const disease = searchParams.get("disease");
    const severity = searchParams.get("severity");
    const cropType = searchParams.get("cropType");
    const limit = parseInt(searchParams.get("limit") || "500");
    const days = parseInt(searchParams.get("days") || "30");

    const conditions = [];

    // Geographic bounding box filter
    if (bounds) {
      const [south, west, north, east] = bounds.split(",").map(Number);
      if (!isNaN(south) && !isNaN(west) && !isNaN(north) && !isNaN(east)) {
        conditions.push(
          gte(detections.latitude, south),
          lte(detections.latitude, north),
          gte(detections.longitude, west),
          lte(detections.longitude, east),
        );
      }
    }

    if (disease) {
      conditions.push(sql`${detections.disease} ILIKE ${`%${disease}%`}`);
    }
    if (severity) {
      conditions.push(sql`${detections.severity} = ${severity}`);
    }
    if (cropType) {
      conditions.push(sql`${detections.cropType} = ${cropType}`);
    }

    // Time filter
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    conditions.push(gte(detections.createdAt, cutoff));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select()
      .from(detections)
      .where(where)
      .orderBy(desc(detections.createdAt))
      .limit(limit);

    return NextResponse.json({ detections: results, count: results.length });
  } catch (error) {
    console.error("Detections fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch detections", details: String(error) },
      { status: 500 },
    );
  }
}
