# AgriCrop Requirements

## Product Requirements Document (PRD)

### Executive Summary
AgriCrop is a geospatial intelligence platform that uses AI-powered computer vision and regression modeling to help smallholder farmers detect crop diseases early and optimize irrigation. The platform aggregates field-level data across geographic regions to identify active outbreak zones and provide actionable agricultural intelligence.

---

## Functional Requirements

### FR-1: Disease Detection System

| ID | Requirement | Priority |
|---|---|---|
| FR-1.1 | Users SHALL be able to upload leaf images (JPG, PNG) for disease analysis | P0 |
| FR-1.2 | The system SHALL process images through a MobileNet-based CNN classifier | P0 |
| FR-1.3 | The system SHALL return disease name, confidence score (0-1), severity rating, description, and treatment recommendation | P0 |
| FR-1.4 | The system SHALL support 11 disease classes including a "Healthy" classification | P0 |
| FR-1.5 | Users SHALL be able to specify crop type to improve classification accuracy | P1 |
| FR-1.6 | The system SHALL geotag each detection with GPS coordinates | P0 |
| FR-1.7 | Users SHALL be able to auto-detect their location via browser geolocation API | P1 |

### FR-2: Soil Moisture Prediction

| ID | Requirement | Priority |
|---|---|---|
| FR-2.1 | The system SHALL predict soil moisture evaporation using a regression model | P0 |
| FR-2.2 | The system SHALL accept environmental inputs: temperature, humidity, wind speed, rainfall, soil type, current moisture | P0 |
| FR-2.3 | The system SHALL output predicted evaporation rate (mm/day), 24-hour moisture projection, and 72-hour moisture projection | P0 |
| FR-2.4 | The system SHALL classify risk level (low, moderate, high, critical) based on projected moisture | P0 |
| FR-2.5 | The system SHALL provide irrigation recommendations tailored to risk level | P1 |
| FR-2.6 | The system SHALL apply soil-type-specific retention factors (clay, loam, sandy, silt) | P1 |

### FR-3: Geospatial Outbreak Mapping

| ID | Requirement | Priority |
|---|---|---|
| FR-3.1 | The system SHALL render an interactive global map using Leaflet.js | P0 |
| FR-3.2 | The map SHALL display disease detections as color-coded markers by severity | P0 |
| FR-3.3 | The system SHALL compute outbreak clusters using DBSCAN-like spatial clustering | P0 |
| FR-3.4 | Outbreak zones SHALL be rendered as circular overlays with radius and affected count | P0 |
| FR-3.5 | The map SHALL display registered farm fields as distinct markers | P1 |
| FR-3.6 | Map viewport changes SHALL trigger bounding-box filtered data queries | P2 |
| FR-3.7 | Clicking a detection marker SHALL show a popup with detection details | P1 |

### FR-4: Analytics Dashboard

| ID | Requirement | Priority |
|---|---|---|
| FR-4.1 | The dashboard SHALL display total counts: fields, detections, soil readings, active outbreaks | P0 |
| FR-4.2 | The dashboard SHALL show disease distribution (top N diseases by count) | P1 |
| FR-4.3 | The dashboard SHALL show severity breakdown (low/medium/high/critical) | P1 |
| FR-4.4 | The dashboard SHALL show crop type distribution | P2 |
| FR-4.5 | The dashboard SHALL display average soil moisture and evaporation rates | P1 |
| FR-4.6 | The dashboard SHALL report number of geographic regions affected | P2 |

### FR-5: Data Management

| ID | Requirement | Priority |
|---|---|---|
| FR-5.1 | The system SHALL store all detections with geospatial coordinates | P0 |
| FR-5.2 | The system SHALL store soil moisture readings with location data | P0 |
| FR-5.3 | The system SHALL support database seeding with realistic demo data | P1 |
| FR-5.4 | Fields SHALL be registered with name, crop type, coordinates, area, and soil type | P1 |

---

## Non-Functional Requirements

### NFR-1: Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-1.1 | Disease classification response time | < 2 seconds |
| NFR-1.2 | Soil moisture prediction response time | < 500ms |
| NFR-1.3 | Map rendering with 500+ markers | < 3 seconds |
| NFR-1.4 | Outbreak clustering computation | < 1 second for 1000 points |
| NFR-1.5 | Page load time (First Contentful Paint) | < 2 seconds |
| NFR-1.6 | API bounding-box queries | < 300ms |

### NFR-2: Reliability

| ID | Requirement | Target |
|---|---|---|
| NFR-2.1 | API uptime | 99.5% |
| NFR-2.2 | Database connection resilience | Graceful error handling with retry |
| NFR-2.3 | Health check endpoint response | Always available at `/api/health` |

### NFR-3: Usability

| ID | Requirement | Target |
|---|---|---|
| NFR-3.1 | Responsive design | Desktop, tablet, mobile |
| NFR-3.2 | Mobile-first disease detection | Works on any smartphone browser |
| NFR-3.3 | Color accessibility | Severity colors distinguishable by colorblind users (icons + labels) |
| NFR-3.4 | Loading states | Skeleton loaders / spinners for all async operations |

### NFR-4: Security

| ID | Requirement |
|---|---|
| NFR-4.1 | Environment variables SHALL NOT be exposed to client-side code |
| NFR-4.2 | API endpoints SHALL validate input types and ranges |
| NFR-4.3 | Database queries SHALL use parameterized queries (Drizzle ORM) |

### NFR-5: Maintainability

| ID | Requirement |
|---|---|
| NFR-5.1 | TypeScript strict mode enabled |
| NFR-5.2 | All database schemas version-controlled via Drizzle ORM |
| NFR-5.3 | Component-based architecture with separation of concerns |
| NFR-5.4 | API routes follow RESTful conventions |

---

## Technical Requirements

### TR-1: Technology Stack

| Component | Technology | Version |
|---|---|---|
| Runtime | Node.js | ≥ 18 |
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.9.x |
| Database | PostgreSQL | 14+ |
| ORM | Drizzle ORM | 0.45.x |
| Styling | Tailwind CSS | 4.x |
| Mapping | Leaflet.js | 1.9.x |
| Package Manager | npm | 9+ |

### TR-2: Database Requirements

| Requirement | Detail |
|---|---|
| Geospatial indexing | B-tree indexes on (latitude, longitude) columns for all geo-tables |
| Primary keys | UUID v4 for all tables |
| Foreign keys | `detections.field_id` → `fields.id`, `soil_readings.field_id` → `fields.id` |
| Time filtering | Timestamp columns on detections and soil_readings for temporal queries |
| Search | ILIKE pattern matching on disease names |

### TR-3: API Requirements

| Requirement | Detail |
|---|---|
| Format | JSON request/response bodies |
| File upload | Multipart/form-data for image uploads (max 10MB) |
| Pagination | Limit-based (not cursor-based for MVP) |
| Filtering | Query parameter filtering (bounds, disease, severity, cropType, days) |
| Error handling | Consistent `{ error, details }` response format |
| Status codes | 200 OK, 400 Bad Request, 500 Internal Server Error |

### TR-4: AI Model Requirements

| Model | Type | Input | Output |
|---|---|---|---|
| Disease Classifier | MobileNet CNN (simulated) | Leaf image (ArrayBuffer) + crop type | Disease label, confidence, severity, description, treatment |
| Moisture Predictor | Sequential Regression (Penman-Monteith) | Environmental parameters (7 fields) | Evaporation rate, 24h/72h moisture, risk level, irrigation advice |
| Outbreak Clusterer | DBSCAN (Haversine) | Detection points array | Cluster centers, radii, disease, severity, counts |

### TR-5: Browser Support

| Browser | Minimum Version |
|---|---|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 15+ |
| Edge | 90+ |
| Mobile Safari | iOS 15+ |
| Chrome for Android | 90+ |

---

## Demo Data Specification

### Seeded Farms (18 locations across 6 regions)

| Region | Countries | Crops |
|---|---|---|
| Sub-Saharan Africa | Kenya, Tanzania, Uganda | maize, coffee, wheat, rice |
| South Asia | India (Punjab, Bihar, Maharashtra, Tamil Nadu) | wheat, rice, soybean, coconut |
| Southeast Asia | Vietnam, Indonesia | rice, coffee |
| Latin America | Mexico, Brazil, Colombia, Peru | maize, coffee, sugarcane, potato |
| East Africa | Ethiopia, Uganda | teff, bean |
| Europe | France, Spain | grape, olive |

### Seeded Data Volumes

| Entity | Count |
|---|---|
| Fields | 18 |
| Detections | ~84 (3-8 per field) |
| Soil Readings | ~61 (2-5 per field) |
| Disease Types | 11 unique diseases |
| Crop Types | 12 unique crops |

---

## Deployment Requirements

### Development

```bash
npm install
npx drizzle-kit push
npm run dev
```

### Production

```bash
npm ci
npm run build
npx drizzle-kit push
npm start
```

### Environment

| Variable | Scope | Description |
|---|---|---|
| `DATABASE_URL` | Server | PostgreSQL connection string (postgresql://user:pass@host:port/db) |

---

## Future Enhancements (Out of Scope for MVP)

- Real TensorFlow.js MobileNet model integration in-browser
- Real-time weather API integration for automated moisture prediction inputs
- Push notifications for outbreak alerts within farmer's geographic area
- Offline-capable PWA for field use without internet
- Farmer-to-farmer disease reporting social network
- Satellite imagery integration (NDVI, NDWI) for vegetation health monitoring
- Integration with IoT soil moisture sensors
- Multi-language support (Swahili, Hindi, Spanish, French, Vietnamese)
- Export reports as PDF for agricultural extension workers
- Historical trend analysis and yield prediction models
