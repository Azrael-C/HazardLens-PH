HazardLens-PH/
├── app/
│   ├── api/
│   │   ├── earthquakes/
│   │   │   └── route.ts          # Cached USGS earthquake API proxy
│   │   └── hazards/
│   │       └── route.ts          # Weather, flood, radar, NASA, and search API proxy
│   ├── earthquakes/
│   │   └── page.tsx              # Earthquake Monitor route
│   ├── explorer/
│   │   └── page.tsx              # Flood Explorer route
│   ├── methodology/
│   │   └── page.tsx              # About, sources, scoring, and limitations
│   ├── offline/
│   │   └── page.tsx              # Offline safety information
│   ├── error.tsx                 # Route-level error recovery page
│   ├── globals.css               # Global theme and Leaflet styles
│   ├── layout.tsx                # Shared layout, metadata, header, and PWA setup
│   ├── manifest.ts               # Progressive Web App manifest
│   └── page.tsx                  # Dashboard route
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
│   ├── comparison-lab.tsx        # Compares hazard data between two locations
│   ├── data-charts.tsx           # Rainfall and river-discharge charts
│   ├── earthquake-map.tsx        # Earthquake markers, tooltips, and popups
│   ├── earthquake-workspace.tsx  # Earthquake state, filters, and records
│   ├── flood-map.tsx             # Interactive flood and weather map
│   ├── flood-workspace.tsx       # Main flood dashboard controller
│   ├── location-search.tsx       # Debounced Philippine location search
│   ├── module-error-boundary.tsx # Isolates failures in maps and charts
│   ├── pwa-register.tsx          # Registers the service worker
│   └── site-header.tsx           # Desktop and mobile navigation
│
├── data/
│   └── fallback-hazards.json     # Demonstration fallback hazard data
│
├── hooks/
│   └── use-mobile.ts             # Detects mobile screen sizes
│
├── lib/
│   ├── earthquakes.ts            # Earthquake types, filters, and calculations
│   ├── hazardlens.ts             # Hazard APIs, caching, analysis, and scoring
│   └── utils.ts                  # Shared class-name utility
│
├── public/
│   ├── favicon.png               # Website favicon
│   ├── favicon.svg               # Alternative favicon
│   ├── icon-192.png              # PWA application icon
│   ├── icon-512.png              # Large PWA application icon
│   └── sw.js                     # Offline and runtime caching service worker
│
├── vendor/
│   ├── shadcn-tailwind-4.13.0.css
│   └── shadcn-tailwind-4.13.0.LICENSE.md
│
├── components.json               # UI component configuration
├── eslint.config.mjs             # Code-quality rules
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies and project commands
├── postcss.config.mjs            # Tailwind/PostCSS configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project documentation
