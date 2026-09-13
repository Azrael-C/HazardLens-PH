import type { Metadata } from "next";
import {
  AlertTriangle,
  BookOpen,
  CloudRain,
  Database,
  ExternalLink,
  Gauge,
  Map,
  ShieldCheck,
  Waves,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Methodology",
};

const sources = [
  {
    name: "Open-Meteo Geocoding API",
    purpose: "Philippine city and municipality search",
    href: "https://open-meteo.com/en/docs/geocoding-api",
  },
  {
    name: "Open-Meteo Forecast API",
    purpose: "Current and forecast precipitation",
    href: "https://open-meteo.com/en/docs",
  },
  {
    name: "Open-Meteo Flood API",
    purpose: "Modeled daily river-discharge and ensemble statistics",
    href: "https://open-meteo.com/en/docs/flood-api",
  },
  {
    name: "RainViewer Weather Maps API",
    purpose: "Recent radar-frame metadata and tiled overlays",
    href: "https://www.rainviewer.com/api/weather-maps-api.html",
  },
  {
    name: "NASA EONET API",
    purpose: "Internationally tracked open flood and severe-storm events",
    href: "https://eonet.gsfc.nasa.gov/docs/v3",
  },
  {
    name: "NASA GIBS",
    purpose: "Optional satellite-derived IMERG precipitation-rate tiles",
    href: "https://www.earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs",
  },
  {
    name: "OpenStreetMap",
    purpose: "Interactive map tiles and geographic context",
    href: "https://www.openstreetmap.org/copyright",
  },
  {
    name: "USGS Earthquake Catalog",
    purpose: "Recorded earthquake locations, magnitudes, depths, and event details",
    href: "https://earthquake.usgs.gov/fdsnws/event/1/",
  },
];

const steps = [
  {
    icon: CloudRain,
    title: "Collect rainfall",
    text: "Sum available precipitation values for the previous and next 24 hours.",
  },
  {
    icon: Waves,
    title: "Measure river change",
    text: "Compare today’s modeled discharge with tomorrow’s modeled value.",
  },
  {
    icon: Gauge,
    title: "Classify potential",
    text: "Apply transparent project-defined scoring and explain the contributing signals.",
  },
];

export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="panel overflow-hidden rounded-3xl p-6 sm:p-9">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
              About the data
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
              How HazardLens PH interprets flood potential
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              HazardLens PH combines forecast rainfall and modeled river-discharge
              signals. It explains environmental conditions; it does not confirm
              that a street is currently flooded and does not issue official warnings.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/8 p-4">
            <p className="flex items-center gap-2 font-semibold text-amber-200">
              <AlertTriangle className="size-5" aria-hidden="true" />
              Important limitation
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-50/80">
              A lack of displayed risk or data does not guarantee that an area is safe.
              Always check PAGASA and local government advisories.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-3" aria-label="Method steps">
        {steps.map((step, index) => (
          <article key={step.title} className="panel rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-slate-500">0{index + 1}</span>
            </div>
            <h2 className="mt-5 text-lg font-semibold text-slate-100">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{step.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <article className="panel rounded-2xl p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-100">
            <Gauge className="size-5 text-teal-300" aria-hidden="true" />
            Project scoring convention
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            These categories are designed for this application. They are not PAGASA,
            GloFAS, or LGU warning levels.
          </p>

          <div className="mt-5 overflow-hidden rounded-xl border border-border/80">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#091827] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Signal</th>
                  <th className="px-4 py-3 font-medium">Condition</th>
                  <th className="px-4 py-3 text-right font-medium">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70 text-slate-300">
                <tr>
                  <td className="px-4 py-3">Next 24h rain</td>
                  <td className="px-4 py-3">10–24.9 / 25–49.9 / 50+ mm</td>
                  <td className="px-4 py-3 text-right font-mono">1 / 2 / 3</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">River change</td>
                  <td className="px-4 py-3">+5% / +20% or more</td>
                  <td className="px-4 py-3 text-right font-mono">1 / 2</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Current precipitation</td>
                  <td className="px-4 py-3">5 mm or more</td>
                  <td className="px-4 py-3 text-right font-mono">1</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs font-semibold sm:grid-cols-4">
            <span className="rounded-lg border border-teal-400/20 bg-teal-400/8 px-2 py-2 text-teal-300">
              0 · Low
            </span>
            <span className="rounded-lg border border-orange-400/20 bg-orange-400/8 px-2 py-2 text-orange-300">
              1–2 · Guarded
            </span>
            <span className="rounded-lg border border-amber-400/20 bg-amber-400/8 px-2 py-2 text-amber-300">
              3–4 · Elevated
            </span>
            <span className="rounded-lg border border-red-400/20 bg-red-400/8 px-2 py-2 text-red-300">
              5–6 · High
            </span>
          </div>
        </article>

        <article className="panel rounded-2xl p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-100">
            <ShieldCheck className="size-5 text-sky-300" aria-hidden="true" />
            Credibility safeguards
          </h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
            {[
              "Every result is labeled as model-based, not an official warning.",
              "Missing API values are shown as “Data unavailable”; they are never replaced with zero.",
              "Rainfall and river services fail independently so one outage does not break the entire view.",
              "Exact update and radar-frame times are displayed whenever available.",
              "The map never claims that an unmarked road is safe or flood-free.",
              "National markers are sampled locations, not complete coverage of every municipality.",
              "NASA events remain a separate international-event layer and are not local warnings.",
              "Users can retry failed requests and continue using the base map without radar.",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sky-300" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-5 panel rounded-2xl p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-100">
          <Database className="size-5 text-sky-300" aria-hidden="true" />
          Data sources
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {sources.map((source) => (
            <a
              key={source.name}
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start justify-between gap-4 rounded-xl border border-border/80 bg-[#091827]/75 p-4 transition hover:border-sky-400/35 hover:bg-sky-400/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>
                <span className="block font-medium text-slate-100">{source.name}</span>
                <span className="mt-1 block text-sm leading-5 text-slate-400">
                  {source.purpose}
                </span>
              </span>
              <ExternalLink className="mt-0.5 size-4 shrink-0 text-slate-500 transition group-hover:text-sky-300" aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="panel rounded-2xl p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-100">
            <Map className="size-5 text-teal-300" aria-hidden="true" />
            Known limitations
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
            <p>
              River-discharge data uses an approximately five-kilometer grid and may
              represent a nearby major river rather than a small local channel.
            </p>
            <p>
              RainViewer supplies recent radar frames, but coverage and availability
              vary. Radar shows precipitation, not confirmed inundation.
            </p>
            <p>
              The national snapshot samples 18 representative locations so users can
              scan broad conditions efficiently. Conditions between markers may differ.
            </p>
            <p>
              NASA EONET does not capture every Philippine flood. Its markers identify
              internationally tracked events, while the GIBS layer is satellite-derived
              precipitation context and can be delayed.
            </p>
            <p>
              Flooding also depends on drainage, terrain, soil saturation, tides,
              infrastructure, and local conditions that are not fully represented by
              these APIs.
            </p>
            <p>
              Earthquake markers identify recorded epicenters. Their circle size is a
              visual magnitude scale and does not estimate the affected area. Historical
              catalogue completeness varies, and event details may be revised.
            </p>
          </div>
        </article>

        <article className="panel rounded-2xl p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-100">
            <BookOpen className="size-5 text-amber-300" aria-hidden="true" />
            Official references
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            For official Philippine forecasts, flood bulletins, and warnings, consult
            PAGASA and your local disaster risk-reduction office.
          </p>
          <a
            href="https://www.pagasa.dost.gov.ph/flood"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/8 px-4 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            PAGASA flood information
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
          <a
            href="https://earthquake.phivolcs.dost.gov.ph/"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-400/25 bg-sky-400/8 px-4 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            PHIVOLCS earthquake information
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </article>
      </section>
    </main>
  );
}
