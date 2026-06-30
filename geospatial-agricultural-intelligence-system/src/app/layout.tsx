import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgriCrop — Geospatial Disease & Soil Intelligence",
  description:
    "AI-powered plant disease detection and soil moisture intelligence network for smallholder farms. Features MobileNet disease classification, regression-based evaporation prediction, and geospatial outbreak mapping.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
