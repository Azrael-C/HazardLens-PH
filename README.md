# HazardLens PH

HazardLens PH is a responsive Philippine hazard-data explorer built with Next.js,
TypeScript, Tailwind CSS, Leaflet, and Recharts.

It combines public environmental APIs to provide:

- Philippine city and municipality search
- A Philippines-centered interactive map
- Live indicators for 18 representative locations
- Recent RainViewer radar animation
- Optional NASA GIBS satellite-precipitation imagery
- NASA EONET flood and severe-storm events
- Open-Meteo rainfall forecasts
- Open-Meteo river-discharge forecasts
- Explainable project-defined flood-potential levels
- Loading, offline, empty, missing-data, and independent error states
- A two-location comparison laboratory
- A methodology and data-sources page
- A yearly USGS earthquake map with magnitude and depth filters
- Magnitude-scaled markers with event details on hover
- Server-side API proxy routes with five-to-fifteen-minute cache windows
- Clearly labeled local-cache and demonstration fallback states
- One-click Philippine quick locations
- Isolated map and chart error boundaries
- Responsive collapsible map controls
- Installable PWA metadata and an offline readiness page

## Important wording

HazardLens PH shows forecast-based environmental indicators. It does not confirm
current street flooding and does not replace PAGASA or local government
advisories.

## Requirements

- Node.js 20.9 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Production build

```bash
npm run build
npm start
```

The repository can be imported into Vercel as a standard Next.js application.

## Main routes

- `/` — centered map dashboard
- `/explorer` — dashboard plus two-location comparison
- `/earthquakes` — yearly earthquake map, filters, event list, and details
- `/methodology` — scoring rules, limitations, safeguards, and sources
- `/offline` — cached-use guidance, emergency contact, and preparedness checklist
- `/api/hazards` — cached weather, flood, radar, geocoding, and event proxy
- `/api/earthquakes` — cached USGS earthquake proxy

## API services

- Open-Meteo Geocoding API
- Open-Meteo Forecast API
- Open-Meteo Flood API
- RainViewer Weather Maps API
- NASA EONET API
- NASA GIBS
- OpenStreetMap tiles
- USGS Earthquake Catalog API

No API key or application database is required for the current version. External
requests are routed through same-origin Next.js handlers with short shared-cache
windows. The browser also retains recent successful results for temporary
low-connectivity use. Any synthetic fallback is explicitly labeled as
demonstration data.

## Project structure

```text
app/
  api/hazards/route.ts
  api/earthquakes/route.ts
  page.tsx
  explorer/page.tsx
  earthquakes/page.tsx
  methodology/page.tsx
  offline/page.tsx
  error.tsx
  manifest.ts
components/
  comparison-lab.tsx
  data-charts.tsx
  earthquake-map.tsx
  earthquake-workspace.tsx
  flood-map.tsx
  flood-workspace.tsx
  location-search.tsx
  module-error-boundary.tsx
  pwa-register.tsx
  site-header.tsx
data/
  fallback-hazards.json
lib/
  hazardlens.ts
  earthquakes.ts
public/
  sw.js
  icon-192.png
  icon-512.png
```

## Potential calculation

The application adds project-defined points for forecast rainfall, increasing
river discharge, and current precipitation. The total is classified as Low,
Guarded, Elevated, or High. These categories are explained on the Methodology
page and are not official warning levels.
