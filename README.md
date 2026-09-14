## File Hierarchy

```text
HazardLens-PH/
├── app/
│   ├── api/
│   │   ├── earthquakes/
│   │   │   └── route.ts          # Cached USGS earthquake API proxy
│   │   └── hazards/
│   │       └── route.ts          # Weather, flood, radar, NASA, and search API
│   ├── earthquakes/
│   │   └── page.tsx              # Earthquake Monitor page
│   ├── explorer/
│   │   └── page.tsx              # Flood Explorer page
│   ├── methodology/
│   │   └── page.tsx              # About, sources, and limitations
│   ├── offline/
│   │   └── page.tsx              # Offline safety information
│   ├── error.tsx                 # Route-level error recovery
│   ├── globals.css               # Global and Leaflet styles
│   ├── layout.tsx                # Shared layout, metadata, and header
│   ├── manifest.ts               # PWA configuration
│   └── page.tsx                  # Main Dashboard page
│
├── components/
│   ├── ui/                       # Reusable interface components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── combobox.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   └── tabs.tsx
│   ├── comparison-lab.tsx        # Two-location comparison
│   ├── data-charts.tsx           # Rainfall and discharge charts
│   ├── earthquake-map.tsx        # Earthquake Leaflet map
│   ├── earthquake-workspace.tsx  # Earthquake state and filters
│   ├── flood-map.tsx             # Flood and weather map
│   ├── flood-workspace.tsx       # Main flood dashboard controller
│   ├── location-search.tsx       # Debounced location search
│   ├── module-error-boundary.tsx # Isolates component failures
│   ├── pwa-register.tsx          # Registers the service worker
│   └── site-header.tsx           # Desktop and mobile navigation
│
├── data/
│   └── fallback-hazards.json     # Labeled demonstration fallback data
│
├── hooks/
│   └── use-mobile.ts             # Mobile-screen detection hook
│
├── lib/
│   ├── earthquakes.ts            # Earthquake API and calculations
│   ├── hazardlens.ts             # Hazard APIs, caching, and analysis
│   └── utils.ts                  # Shared utility functions
│
├── public/
│   ├── favicon.png               # Browser favicon
│   ├── favicon.svg               # Alternative favicon
│   ├── icon-192.png              # Small PWA icon
│   ├── icon-512.png              # Large PWA icon
│   └── sw.js                     # Offline service worker
│
├── vendor/
│   ├── shadcn-tailwind-4.13.0.css
│   └── shadcn-tailwind-4.13.0.LICENSE.md
│
├── components.json               # UI component configuration
├── eslint.config.mjs             # ESLint configuration
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies and commands
├── postcss.config.mjs            # PostCSS configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project documentation
```
