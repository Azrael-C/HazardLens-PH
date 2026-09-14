"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Gauge,
  MapPinned,
  RefreshCw,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import {
  DepthFilter,
  EarthquakeFeature,
  EarthquakeResponse,
  FIRST_EARTHQUAKE_YEAR,
  depthGroup,
  formatEarthquakeTime,
  getEarthquakes,
  markerRadius,
  matchesDepth,
} from "@/lib/earthquakes";
import { ModuleErrorBoundary } from "@/components/module-error-boundary";

const EarthquakeMap = dynamic(() => import("@/components/earthquake-map"), {
  ssr: false,
  loading: () => <div className="min-h-[500px] animate-pulse rounded-2xl bg-slate-800/60 sm:min-h-[620px]" />,
});

const currentYear = new Date().getUTCFullYear();

function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof Activity; label: string; value: string; detail: string }) {
  return (
    <article className="panel metric-glow rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{detail}</p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-sky-400/20 bg-sky-400/10 text-sky-300">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

function magnitudeText(earthquake: EarthquakeFeature | null) {
  const magnitude = earthquake?.properties.mag;
  return magnitude === null || magnitude === undefined ? "Data unavailable" : `M ${magnitude.toFixed(1)}`;
}

export function EarthquakeWorkspace() {
  const [year, setYear] = useState(currentYear);
  const [minMagnitude, setMinMagnitude] = useState(4);
  const [depthFilter, setDepthFilter] = useState<DepthFilter>("all");
  const [response, setResponse] = useState<EarthquakeResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getEarthquakes(year, minMagnitude, controller.signal);
        setResponse(data);
        setSelectedId(data.features[0]?.id ?? null);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError("Unable to retrieve earthquake records. Check your connection and try again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [year, minMagnitude, retryVersion]);

  const earthquakes = useMemo(
    () =>
      (response?.features ?? []).filter((earthquake) => {
        const [longitude, latitude, depth] = earthquake.geometry.coordinates;
        return [longitude, latitude, depth].every(Number.isFinite) && matchesDepth(depth, depthFilter);
      }),
    [response, depthFilter],
  );

  const effectiveSelectedId = earthquakes.some((earthquake) => earthquake.id === selectedId)
    ? selectedId
    : earthquakes[0]?.id ?? null;
  const selected = earthquakes.find((earthquake) => earthquake.id === effectiveSelectedId) ?? null;
  const latest = earthquakes[0] ?? null;
  const strongest = earthquakes.reduce<EarthquakeFeature | null>((best, earthquake) => {
    if (!best) return earthquake;
    return (earthquake.properties.mag ?? -Infinity) > (best.properties.mag ?? -Infinity) ? earthquake : best;
  }, null);
  const averageDepth = earthquakes.length
    ? earthquakes.reduce((sum, earthquake) => sum + earthquake.geometry.coordinates[2], 0) / earthquakes.length
    : null;
  const selectedDepth = selected?.geometry.coordinates[2] ?? null;
  const selectedMagnitude = selected?.properties.mag ?? null;
  const generatedAt = response?.metadata.generated ? formatEarthquakeTime(response.metadata.generated) : "Data unavailable";

  return (
    <main className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 sm:py-8">
      <section className="panel overflow-hidden rounded-3xl p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">USGS earthquake catalogue</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">Philippine Earthquake Monitor</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              Explore recorded earthquakes around the Philippines by year. Hover over a circle for event details, or select it for the complete record.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1.5 font-medium text-emerald-300">Live USGS data</span>
            <span className="rounded-full border border-border bg-white/5 px-3 py-1.5 text-slate-400">Updated {generatedAt}</span>
          </div>
        </div>
      </section>

      <section className="panel mt-4 rounded-2xl p-4 sm:p-5" aria-label="Earthquake filters">
        <div className="grid gap-4 lg:grid-cols-[minmax(280px,1.5fr)_220px_220px_auto] lg:items-end">
          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="earthquake-year" className="text-sm font-medium text-slate-200">Year</label>
              <span className="font-mono text-lg font-semibold text-amber-300">{year}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setYear((value) => Math.max(FIRST_EARTHQUAKE_YEAR, value - 1))}
                disabled={year === FIRST_EARTHQUAKE_YEAR}
                className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-white/5 text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Previous year"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <input
                id="earthquake-year"
                type="range"
                min={FIRST_EARTHQUAKE_YEAR}
                max={currentYear}
                step="1"
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
                className="h-2 w-full cursor-pointer accent-amber-400"
              />
              <button
                type="button"
                onClick={() => setYear((value) => Math.min(currentYear, value + 1))}
                disabled={year === currentYear}
                className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-white/5 text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Next year"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <label className="grid gap-2 text-sm font-medium text-slate-200">
            Minimum magnitude
            <select
              value={minMagnitude}
              onChange={(event) => setMinMagnitude(Number(event.target.value))}
              className="h-10 rounded-lg border border-border bg-[#091827] px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            >
              <option value={2.5}>M 2.5+</option>
              <option value={3}>M 3.0+</option>
              <option value={4}>M 4.0+</option>
              <option value={5}>M 5.0+</option>
              <option value={6}>M 6.0+</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-200">
            Depth
            <select
              value={depthFilter}
              onChange={(event) => setDepthFilter(event.target.value as DepthFilter)}
              className="h-10 rounded-lg border border-border bg-[#091827] px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            >
              <option value="all">All depths</option>
              <option value="shallow">Shallow, below 70 km</option>
              <option value="intermediate">Intermediate, 70–300 km</option>
              <option value="deep">Deep, above 300 km</option>
            </select>
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setYear(currentYear)}
              disabled={year === currentYear}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-white/5 px-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:opacity-40 lg:flex-none"
            >
              <Clock3 className="size-4" aria-hidden="true" />
              Latest
            </button>
            <button
              type="button"
              onClick={() => setRetryVersion((value) => value + 1)}
              disabled={loading}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-sky-400/25 bg-sky-400/10 px-3 text-sm font-medium text-sky-200 transition hover:bg-sky-400/15 disabled:opacity-50 lg:flex-none"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard icon={Activity} label="Events shown" value={loading && !response ? "—" : earthquakes.length.toLocaleString()} detail={`M ${minMagnitude.toFixed(1)}+ during ${year}`} />
        <MetricCard icon={Gauge} label="Strongest" value={magnitudeText(strongest)} detail={strongest?.properties.place ?? "No matching event"} />
        <MetricCard icon={Clock3} label="Latest event" value={magnitudeText(latest)} detail={latest ? formatEarthquakeTime(latest.properties.time) : "No matching event"} />
        <MetricCard icon={MapPinned} label="Average depth" value={averageDepth === null ? "Data unavailable" : `${averageDepth.toFixed(1)} km`} detail={depthFilter === "all" ? "All depth groups" : `${depthFilter} events`} />
      </section>

      {error && (
        <section className="mt-4 flex flex-col gap-3 rounded-2xl border border-red-400/25 bg-red-400/8 p-4 text-sm text-red-100 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2"><TriangleAlert className="size-4 shrink-0" aria-hidden="true" />{error}</span>
          <button type="button" onClick={() => setRetryVersion((value) => value + 1)} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-300/25 px-3 font-semibold transition hover:bg-red-300/10">
            <RotateCcw className="size-4" aria-hidden="true" />Retry
          </button>
        </section>
      )}

      <section className="panel mt-4 rounded-2xl p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
          <div>
            <h2 className="font-semibold text-slate-100">Earthquakes in {year}</h2>
            <p className="mt-0.5 text-xs text-slate-400">Philippines and surrounding seas · hover for details</p>
          </div>
          {loading && <span className="inline-flex items-center gap-2 text-xs text-sky-300"><RefreshCw className="size-3.5 animate-spin" aria-hidden="true" />Loading records</span>}
        </div>

        {!loading && !error && earthquakes.length === 0 ? (
          <div className="grid min-h-[500px] place-items-center rounded-2xl border border-dashed border-border bg-[#091827]/55 px-6 text-center sm:min-h-[620px]">
            <div>
              <Activity className="mx-auto size-8 text-slate-500" aria-hidden="true" />
              <p className="mt-3 font-medium text-slate-200">No earthquakes match these filters.</p>
              <p className="mt-1 text-sm text-slate-400">Try a lower magnitude or select all depths.</p>
            </div>
          </div>
        ) : (
          <ModuleErrorBoundary title="Earthquake map">
            <EarthquakeMap earthquakes={earthquakes} selectedId={effectiveSelectedId} onSelect={(earthquake) => setSelectedId(earthquake.id)} />
          </ModuleErrorBoundary>
        )}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="panel min-w-0 rounded-2xl p-4 sm:p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Recorded events</h2>
              <p className="mt-1 text-xs text-slate-400">Showing the latest {Math.min(earthquakes.length, 30)} filtered results</p>
            </div>
            <CalendarDays className="size-5 text-amber-300" aria-hidden="true" />
          </div>
          <div className="mt-4 max-h-[520px] overflow-auto rounded-xl border border-border/80">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[#091827] text-xs text-slate-400">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Magnitude and place</th>
                  <th className="px-3 py-2.5 font-medium">Depth</th>
                  <th className="px-3 py-2.5 font-medium">Date and time</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {earthquakes.slice(0, 30).map((earthquake) => {
                  const depth = earthquake.geometry.coordinates[2];
                  const active = earthquake.id === effectiveSelectedId;
                  return (
                    <tr key={earthquake.id} className={active ? "bg-sky-400/8" : "transition hover:bg-white/[0.035]"}>
                      <td className="px-3 py-3">
                        <button type="button" onClick={() => setSelectedId(earthquake.id)} className="block max-w-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
                          <span className="font-semibold text-slate-100">{magnitudeText(earthquake)}</span>
                          <span className="mt-0.5 block truncate text-xs text-slate-400">{earthquake.properties.place ?? "Location unavailable"}</span>
                        </button>
                      </td>
                      <td className="px-3 py-3 text-slate-300">{depth.toFixed(1)} km<span className="block text-xs text-slate-500">{depthGroup(depth)}</span></td>
                      <td className="px-3 py-3 text-xs text-slate-300">{formatEarthquakeTime(earthquake.properties.time)}</td>
                      <td className="px-3 py-3 capitalize text-slate-300">{earthquake.properties.status ?? "Unavailable"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="panel rounded-2xl p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-slate-100">Selected event</h2>
          {selected ? (
            <div className="mt-4">
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/8 p-4">
                <p className="text-3xl font-semibold text-amber-200">{magnitudeText(selected)}</p>
                <p className="mt-2 text-sm leading-5 text-slate-200">{selected.properties.place ?? "Location unavailable"}</p>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {[
                  ["Date and time", formatEarthquakeTime(selected.properties.time)],
                  ["Depth", selectedDepth === null ? "Data unavailable" : `${selectedDepth.toFixed(1)} km`],
                  ["Depth group", selectedDepth === null ? "Data unavailable" : depthGroup(selectedDepth)],
                  ["Display radius", `${markerRadius(selectedMagnitude).toFixed(1)} px`],
                  ["Magnitude type", selected.properties.magType ?? "Data unavailable"],
                  ["Review status", selected.properties.status ?? "Data unavailable"],
                  ["Felt reports", selected.properties.felt === null ? "Data unavailable" : selected.properties.felt.toLocaleString()],
                  ["Tsunami flag", selected.properties.tsunami === 1 ? "Yes" : selected.properties.tsunami === 0 ? "No" : "Data unavailable"],
                ].map(([term, value]) => (
                  <div key={term} className="rounded-lg border border-border/75 bg-[#091827]/70 p-3">
                    <dt className="text-[11px] text-slate-500">{term}</dt>
                    <dd className="mt-1 font-medium text-slate-200">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 rounded-xl border border-border/80 bg-[#091827]/70 p-3 text-xs leading-5 text-slate-400">
                Coordinates: {selected.geometry.coordinates[1].toFixed(4)}, {selected.geometry.coordinates[0].toFixed(4)}
              </div>
              {selected.properties.url && (
                <a href={selected.properties.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-sky-400/25 bg-sky-400/10 px-4 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/15">
                  Open USGS record<ExternalLink className="size-4" aria-hidden="true" />
                </a>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">Select a circle or table row to inspect an event.</p>
          )}
        </aside>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/8 p-4 text-sm leading-6 text-amber-50/80">
          <p className="flex items-center gap-2 font-semibold text-amber-200"><TriangleAlert className="size-4" aria-hidden="true" />Important limitation</p>
          <p className="mt-1">Marker radius is a visual magnitude scale, not an affected-area estimate. Earthquake records may be revised and this page does not predict earthquakes or replace PHIVOLCS advisories.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/methodology" className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white/5 px-4 text-sm font-medium text-slate-200 transition hover:bg-white/10">Methods and sources</Link>
          <a href="https://earthquake.phivolcs.dost.gov.ph/" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-sky-400/25 bg-sky-400/10 px-4 text-sm font-medium text-sky-200 transition hover:bg-sky-400/15">PHIVOLCS<ExternalLink className="size-4" aria-hidden="true" /></a>
        </div>
      </section>
    </main>
  );
}
