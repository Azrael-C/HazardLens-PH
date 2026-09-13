"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarRange,
  CloudRain,
  Crosshair,
  Database,
  Droplets,
  Gauge,
  Layers3,
  LoaderCircle,
  MapPin,
  Pause,
  Play,
  RefreshCw,
  Route,
  Satellite,
  Waves,
  WifiOff,
} from "lucide-react";
import { DataCharts } from "@/components/data-charts";
import { LocationSearch } from "@/components/location-search";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Analysis,
  DEFAULT_LOCATION,
  FloodResponse,
  ForecastResponse,
  LocationOption,
  NationalSnapshot,
  RadarFrame,
  SAVED_LOCATIONS,
  TrackedEvent,
  buildAnalysis,
  formatMetric,
  getFloodForecast,
  getForecast,
  getNationalSnapshot,
  getRadarFrames,
  getTrackedEvents,
  locationLabel,
} from "@/lib/hazardlens";

const FloodMap = dynamic(() => import("@/components/flood-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full min-h-[430px] place-items-center rounded-2xl bg-[#081827]">
      <div className="text-center text-slate-400">
        <LoaderCircle
          className="mx-auto mb-3 size-7 animate-spin text-sky-300"
          aria-hidden="true"
        />
        Loading interactive map…
      </div>
    </div>
  ),
});

type ServiceErrors = {
  forecast: string | null;
  flood: string | null;
  radar: string | null;
  snapshot: string | null;
  events: string | null;
};

type TimeWindow = "24h" | "3d" | "7d";

const riskTone = {
  Low: {
    text: "text-teal-300",
    border: "border-teal-400/25",
    background: "bg-teal-400/8",
  },
  Guarded: {
    text: "text-orange-300",
    border: "border-orange-400/25",
    background: "bg-orange-400/8",
  },
  Elevated: {
    text: "text-amber-300",
    border: "border-amber-400/25",
    background: "bg-amber-400/8",
  },
  High: {
    text: "text-red-300",
    border: "border-red-400/25",
    background: "bg-red-400/8",
  },
  "Data unavailable": {
    text: "text-slate-300",
    border: "border-slate-400/25",
    background: "bg-slate-400/8",
  },
};

function Metric({
  icon: Icon,
  label,
  value,
  loading,
  accent = "sky",
}: {
  icon: typeof Droplets;
  label: string;
  value: string;
  loading: boolean;
  accent?: "sky" | "teal" | "amber";
}) {
  const accentClass = {
    sky: "bg-sky-400/10 text-sky-300",
    teal: "bg-teal-400/10 text-teal-300",
    amber: "bg-amber-400/10 text-amber-300",
  }[accent];

  return (
    <div className="metric-glow rounded-xl border border-border/80 bg-[#0a1928]/75 p-3.5">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className={`grid size-8 place-items-center rounded-lg ${accentClass}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        {label}
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-7 w-24 bg-slate-700/70" />
      ) : (
        <p
          className="mt-3 break-words text-lg font-semibold tabular-nums text-slate-100"
          title={value}
        >
          {value}
        </p>
      )}
    </div>
  );
}

function ErrorNotice({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/8 p-3 text-sm text-red-100">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-300" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p>{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1.5 font-semibold text-red-200 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Retry
        </button>
      </div>
    </div>
  );
}

function radarTime(frame: RadarFrame | null) {
  if (!frame) return "Radar data unavailable";
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(frame.time * 1000));
}

export function FloodWorkspace() {
  const [location, setLocation] = useState<LocationOption>(DEFAULT_LOCATION);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [flood, setFlood] = useState<FloodResponse | null>(null);
  const [forecastLoading, setForecastLoading] = useState(true);
  const [floodLoading, setFloodLoading] = useState(true);
  const [errors, setErrors] = useState<ServiceErrors>({
    forecast: null,
    flood: null,
    radar: null,
    snapshot: null,
    events: null,
  });
  const [retryVersion, setRetryVersion] = useState(0);
  const [radarRetryVersion, setRadarRetryVersion] = useState(0);
  const [mapLayersRetryVersion, setMapLayersRetryVersion] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [online, setOnline] = useState(true);

  const [showRadar, setShowRadar] = useState(true);
  const [showRiver, setShowRiver] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showNationalSnapshot, setShowNationalSnapshot] = useState(true);
  const [showTrackedEvents, setShowTrackedEvents] = useState(true);
  const [showSatelliteRain, setShowSatelliteRain] = useState(false);
  const [nationalSnapshot, setNationalSnapshot] = useState<NationalSnapshot[]>([]);
  const [trackedEvents, setTrackedEvents] = useState<TrackedEvent[]>([]);
  const [mapLayersLoading, setMapLayersLoading] = useState(true);
  const [radarHost, setRadarHost] = useState<string | null>(null);
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [radarFrameIndex, setRadarFrameIndex] = useState(0);
  const [radarOpacity, setRadarOpacity] = useState(0.64);
  const [radarPlaying, setRadarPlaying] = useState(false);
  const [radarLoading, setRadarLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("3d");

  useEffect(() => {
    const updateOnlineState = () => setOnline(navigator.onLine);
    updateOnlineState();
    window.addEventListener("online", updateOnlineState);
    window.addEventListener("offline", updateOnlineState);

    return () => {
      window.removeEventListener("online", updateOnlineState);
      window.removeEventListener("offline", updateOnlineState);
    };
  }, []);

  useEffect(() => {
    let active = true;

    void Promise.allSettled([getForecast(location), getFloodForecast(location)]).then(
      ([forecastResult, floodResult]) => {
        if (!active) return;

        if (forecastResult.status === "fulfilled") {
          setForecast(forecastResult.value);
        } else {
          setErrors((current) => ({
            ...current,
            forecast: "Unable to retrieve the rainfall forecast.",
          }));
        }

        if (floodResult.status === "fulfilled") {
          const hasRiverValues =
            floodResult.value.daily?.river_discharge?.some(
              (value) => typeof value === "number",
            ) ?? false;

          if (hasRiverValues) {
            setFlood(floodResult.value);
          } else {
            setErrors((current) => ({
              ...current,
              flood: "River data unavailable for this location.",
            }));
          }
        } else {
          setErrors((current) => ({
            ...current,
            flood: "Unable to retrieve river-discharge data.",
          }));
        }

        setForecastLoading(false);
        setFloodLoading(false);
        setLastUpdated(new Date());
      },
    );

    return () => {
      active = false;
    };
  }, [location, retryVersion]);

  useEffect(() => {
    let active = true;

    void getRadarFrames()
      .then((payload) => {
        if (!active) return;
        const frames = payload.radar?.past ?? [];
        if (!payload.host || !frames.length) {
          throw new Error("No radar frames returned.");
        }
        setRadarHost(payload.host);
        setRadarFrames(frames);
        setRadarFrameIndex(frames.length - 1);
      })
      .catch(() => {
        if (!active) return;
        setRadarHost(null);
        setRadarFrames([]);
        setRadarFrameIndex(0);
        setErrors((current) => ({
          ...current,
          radar: "Rain radar is temporarily unavailable. The map is still usable.",
        }));
      })
      .finally(() => {
        if (active) setRadarLoading(false);
      });

    return () => {
      active = false;
    };
  }, [radarRetryVersion]);

  useEffect(() => {
    let active = true;

    void Promise.allSettled([getNationalSnapshot(), getTrackedEvents()]).then(
      ([snapshotResult, eventsResult]) => {
        if (!active) return;

        if (snapshotResult.status === "fulfilled") {
          setNationalSnapshot(snapshotResult.value);
        } else {
          setNationalSnapshot([]);
          setErrors((current) => ({
            ...current,
            snapshot: "The national rainfall and river snapshot is temporarily unavailable.",
          }));
        }

        if (eventsResult.status === "fulfilled") {
          setTrackedEvents(eventsResult.value);
        } else {
          setTrackedEvents([]);
          setErrors((current) => ({
            ...current,
            events: "NASA-tracked events are temporarily unavailable.",
          }));
        }

        setMapLayersLoading(false);
      },
    );

    return () => {
      active = false;
    };
  }, [mapLayersRetryVersion]);

  useEffect(() => {
    if (!radarPlaying || radarFrames.length < 2) return;

    const interval = window.setInterval(() => {
      setRadarFrameIndex((current) => (current + 1) % radarFrames.length);
    }, 1200);

    return () => window.clearInterval(interval);
  }, [radarFrames.length, radarPlaying]);

  const analysis: Analysis = useMemo(
    () => buildAnalysis(forecast, flood),
    [forecast, flood],
  );
  const hasAnyData = Boolean(forecast || flood);
  const displayRisk = hasAnyData ? analysis.riskLevel : "Data unavailable";
  const tone = riskTone[displayRisk];
  const currentRadarFrame = radarFrames[radarFrameIndex] ?? null;
  const mainLoading = forecastLoading && floodLoading;

  function selectLocation(nextLocation: LocationOption) {
    setForecastLoading(true);
    setFloodLoading(true);
    setForecast(null);
    setFlood(null);
    setErrors((current) => ({ ...current, forecast: null, flood: null }));
    setLocation(nextLocation);
  }

  function retryData() {
    setForecastLoading(true);
    setFloodLoading(true);
    setForecast(null);
    setFlood(null);
    setErrors((current) => ({ ...current, forecast: null, flood: null }));
    setRetryVersion((current) => current + 1);
  }

  function retryRadar() {
    setRadarLoading(true);
    setErrors((current) => ({ ...current, radar: null }));
    setRadarRetryVersion((value) => value + 1);
  }

  function retryMapLayers() {
    setMapLayersLoading(true);
    setErrors((current) => ({ ...current, snapshot: null, events: null }));
    setMapLayersRetryVersion((value) => value + 1);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        selectLocation({
          id: `gps-${position.coords.latitude}-${position.coords.longitude}`,
          name: "Current location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          admin1: "Philippines",
        });
      },
      () => {
        setErrors((current) => ({
          ...current,
          forecast: "Location access was unavailable. Search for an area instead.",
        }));
      },
      { enableHighAccuracy: false, timeout: 9000 },
    );
  }

  return (
    <main className="mx-auto max-w-[1800px] px-3 py-4 sm:px-5 sm:py-6">
      {!online && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          <WifiOff className="size-5 shrink-0 text-amber-300" aria-hidden="true" />
          You are offline. Reconnect to refresh rainfall, river, radar, and event data.
        </div>
      )}

      <section className="mb-4 flex flex-col items-stretch justify-center gap-3 lg:flex-row">
        <div className="mx-auto w-full max-w-3xl">
          <LocationSearch value={location} onSelect={selectLocation} />
        </div>
        <button
          type="button"
          onClick={useCurrentLocation}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-[#102338] px-4 text-sm font-semibold text-slate-100 transition hover:border-sky-400/40 hover:bg-sky-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Crosshair className="size-4 text-sky-300" aria-hidden="true" />
          Use my location
        </button>
      </section>

      <section className="grid items-stretch gap-4 xl:grid-cols-[280px_minmax(560px,1fr)_280px]">
        <aside className="order-3 grid content-start gap-4 xl:order-1">
          <article className="panel rounded-2xl p-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-100">
              <Layers3 className="size-5 text-sky-300" aria-hidden="true" />
              Map Layers
            </h2>
            <div className="mt-3 divide-y divide-border/70">
              {[
                {
                  label: mapLayersLoading
                    ? "National Snapshot · loading"
                    : `National Snapshot · ${nationalSnapshot.length}`,
                  icon: MapPin,
                  checked: showNationalSnapshot,
                  onCheckedChange: setShowNationalSnapshot,
                  color: "text-teal-300",
                },
                {
                  label: "Rain Radar",
                  icon: CloudRain,
                  checked: showRadar,
                  onCheckedChange: setShowRadar,
                  color: "text-sky-300",
                },
                {
                  label: "Satellite Rainfall",
                  icon: Satellite,
                  checked: showSatelliteRain,
                  onCheckedChange: setShowSatelliteRain,
                  color: "text-violet-300",
                },
                {
                  label: "River Indicator",
                  icon: Waves,
                  checked: showRiver,
                  onCheckedChange: setShowRiver,
                  color: "text-teal-300",
                },
                {
                  label: `NASA Events · ${trackedEvents.length}`,
                  icon: AlertTriangle,
                  checked: showTrackedEvents,
                  onCheckedChange: setShowTrackedEvents,
                  color: "text-fuchsia-300",
                },
                {
                  label: "Saved Markers",
                  icon: MapPin,
                  checked: showMarkers,
                  onCheckedChange: setShowMarkers,
                  color: "text-amber-300",
                },
              ].map((layer) => (
                <label
                  key={layer.label}
                  className="flex min-h-12 cursor-pointer items-center gap-3 py-2 text-sm text-slate-200"
                >
                  <layer.icon
                    className={`size-4 ${layer.color}`}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{layer.label}</span>
                  <Switch
                    checked={layer.checked}
                    onCheckedChange={layer.onCheckedChange}
                    aria-label={`Toggle ${layer.label}`}
                    className="data-[state=checked]:bg-teal-400"
                  />
                </label>
              ))}
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>Radar opacity</span>
                <span>{Math.round(radarOpacity * 100)}%</span>
              </div>
              <Slider
                value={[Math.round(radarOpacity * 100)]}
                min={20}
                max={90}
                step={5}
                onValueChange={(value) => setRadarOpacity(value[0] / 100)}
                aria-label="Radar layer opacity"
              />
            </div>
          </article>

          <article className="panel rounded-2xl p-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-100">
              <CalendarRange className="size-5 text-sky-300" aria-hidden="true" />
              Time Window
            </h2>
            <Tabs
              value={timeWindow}
              onValueChange={(value) => setTimeWindow(value as TimeWindow)}
              className="mt-4"
            >
              <TabsList className="grid h-10 w-full grid-cols-3 bg-[#081827]">
                <TabsTrigger value="24h">24H</TabsTrigger>
                <TabsTrigger value="3d">3D</TabsTrigger>
                <TabsTrigger value="7d">7D</TabsTrigger>
              </TabsList>
            </Tabs>
          </article>

          <article className="panel rounded-2xl p-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-100">
              <Route className="size-5 text-sky-300" aria-hidden="true" />
              Saved Locations
            </h2>
            <div className="mt-3 space-y-1.5">
              {SAVED_LOCATIONS.map((saved) => {
                const active = saved.id === location.id;
                return (
                  <button
                    key={saved.id}
                    type="button"
                    onClick={() => selectLocation(saved)}
                    className={`flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      active
                        ? "bg-sky-400/12 text-sky-200"
                        : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
                    }`}
                  >
                    <MapPin
                      className={`size-4 shrink-0 ${
                        active ? "text-sky-300" : "text-slate-500"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{saved.name}</span>
                  </button>
                );
              })}
            </div>
          </article>
        </aside>

        <section className="order-2 panel flex min-h-[610px] flex-col rounded-2xl p-2 sm:p-3 xl:order-2">
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-3 pt-1">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-100">
                {locationLabel(location)}
              </p>
              <p className="mt-0.5 text-xs tabular-nums text-slate-400">
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </p>
              <p className="mt-1 text-[0.7rem] text-slate-500">
                {nationalSnapshot.length} national samples · {trackedEvents.length} NASA-tracked events
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span
                className={`size-2 rounded-full ${
                  errors.forecast && errors.flood
                    ? "bg-red-400"
                    : mainLoading
                      ? "animate-pulse bg-amber-300"
                      : "bg-emerald-400"
                }`}
                aria-hidden="true"
              />
              {mainLoading
                ? "Updating data"
                : lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString("en-PH", {
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "Asia/Manila",
                    })}`
                  : "Waiting for data"}
            </div>
          </div>

          <div className="min-h-[430px] flex-1">
            <FloodMap
              location={location}
              riskLevel={displayRisk}
              showRadar={showRadar}
              showRiver={showRiver}
              showMarkers={showMarkers}
              showNationalSnapshot={showNationalSnapshot}
              showTrackedEvents={showTrackedEvents}
              showSatelliteRain={showSatelliteRain}
              nationalSnapshot={nationalSnapshot}
              trackedEvents={trackedEvents}
              radarHost={radarHost}
              radarFrame={currentRadarFrame}
              radarOpacity={radarOpacity}
              onMapClick={selectLocation}
            />
          </div>

          <div className="mt-2 rounded-xl border border-border/80 bg-[#081827]/90 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setRadarPlaying((current) => !current)}
                disabled={radarFrames.length < 2}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-sky-400/35 bg-sky-400/10 text-sky-200 transition hover:bg-sky-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={radarPlaying ? "Pause radar animation" : "Play radar animation"}
              >
                {radarPlaying ? (
                  <Pause className="size-4" aria-hidden="true" />
                ) : (
                  <Play className="ml-0.5 size-4" aria-hidden="true" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-400">
                  <span>Radar timeline · past two hours</span>
                  <span className="truncate">{radarTime(currentRadarFrame)}</span>
                </div>
                {radarLoading ? (
                  <Skeleton className="h-2 w-full bg-slate-700/70" />
                ) : radarFrames.length ? (
                  <Slider
                    value={[radarFrameIndex]}
                    min={0}
                    max={Math.max(radarFrames.length - 1, 0)}
                    step={1}
                    onValueChange={(value) => setRadarFrameIndex(value[0])}
                    aria-label="Radar frame"
                  />
                ) : (
                  <div className="h-1.5 rounded-full bg-slate-700" />
                )}
              </div>
            </div>
          </div>
        </section>

        <aside className="order-1 grid content-start gap-4 xl:order-3">
          <article className={`panel rounded-2xl p-4 ${tone.border}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Gauge className="size-4 text-sky-300" aria-hidden="true" />
                  Flood Potential
                </p>
                {mainLoading ? (
                  <Skeleton className="mt-4 h-10 w-40 bg-slate-700/70" />
                ) : (
                  <p className={`mt-3 text-3xl font-bold tracking-tight ${tone.text}`}>
                    {displayRisk}
                  </p>
                )}
              </div>
              <span className={`rounded-full border px-2 py-1 text-[0.72rem] ${tone.border} ${tone.background} ${tone.text}`}>
                Model-based
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {hasAnyData
                ? analysis.reasons[0]
                : "The APIs did not provide enough values to calculate a potential level."}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <Metric
                icon={CloudRain}
                label="24H rainfall"
                value={formatMetric(analysis.next24Rain, "mm")}
                loading={forecastLoading}
                accent="sky"
              />
              <Metric
                icon={Waves}
                label="Discharge"
                value={formatMetric(analysis.currentDischarge, "m³/s")}
                loading={floodLoading}
                accent="teal"
              />
              <Metric
                icon={Droplets}
                label="River trend"
                value={
                  analysis.dischargeChange === null
                    ? "Data unavailable"
                    : `${analysis.dischargeChange >= 0 ? "+" : ""}${analysis.dischargeChange.toFixed(1)}%`
                }
                loading={floodLoading}
                accent="teal"
              />
              <Metric
                icon={Satellite}
                label="Uncertainty"
                value={analysis.uncertaintyLabel}
                loading={floodLoading}
                accent="amber"
              />
            </div>
          </article>

          {(errors.forecast ||
            errors.flood ||
            errors.radar ||
            errors.snapshot ||
            errors.events) && (
            <div className="grid gap-2.5">
              {errors.forecast && (
                <ErrorNotice message={errors.forecast} onRetry={retryData} />
              )}
              {errors.flood && (
                <ErrorNotice message={errors.flood} onRetry={retryData} />
              )}
              {errors.radar && (
                <ErrorNotice
                  message={errors.radar}
                  onRetry={retryRadar}
                />
              )}
              {errors.snapshot && (
                <ErrorNotice
                  message={errors.snapshot}
                  onRetry={retryMapLayers}
                />
              )}
              {errors.events && (
                <ErrorNotice
                  message={errors.events}
                  onRetry={retryMapLayers}
                />
              )}
            </div>
          )}

          <article className="panel rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-100">
                <Database className="size-4 text-sky-300" aria-hidden="true" />
                Why this level?
              </h2>
              <span className="text-xs text-slate-500">Explainable result</span>
            </div>
            <ol className="mt-4 space-y-3">
              {analysis.reasons.slice(0, 3).map((reason, index) => (
                <li
                  key={reason}
                  className="flex gap-3 text-sm leading-5 text-slate-300"
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sky-400/10 text-xs font-semibold text-sky-300">
                    {index + 1}
                  </span>
                  {reason}
                </li>
              ))}
            </ol>
          </article>
        </aside>
      </section>

      <div className="mt-4">
        <DataCharts
          analysis={analysis}
          timeWindow={timeWindow}
          locationName={location.name}
        />
      </div>

      <footer className="mt-4 flex flex-col items-start justify-between gap-2 border-t border-border/70 px-1 py-4 text-xs leading-5 text-slate-500 sm:flex-row">
        <p>
          Forecast-based information only · Not confirmation of current street flooding
        </p>
        <p>Sources: Open-Meteo · RainViewer · NASA EONET/GIBS · OpenStreetMap</p>
      </footer>
    </main>
  );
}
