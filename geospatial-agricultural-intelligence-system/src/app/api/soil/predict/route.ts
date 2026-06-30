import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { soilReadings } from "@/db/schema";
import { predictSoilMoisture, type SoilMoistureInput } from "@/lib/ai-models";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      latitude,
      longitude,
      fieldId,
      temperature,
      humidity,
      windSpeed,
      rainfallMm,
      soilType,
      currentMoisture,
      solarRadiation,
      elevation,
    } = body as SoilMoistureInput & {
      latitude?: number;
      longitude?: number;
      fieldId?: string;
    };

    if (temperature == null || humidity == null || currentMoisture == null) {
      return NextResponse.json(
        { error: "temperature, humidity, and currentMoisture are required" },
        { status: 400 },
      );
    }

    const prediction = predictSoilMoisture({
      temperature,
      humidity,
      windSpeed: windSpeed ?? 5,
      rainfallMm: rainfallMm ?? 0,
      soilType: soilType ?? "loam",
      currentMoisture,
      solarRadiation,
      elevation,
    });

    // Optionally store the reading
    if (latitude && longitude) {
      await db.insert(soilReadings).values({
        fieldId: fieldId || undefined,
        latitude,
        longitude,
        moistureLevel: currentMoisture,
        predictedEvaporation: prediction.predictedEvaporation,
        temperature,
        humidity,
        windSpeed: windSpeed ?? 5,
        rainfallMm: rainfallMm ?? 0,
        soilType: soilType ?? "loam",
      });
    }

    return NextResponse.json({ prediction });
  } catch (error) {
    console.error("Soil prediction error:", error);
    return NextResponse.json(
      { error: "Failed to predict soil moisture", details: String(error) },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");

    const readings = await db
      .select()
      .from(soilReadings)
      .limit(limit);

    return NextResponse.json({ readings, count: readings.length });
  } catch (error) {
    console.error("Soil readings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch soil readings", details: String(error) },
      { status: 500 },
    );
  }
}
