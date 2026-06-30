import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { fields } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allFields = await db
      .select()
      .from(fields)
      .orderBy(desc(fields.createdAt));

    return NextResponse.json({ fields: allFields, count: allFields.length });
  } catch (error) {
    console.error("Fields error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fields", details: String(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, cropType, latitude, longitude, areaHectares, soilType } = body;

    if (!name || !cropType || !latitude || !longitude) {
      return NextResponse.json(
        { error: "name, cropType, latitude, and longitude are required" },
        { status: 400 },
      );
    }

    const [field] = await db
      .insert(fields)
      .values({
        name,
        cropType,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        areaHectares: areaHectares ? parseFloat(areaHectares) : undefined,
        soilType: soilType || "loam",
      })
      .returning();

    return NextResponse.json({ field });
  } catch (error) {
    console.error("Field creation error:", error);
    return NextResponse.json(
      { error: "Failed to create field", details: String(error) },
      { status: 500 },
    );
  }
}
