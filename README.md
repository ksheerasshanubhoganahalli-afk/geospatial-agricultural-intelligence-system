# AgriCrop — Geospatial Plant Disease & Soil Moisture Intelligence Network

<div align="center">

🌱 **AI-powered crop monitoring for smallholder farms worldwide.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-latest-336791?style=flat&logo=postgresql)](https://www.postgresql.org)
[![Drizzle](https://img.shields.io/badge/Drizzle-ORM-0f0?style=flat)](https://orm.drizzle.team)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com)
[![Leaflet](https://img.shields.io/badge/Leaflet.js-1.9-199900?style=flat&logo=leaflet)](https://leafletjs.com)

</div>

---

## Table of Contents

- [Overview](#overview)
- [The Problem & Solution](#the-problem--solution)
- [Engineering Architecture](#engineering-architecture)
  - [AI Layer](#ai-layer)
  - [Backend & Database](#backend--database)
  - [Full-Stack UI](#full-stack-ui)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [AI Model Details](#ai-model-details)
  - [MobileNet Disease Classifier](#mobilenet-disease-classifier)
  - [Soil Moisture Evaporation Predictor](#soil-moisture-evaporation-predictor)
- [Key Features](#key-features)
- [Environment Variables](#environment-variables)

---

## Overview

**AgriCrop** is a geospatial intelligence platform that combines dual-mode AI models with interactive mapping to help smallholder farms detect plant diseases early and predict soil moisture evaporation. By aggregating field-level data across geographic regions, the platform identifies active crop outbreak zones and provides actionable agricultural intelligence.

## The Problem & Solution

### 🦠 The Problem
Smallholder farms suffer heavy crop yield losses because plant fungal infections go entirely unnoticed until the damage spreads across the entire field. Without access to laboratory testing or agronomist expertise, farmers lose up to 40% of their harvest to preventable diseases.

### ✅ The Solution
AgriCrop provides:
- **Instant disease identification** from a simple leaf photo using MobileNet-based AI
- **Proactive soil moisture forecasting** to optimize irrigation before crops stress
- **Regional outbreak tracking** so extension workers can target interventions geographically
- **Zero-cost deployment** — works on any smartphone browser, no app install required

---

## Engineering Architecture

### AI Layer

#### 1. MobileNet Disease Classifier
A convolutional neural network (simulated MobileNet) trained to identify 11 crop disease classes from leaf image uploads:

| Disease | Crops Affected | Severity |
|---|---|---|
| Late Blight | Potato, Tomato | Critical |
| Rice Blast | Rice | Critical |
| Fusarium Wilt | Tomato | Critical |
| Leaf Rust | Wheat | High |
| Downy Mildew | Grape | High |
| Septoria Leaf Blotch | Wheat | High |
| Anthracnose | Bean | Medium |
| Powdery Mildew | Wheat, Grape | Medium |
| Bacterial Leaf Spot | Tomato | Medium |
| Cercospora Leaf Spot | Soybean | Medium |
| Healthy | All crops | Low |

Each detection returns: disease name, confidence score (0–1), severity rating, description, and recommended treatment.

#### 2. Sequential Regression — Soil Moisture Evaporation
A simplified Penman-Monteith evapotranspiration model that predicts:
- **Evaporation rate** (mm/day)
- **24-hour moisture projection** (% volumetric water content)
- **72-hour moisture projection**
- **Risk level** (low → moderate → high → critical)
- **Irrigation recommendation**

Inputs: temperature, humidity, wind speed, rainfall, soil type (clay/loam/sandy/silt), current moisture %, solar radiation, elevation.

#### 3. DBSCAN Outbreak Clustering
Density-based spatial clustering groups nearby disease detections into outbreak zones using haversine distance, visualized as circular overlay zones on the map.

### Backend & Database

#### Database (PostgreSQL + Drizzle ORM)
Three core tables with geospatial indexing for location-based queries:

| Table | Purpose | Indexes |
|---|---|---|
| `fields` | Registered farm plots with GPS coordinates | `fields_geo_idx (lat, lng)` |
| `detections` | Disease classification results with location | `detections_geo_idx (lat, lng)`, `detections_disease_idx`, `detections_severity_idx`, `detections_created_idx` |
| `soil_readings` | Soil moisture measurements and predictions | `soil_geo_idx (lat, lng)`, `soil_field_idx` |

#### API Endpoints (7 routes)

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/detect` | Upload leaf image → AI disease classification |
| `GET` | `/api/detections` | Query detections with bounding-box, disease, severity, crop filters |
| `GET` | `/api/detections/outbreaks` | Compute outbreak clusters from recent detections |
| `POST` | `/api/soil/predict` | Submit environmental data → moisture evaporation prediction |
| `GET` | `/api/fields` | List all registered farm fields |
| `GET` | `/api/stats` | Dashboard statistics (totals, distributions, regional coverage) |
| `POST` | `/api/seed` | Seed database with 18 demo farms across 6 continents |

### Full-Stack UI

#### Interactive Map (Leaflet.js)
- **CARTO Voyager basemap** tiles for clean agricultural visualization
- **Circle markers** color-coded by disease severity:
  - 🟢 Green = Low / Healthy
  - 🟡 Yellow = Medium
  - 🟠 Orange = High
  - 🔴 Red = Critical
- **Outbreak zone overlays** — dashed circles with pulsing fill showing disease cluster radius
- **Field markers** — semi-transparent green circles for registered farm plots
- **Bounding-box filtering** — map viewport drives API queries, only fetches visible data

#### Disease Detection Panel
- Drag-and-drop / click-to-upload leaf image
- GPS auto-detection via browser geolocation API
- Manual coordinate entry
- Crop type selector (12 crops)
- Real-time AI results with confidence bar, severity badge, and treatment recommendations

#### Soil Moisture Predictor
- Environmental parameter inputs (temperature, humidity, wind, rainfall)
- Soil type selector with retention factors
- 24h / 72h moisture projection bars
- Risk level indicator with contextual irrigation advice

#### Analytics Dashboard
- Live stat cards: monitored fields, disease detections, active outbreaks, average soil moisture
- Top disease distribution chart
- Severity quadrant visualization
- Crop type tag cloud
- Full disease distribution table with percentages

---

## Project Structure

```
.
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # Root layout (metadata, fonts)
│   │   ├── page.tsx                            # Main dashboard page
│   │   ├── globals.css                         # Tailwind + Leaflet overrides
│   │   └── api/
│   │       ├── health/route.ts                 # Health check endpoint
│   │       ├── seed/route.ts                   # Database seeder
│   │       ├── detect/route.ts                 # Disease detection API
│   │       ├── detections/
│   │       │   ├── route.ts                    # Detections CRUD
│   │       │   └── outbreaks/route.ts          # Outbreak clustering
│   │       ├── soil/predict/route.ts           # Soil moisture prediction
│   │       ├── fields/route.ts                 # Field management
│   │       └── stats/route.ts                  # Dashboard statistics
│   ├── components/
│   │   ├── Header.tsx                          # Navigation + seed controls
│   │   ├── AgriMap.tsx                         # Leaflet.js interactive map
│   │   ├── DiseaseDetector.tsx                 # Disease detection UI
│   │   ├── SoilMoisturePredictor.tsx           # Soil moisture prediction UI
│   │   └── DashboardStats.tsx                  # Statistics cards & charts
│   ├── lib/
│   │   ├── ai-models.ts                        # AI models (MobileNet + Regression)
│   │   └── seed-data.ts                        # Demo data generator
│   └── db/
│       ├── schema.ts                           # Drizzle ORM table definitions
│       └── index.ts                            # Database connection
├── public/                                      # Static assets
├── drizzle.config.json                          # Drizzle Kit configuration
├── next.config.ts                               # Next.js configuration
├── package.json                                 # Dependencies
├── tsconfig.json                                # TypeScript configuration
└── .env                                         # Environment variables
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** running locally or remotely
- **npm** (bundled with Node.js)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd agricrop

# Install dependencies
npm install
```

### Database Setup

1. Ensure PostgreSQL is running and accessible.
2. Configure your database connection in `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

3. Push the database schema:

```bash
npx drizzle-kit push
```

This creates the `fields`, `detections`, and `soil_readings` tables with all indexes.

4. (Optional) Seed demo data:

```bash
# Start the app first, then POST to the seed endpoint
curl -X POST http://localhost:3000/api/seed
```

### Running the Application

#### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Production Build

```bash
npm run build
npm start
```

#### Type Checking

```bash
npm run typecheck
```

#### Linting

```bash
npm run lint
```

---

## API Reference

### `POST /api/detect`

Upload a leaf image for AI disease classification.

**Request** (multipart/form-data):
| Field | Type | Required | Description |
|---|---|---|---|
| `image` | File | No | Leaf image (JPG/PNG, max 10MB) |
| `latitude` | Number | Yes | GPS latitude |
| `longitude` | Number | Yes | GPS longitude |
| `cropType` | String | No | Crop type (default: "general") |
| `fieldId` | String( UUID) | No | Associated field ID |

**Response**:
```json
{
  "detection": {
    "id": "uuid",
    "disease": "Late Blight",
    "confidence": 0.94,
    "severity": "critical",
    "latitude": -13.532,
    "longitude": -71.967,
    "cropType": "potato",
    "description": "Phytophthora infestans causes dark, water-soaked lesions..."
  },
  "prediction": {
    "disease": "Late Blight",
    "confidence": 0.94,
    "severity": "critical",
    "description": "...",
    "treatment": "Apply copper-based fungicides immediately...",
    "cropType": "potato"
  }
}
```

### `GET /api/detections`

Query disease detections with filters.

**Query Parameters**:
| Param | Type | Default | Description |
|---|---|---|---|
| `bounds` | String | — | Bounding box: `south,west,north,east` |
| `disease` | String | — | Disease name (ILIKE search) |
| `severity` | String | — | `low` / `medium` / `high` / `critical` |
| `cropType` | String | — | Crop type filter |
| `days` | Number | 30 | Lookback window in days |
| `limit` | Number | 500 | Max results returned |

**Response**:
```json
{
  "detections": [{ "id": "...", "disease": "...", ... }],
  "count": 84
}
```

### `GET /api/detections/outbreaks`

Compute outbreak clusters from recent diseased detections.

**Query Parameters**:
| Param | Type | Default | Description |
|---|---|---|---|
| `epsKm` | Number | 15 | Clustering radius in km |

**Response**:
```json
{
  "outbreaks": [
    {
      "centerLat": -0.31,
      "centerLng": 34.77,
      "radius": 8.4,
      "disease": "Leaf Rust",
      "severity": "high",
      "count": 5,
      "detectionIds": ["uuid1", "uuid2", ...]
    }
  ],
  "totalDetections": 73
}
```

### `POST /api/soil/predict`

Predict soil moisture evaporation using the regression model.

**Request** (JSON):
| Field | Type | Required | Description |
|---|---|---|---|
| `temperature` | Number | Yes | Air temperature (°C) |
| `humidity` | Number | Yes | Relative humidity (%) |
| `currentMoisture` | Number | Yes | Current soil moisture (%) |
| `windSpeed` | Number | No | Wind speed (km/h, default: 5) |
| `rainfallMm` | Number | No | Rainfall in last 24h (mm, default: 0) |
| `soilType` | String | No | `clay` / `loam` / `sandy` / `silt` (default: loam) |
| `latitude` | Number | No | GPS latitude (to store reading) |
| `longitude` | Number | No | GPS longitude (to store reading) |
| `fieldId` | String( UUID) | No | Associated field ID |

**Response**:
```json
{
  "prediction": {
    "predictedEvaporation": 14.48,
    "moistureAfter24h": 14.29,
    "moistureAfter72h": 10.58,
    "irrigationRecommendation": "Schedule irrigation within 24 hours...",
    "riskLevel": "high",
    "confidence": 0.73
  }
}
```

### `GET /api/stats`

Aggregate dashboard statistics.

**Response**: See the [Database Schema](#database-schema) section for field descriptions.

### `GET /api/fields`

List all registered farm fields.

### `POST /api/seed`

Seed the database with 18 demo farms, 84 disease detections, and 61 soil readings across 6 continents.

---

## Database Schema

### `fields`
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | TEXT | Farm/field name |
| `crop_type` | TEXT | Crop grown (wheat, rice, coffee, etc.) |
| `latitude` | DOUBLE | GPS latitude |
| `longitude` | DOUBLE | GPS longitude |
| `area_hectares` | DOUBLE | Field area in hectares |
| `soil_type` | TEXT | Soil classification (clay/loam/sandy/silt) |
| `created_at` | TIMESTAMP | Registration timestamp |

### `detections`
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `field_id` | UUID | FK → fields.id |
| `disease` | TEXT | Disease name |
| `confidence` | DOUBLE | Model confidence (0–1) |
| `severity` | TEXT | low / medium / high / critical |
| `image_url` | TEXT | Optional image reference |
| `latitude` | DOUBLE | Detection GPS latitude |
| `longitude` | DOUBLE | Detection GPS longitude |
| `crop_type` | TEXT | Affected crop |
| `plant_part` | TEXT | Plant part (default: leaf) |
| `description` | TEXT | Disease description |
| `created_at` | TIMESTAMP | Detection timestamp |

### `soil_readings`
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `field_id` | UUID | FK → fields.id |
| `latitude` | DOUBLE | Reading GPS latitude |
| `longitude` | DOUBLE | Reading GPS longitude |
| `moisture_level` | DOUBLE | Current moisture (%) |
| `predicted_evaporation` | DOUBLE | Predicted evaporation (mm/day) |
| `temperature` | DOUBLE | Air temperature (°C) |
| `humidity` | DOUBLE | Relative humidity (%) |
| `wind_speed` | DOUBLE | Wind speed (km/h) |
| `rainfall_mm` | DOUBLE | Rainfall in last 24h (mm) |
| `soil_type` | TEXT | Soil classification |
| `created_at` | TIMESTAMP | Reading timestamp |

---

## AI Model Details

### MobileNet Disease Classifier

The disease classifier simulates a MobileNet convolutional neural network trained on crop leaf images. In production, this would be a TensorFlow.js model running directly in the browser or a Python/TensorFlow microservice.

**How it works:**
1. Leaf image is processed through the model
2. Image features are extracted via depthwise separable convolutions (MobileNet architecture)
3. Features are classified into 11 disease categories
4. Confidence score is computed from softmax output layer
5. Severity is derived from disease type + confidence threshold

**Treatment recommendations** are included for each disease, sourced from agricultural extension guidelines.

### Soil Moisture Evaporation Predictor

The regression model implements a **simplified Penman-Monteith equation**, the FAO standard for reference evapotranspiration (ET₀):

```
ET₀ = [0.408 × Δ × (Rn − G) + γ × (900/(T+273)) × u₂ × (eₛ − eₐ)] / [Δ + γ × (1 + 0.34 × u₂)]
```

Where:
- **Δ** = slope of saturation vapor pressure curve (kPa/°C)
- **Rn** = net radiation at crop surface (MJ/m²/day)
- **G** = soil heat flux density (MJ/m²/day), approximated as 0 for daily
- **γ** = psychrometric constant (kPa/°C), adjusted for elevation
- **T** = mean daily air temperature (°C)
- **u₂** = wind speed at 2m height (m/s, converted from km/h)
- **eₛ** = saturation vapor pressure (kPa)
- **eₐ** = actual vapor pressure (kPa)

**Soil retention factors** adjust the base evaporation rate:
- **Clay**: 0.55 (high retention, slow evaporation)
- **Loam**: 0.70 (balanced)
- **Silt**: 0.80 (moderate)
- **Sandy**: 1.30 (fast drainage, rapid evaporation)

The model then projects moisture levels 24h and 72h forward, factoring in rainfall replenishment (≈40% infiltration rate) and soil-specific water-holding capacity.

---

## Key Features

- 🗺️ **Interactive Global Map** — Leaflet.js with CARTO tiles, bounded queries for performance
- 🔬 **AI Disease Detection** — MobileNet-based classification from leaf images with treatment guidance
- 💧 **Soil Moisture Prediction** — Penman-Monteith regression model with 24h/72h forecasts
- ⚠️ **Outbreak Clustering** — DBSCAN-based spatial clustering with haversine distance
- 📊 **Analytics Dashboard** — Disease distribution, severity breakdown, crop statistics
- 🌍 **Multi-Region Coverage** — 18 demo farms across Africa, Asia, Europe, and Latin America
- 📱 **Responsive Design** — Works on desktop, tablet, and mobile devices
- 🎨 **Dynamic CSS Markers** — Color-coded by severity with pulsing outbreak animations

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5.9 |
| **Database** | PostgreSQL |
| **ORM** | Drizzle ORM 0.45 |
| **Styling** | Tailwind CSS 4 |
| **Mapping** | Leaflet.js 1.9 |
| **AI Models** | MobileNet (simulated) + Penman-Monteith Regression |
| **Clustering** | DBSCAN (custom haversine implementation) |

---

---

<div align="center">

**Built for smallholder farmers everywhere.** 🌍🌱

</div>
