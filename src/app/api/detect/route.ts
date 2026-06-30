import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { detections } from "@/db/schema";
import { classifyLeafDisease } from "@/lib/ai-models";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    const fieldId = formData.get("fieldId") as string | null;
    const cropType = (formData.get("cropType") as string) || "general";

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 },
      );
    }

    // Run the AI disease classification model
    let imageBuffer: ArrayBuffer | null = null;
    let filename: string | undefined;
    if (image) {
      imageBuffer = await image.arrayBuffer();
      filename = image.name;
    }

    const prediction = classifyLeafDisease(imageBuffer, filename);

    // Override crop type if provided
    if (cropType !== "general") {
      prediction.cropType = cropType;
    }

    // Store detection in database
    const [detection] = await db
      .insert(detections)
      .values({
        fieldId: fieldId || undefined,
        disease: prediction.disease,
        confidence: prediction.confidence,
        severity: prediction.severity,
        latitude,
        longitude,
        cropType: prediction.cropType,
        plantPart: prediction.plantPart,
        description: prediction.description,
      })
      .returning();

    return NextResponse.json({
      detection,
      prediction,
    });
  } catch (error) {
    console.error("Detection error:", error);
    return NextResponse.json(
      { error: "Failed to process detection", details: String(error) },
      { status: 500 },
    );
  }
}
