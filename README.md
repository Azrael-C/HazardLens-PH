## Project File Hierarchy

```text
HazardLens-PH/
├── app/
│   ├── earthquakes/
│   │   └── page.tsx              # Earthquake Monitor page
│   ├── explorer/
│   │   └── page.tsx              # Flood Explorer and comparison page
│   ├── methodology/
│   │   └── page.tsx              # About, methodology, sources, and limitations
│   ├── globals.css               # Global styles, colors, panels, and map styling
│   ├── layout.tsx                # Root layout, metadata, favicon, and shared header
│   └── page.tsx                  # Main Dashboard page
│
├── components/
│   ├── ui/                       # Reusable interface components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── combobox.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── comparison-lab.tsx        # Compares hazard information for two locations
│   ├── data-charts.tsx           # Rainfall and river-discharge charts
│   ├── earthquake-map.tsx        # Interactive earthquake map and markers
│   ├── earthquake-workspace.tsx  # Earthquake data, filters, and interface controller
│   ├── flood-map.tsx             # Interactive flood and rainfall map
│   ├── flood-workspace.tsx       # Main flood dashboard controller
│   ├── location-search.tsx       # Philippine location search component
│   └── site-header.tsx           # Desktop and mobile navigation
│
├── hooks/
│   └── use-mobile.ts             # Detects mobile screen sizes
│
├── lib/
│   ├── earthquakes.ts            # USGS API requests and earthquake utilities
│   ├── hazardlens.ts             # Weather, flood, radar, NASA APIs, and calculations
│   └── utils.ts                  # Shared Tailwind class-name utility
│
├── public/
│   ├── favicon.png               # HazardLens PH browser icon
│   └── favicon.svg               # Alternative vector favicon
│
├── vendor/
│   ├── shadcn-tailwind-4.13.0.css
│   └── shadcn-tailwind-4.13.0.LICENSE.md
│
├── .gitignore                    # Files excluded from Git tracking
├── components.json               # UI component configuration
├── eslint.config.mjs             # ESLint rules and configuration
├── next-env.d.ts                 # Next.js TypeScript declarations
├── next.config.ts                # Next.js project configuration
├── package.json                  # Dependencies and project commands
├── package-lock.json             # Exact dependency versions
├── postcss.config.mjs            # Tailwind and PostCSS configuration
├── README.md                     # Project documentation
└── tsconfig.json                 # TypeScript configuration
