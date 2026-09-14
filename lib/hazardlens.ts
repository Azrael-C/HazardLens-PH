export type LocationOption = {
  id: number | string;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  admin2?: string;
  country?: string;
};

export type NullableNumber = number | null;

export type DataStatus = {
  source: "provider" | "demo" | "local-cache";
  servedAt: string;
  message?: string;
};

export type ForecastResponse = {
  hazardlens?: DataStatus;
  current?: {
    time?: string;
    precipitation?: NullableNumber;
    rain?: NullableNumber;
    showers?: NullableNumber;
    weather_code?: NullableNumber;
  };
  hourly?: {
    time?: string[];
    precipitation?: NullableNumber[];
    precipitation_probability?: NullableNumber[];
    rain?: NullableNumber[];
    showers?: NullableNumber[];
  };
  hourly_units?: Record<string, string>;
};

export type FloodResponse = {
  hazardlens?: DataStatus;
  latitude?: number;
  longitude?: number;
  daily?: {
    time?: string[];
    river_discharge?: NullableNumber[];
    river_discharge_mean?: NullableNumber[];
    river_discharge_median?: NullableNumber[];
    river_discharge_max?: NullableNumber[];
    river_discharge_p25?: NullableNumber[];
    river_discharge_p75?: NullableNumber[];
  };
  daily_units?: Record<string, string>;
};

export type RadarFrame = {
  time: number;
  path: string;
};

export type RadarResponse = {
  hazardlens?: DataStatus;
  generated?: number;
  host?: string;
  radar?: {
    past?: RadarFrame[];
  };
};

export type RiskLevel = "Low" | "Guarded" | "Elevated" | "High";

export type NationalSnapshot = LocationOption & {
  currentPrecipitation: NullableNumber;
  next24Rain: NullableNumber;
  currentDischarge: NullableNumber;
  dischargeChange: NullableNumber;
  riskLevel: RiskLevel;
};

export type TrackedEvent = {
  id: string;
  title: string;
  category: string;
  date: string | null;
  latitude: number;
  longitude: number;
  sourceUrl: string | null;
};

export type Analysis = {
  past24Rain: NullableNumber;
  next24Rain: NullableNumber;
  maxRainProbability: NullableNumber;
  currentPrecipitation: NullableNumber;
  currentDischarge: NullableNumber;
  tomorrowDischarge: NullableNumber;
  dischargeChange: NullableNumber;
  uncertaintySpread: NullableNumber;
  uncertaintyLow: NullableNumber;
  uncertaintyHigh: NullableNumber;
  uncertaintyLabel: string;
  riskLevel: RiskLevel;
  reasons: string[];
  rainChart: Array<{
    label: string;
    precipitation: NullableNumber;
    probability: NullableNumber;
  }>;
  riverChart: Array<{
    date: string;
    discharge: NullableNumber;
    mean: NullableNumber;
    median: NullableNumber;
    maximum: NullableNumber;
    p25: NullableNumber;
    p75: NullableNumber;
  }>;
};

export const DEFAULT_LOCATION: LocationOption = {
  id: "manila",
  name: "Manila",
  latitude: 14.5995,
  longitude: 120.9842,
  admin1: "Metro Manila",
  country: "Philippines",
};

export const SAVED_LOCATIONS: LocationOption[] = [
  DEFAULT_LOCATION,
  { id: "marikina", name: "Marikina", latitude: 14.6507, longitude: 121.1029, admin1: "Metro Manila", country: "Philippines" },
  { id: "pampanga-delta", name: "Pampanga Delta", latitude: 14.933, longitude: 120.585, admin1: "Pampanga", country: "Philippines" },
  { id: "cagayan-de-oro-preset", name: "Cagayan de Oro", latitude: 8.4542, longitude: 124.6319, admin1: "Misamis Oriental", country: "Philippines" },
  { id: "cotabato-preset", name: "Cotabato City", latitude: 7.2047, longitude: 124.231, admin1: "Maguindanao del Norte", country: "Philippines" },
];

export const NATIONAL_SAMPLE_LOCATIONS: LocationOption[] = [
  { id: "laoag", name: "Laoag", latitude: 18.196, longitude: 120.593, admin1: "Ilocos Norte" },
  { id: "tuguegarao", name: "Tuguegarao", latitude: 17.613, longitude: 121.727, admin1: "Cagayan" },
  { id: "baguio", name: "Baguio", latitude: 16.402, longitude: 120.596, admin1: "Cordillera" },
  { id: "manila-grid", name: "Metro Manila", latitude: 14.6, longitude: 120.984, admin1: "NCR" },
  { id: "naga", name: "Naga", latitude: 13.622, longitude: 123.195, admin1: "Camarines Sur" },
  { id: "legazpi", name: "Legazpi", latitude: 13.139, longitude: 123.744, admin1: "Albay" },
  { id: "calapan", name: "Calapan", latitude: 13.411, longitude: 121.18, admin1: "Oriental Mindoro" },
  { id: "puerto-princesa", name: "Puerto Princesa", latitude: 9.739, longitude: 118.735, admin1: "Palawan" },
  { id: "iloilo", name: "Iloilo City", latitude: 10.72, longitude: 122.562, admin1: "Iloilo" },
  { id: "bacolod", name: "Bacolod", latitude: 10.677, longitude: 122.951, admin1: "Negros Occidental" },
  { id: "cebu", name: "Cebu City", latitude: 10.316, longitude: 123.885, admin1: "Cebu" },
  { id: "tacloban-grid", name: "Tacloban", latitude: 11.243, longitude: 125.003, admin1: "Leyte" },
  { id: "surigao", name: "Surigao City", latitude: 9.757, longitude: 125.514, admin1: "Surigao del Norte" },
  { id: "cagayan-de-oro", name: "Cagayan de Oro", latitude: 8.454, longitude: 124.632, admin1: "Misamis Oriental" },
  { id: "cotabato", name: "Cotabato City", latitude: 7.224, longitude: 124.246, admin1: "Maguindanao del Norte" },
  { id: "davao", name: "Davao City", latitude: 7.191, longitude: 125.455, admin1: "Davao del Sur" },
  { id: "zamboanga", name: "Zamboanga City", latitude: 6.921, longitude: 122.079, admin1: "Zamboanga del Sur" },
  { id: "general-santos", name: "General Santos", latitude: 6.116, longitude: 125.172, admin1: "South Cotabato" },
];

export const NASA_PRECIPITATION_TILES =
  "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/IMERG_Precipitation_Rate/default/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png";

const CLIENT_CACHE_VERSION = "v1";

function internalUrl(service: string, params: Record<string, string> = {}) {
  const search = new URLSearchParams({ service, ...params });
  return `/api/hazards?${search.toString()}`;
}

function readCached<T>(key: string, maxAgeMs: number): T | null {
  try {
    const stored = localStorage.getItem(`hazardlens:${CLIENT_CACHE_VERSION}:${key}`);
    if (!stored) return null;
    const cached = JSON.parse(stored) as { savedAt: string; payload: T };
    if (Date.now() - new Date(cached.savedAt).getTime() > maxAgeMs) return null;
    if (cached.payload && !Array.isArray(cached.payload) && typeof cached.payload === "object") {
      return {
        ...cached.payload,
        hazardlens: {
          source: "local-cache",
          servedAt: cached.savedAt,
          message: "The network is unavailable. Showing the last successful result stored on this device.",
        },
      } as T;
    }
    return cached.payload;
  } catch {
    return null;
  }
}

function writeCached<T>(key: string, payload: T) {
  try {
    const status = payload && !Array.isArray(payload) && typeof payload === "object"
      ? (payload as { hazardlens?: DataStatus }).hazardlens
      : undefined;
    if (status?.source === "demo") return;
    localStorage.setItem(`hazardlens:${CLIENT_CACHE_VERSION}:${key}`, JSON.stringify({ savedAt: new Date().toISOString(), payload }));
  } catch {
    return;
  }
}

async function fetchJson<T>(
  url: string,
  cacheKey?: string,
  maxCacheAgeMs = 6 * 60 * 60 * 1000,
  timeoutMs = 14000,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as T & {
      error?: boolean;
      reason?: string;
    };

    if (payload?.error) {
      throw new Error(payload.reason || "The data service returned an error.");
    }

    if (cacheKey) writeCached(cacheKey, payload);
    return payload;
  } catch (error) {
    const cached = cacheKey ? readCached<T>(cacheKey, maxCacheAgeMs) : null;
    if (cached) return cached;
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function searchPhilippineLocations(query: string) {
  const data = await fetchJson<{ results?: LocationOption[] }>(
    internalUrl("geocode", { q: query }),
  );
  return data.results ?? [];
}

export async function getForecast(location: LocationOption) {
  const coordinates = {
    latitude: String(location.latitude),
    longitude: String(location.longitude),
  };
  return fetchJson<ForecastResponse>(
    internalUrl("forecast", coordinates),
    `forecast:${location.latitude.toFixed(4)}:${location.longitude.toFixed(4)}`,
  );
}

export async function getFloodForecast(location: LocationOption) {
  const coordinates = {
    latitude: String(location.latitude),
    longitude: String(location.longitude),
  };
  return fetchJson<FloodResponse>(
    internalUrl("flood", coordinates),
    `flood:${location.latitude.toFixed(4)}:${location.longitude.toFixed(4)}`,
  );
}

export async function getRadarFrames() {
  return fetchJson<RadarResponse>(
    internalUrl("radar"),
    "radar",
    90 * 60 * 1000,
  );
}

type SnapshotForecastResponse = {
  current?: { precipitation?: NullableNumber };
  hourly?: { precipitation?: NullableNumber[] };
};

type SnapshotFloodResponse = {
  daily?: {
    time?: string[];
    river_discharge?: NullableNumber[];
  };
};

function asResponseList<T>(value: T | T[]) {
  return Array.isArray(value) ? value : [value];
}

export async function getNationalSnapshot() {
  const latitudes = NATIONAL_SAMPLE_LOCATIONS.map((item) => item.latitude).join(",");
  const longitudes = NATIONAL_SAMPLE_LOCATIONS.map((item) => item.longitude).join(",");

  const coordinates = { latitude: latitudes, longitude: longitudes, mode: "snapshot" };

  const [forecastResult, floodResult] = await Promise.allSettled([
    fetchJson<SnapshotForecastResponse | SnapshotForecastResponse[]>(
      internalUrl("forecast", coordinates),
      "national-snapshot:forecast",
    ),
    fetchJson<SnapshotFloodResponse | SnapshotFloodResponse[]>(
      internalUrl("flood", coordinates),
      "national-snapshot:flood",
    ),
  ]);

  if (forecastResult.status === "rejected" && floodResult.status === "rejected") {
    throw new Error("National snapshot services are unavailable.");
  }

  const forecasts =
    forecastResult.status === "fulfilled" ? asResponseList(forecastResult.value) : [];
  const floods =
    floodResult.status === "fulfilled" ? asResponseList(floodResult.value) : [];

  return NATIONAL_SAMPLE_LOCATIONS.map((location, index): NationalSnapshot => {
    const forecast = forecasts[index];
    const flood = floods[index];
    const riverTimes = flood?.daily?.time ?? [];
    const todayIndex = getTodayIndex(riverTimes);
    const currentDischarge = valueAt(flood?.daily?.river_discharge, todayIndex);
    const tomorrowDischarge = valueAt(
      flood?.daily?.river_discharge,
      Math.min(todayIndex + 1, Math.max(riverTimes.length - 1, 0)),
    );
    const dischargeChange =
      isNumber(currentDischarge) && isNumber(tomorrowDischarge)
        ? ((tomorrowDischarge - currentDischarge) /
            Math.max(Math.abs(currentDischarge), 0.01)) *
          100
        : null;
    const next24Rain = totalAvailable(forecast?.hourly?.precipitation ?? []);
    const currentPrecipitation = isNumber(forecast?.current?.precipitation)
      ? forecast.current.precipitation
      : null;

    return {
      ...location,
      currentPrecipitation,
      next24Rain,
      currentDischarge,
      dischargeChange,
      riskLevel: classifyPotential(next24Rain, dischargeChange, currentPrecipitation),
    };
  });
}

type EonetFeature = {
  properties?: {
    id?: string;
    title?: string;
    date?: string;
    categories?: Array<{ title?: string }>;
    sources?: Array<{ url?: string }>;
  };
  geometry?: {
    type?: string;
    coordinates?: unknown;
  };
};

function eventPoint(feature: EonetFeature) {
  const geometry = feature.geometry;
  if (!geometry || !Array.isArray(geometry.coordinates)) return null;

  if (
    geometry.type === "Point" &&
    typeof geometry.coordinates[0] === "number" &&
    typeof geometry.coordinates[1] === "number"
  ) {
    return { longitude: geometry.coordinates[0], latitude: geometry.coordinates[1] };
  }

  const points: number[][] = [];
  const collect = (coordinates: unknown) => {
    if (!Array.isArray(coordinates)) return;
    if (typeof coordinates[0] === "number" && typeof coordinates[1] === "number") {
      points.push(coordinates as number[]);
      return;
    }
    coordinates.forEach(collect);
  };
  collect(geometry.coordinates);
  if (!points.length) return null;
  return {
    longitude: points.reduce((sum, point) => sum + point[0], 0) / points.length,
    latitude: points.reduce((sum, point) => sum + point[1], 0) / points.length,
  };
}

export async function getTrackedEvents() {
  const payload = await fetchJson<{ features?: EonetFeature[] }>(
    internalUrl("events"),
    "tracked-events",
    24 * 60 * 60 * 1000,
  );
  const events = new Map<string, TrackedEvent>();

  for (const feature of payload.features ?? []) {
    const point = eventPoint(feature);
    const id = feature.properties?.id;
    if (!point || !id) continue;
    if (
      point.latitude < 4 ||
      point.latitude > 22 ||
      point.longitude < 116 ||
      point.longitude > 127
    ) {
      continue;
    }

    const candidate: TrackedEvent = {
      id,
      title: feature.properties?.title ?? "NASA-tracked event",
      category: feature.properties?.categories?.[0]?.title ?? "Natural event",
      date: feature.properties?.date ?? null,
      latitude: point.latitude,
      longitude: point.longitude,
      sourceUrl: feature.properties?.sources?.[0]?.url ?? null,
    };
    const previous = events.get(id);
    if (!previous || (candidate.date ?? "") > (previous.date ?? "")) {
      events.set(id, candidate);
    }
  }

  return [...events.values()];
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function totalAvailable(values: NullableNumber[]) {
  const available = values.filter(isNumber);
  return available.length
    ? available.reduce((sum, value) => sum + value, 0)
    : null;
}

function maxAvailable(values: NullableNumber[]) {
  const available = values.filter(isNumber);
  return available.length ? Math.max(...available) : null;
}

function manilaTimeMs(value: string) {
  const withSeconds = value.length === 16 ? `${value}:00` : value;
  return new Date(`${withSeconds}+08:00`).getTime();
}

function formatHour(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    weekday: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(manilaTimeMs(value)));
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(`${value}T00:00:00+08:00`));
}

function valueAt(values: NullableNumber[] | undefined, index: number) {
  const value = values?.[index];
  return isNumber(value) ? value : null;
}

function getTodayIndex(times: string[]) {
  const today = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Manila",
  }).format(new Date());
  const exact = times.indexOf(today);
  return exact >= 0 ? exact : Math.min(7, Math.max(times.length - 1, 0));
}

function uncertaintyLabel(
  spread: NullableNumber,
  current: NullableNumber,
) {
  if (!isNumber(spread) || !isNumber(current)) return "Data unavailable";
  const relative = spread / Math.max(Math.abs(current), 0.01);
  if (relative < 0.2) return "Low";
  if (relative < 0.55) return "Moderate";
  return "Wide";
}

function classifyPotential(
  nextRain: NullableNumber,
  change: NullableNumber,
  currentRain: NullableNumber,
): RiskLevel {
  let score = 0;

  if (isNumber(nextRain)) {
    score += nextRain >= 50 ? 3 : nextRain >= 25 ? 2 : nextRain >= 10 ? 1 : 0;
  }
  if (isNumber(change)) {
    score += change >= 20 ? 2 : change >= 5 ? 1 : 0;
  }
  if (isNumber(currentRain) && currentRain >= 5) score += 1;

  if (score >= 5) return "High";
  if (score >= 3) return "Elevated";
  if (score >= 1) return "Guarded";
  return "Low";
}

export function buildAnalysis(
  forecast: ForecastResponse | null,
  flood: FloodResponse | null,
): Analysis {
  const hourlyTimes = forecast?.hourly?.time ?? [];
  const hourlyPrecipitation = forecast?.hourly?.precipitation ?? [];
  const hourlyProbability = forecast?.hourly?.precipitation_probability ?? [];
  const now = Date.now();

  const indexedHours = hourlyTimes.map((time, index) => ({
    time,
    timestamp: manilaTimeMs(time),
    precipitation: valueAt(hourlyPrecipitation, index),
    probability: valueAt(hourlyProbability, index),
  }));

  const past24 = indexedHours.filter(
    (entry) => entry.timestamp <= now && entry.timestamp > now - 86400000,
  );
  const next24 = indexedHours.filter(
    (entry) => entry.timestamp > now && entry.timestamp <= now + 86400000,
  );
  const nextSevenDays = indexedHours
    .filter(
      (entry) => entry.timestamp > now && entry.timestamp <= now + 604800000,
    )
    .filter((_, index) => index % 6 === 0);

  const past24Rain = totalAvailable(past24.map((entry) => entry.precipitation));
  const next24Rain = totalAvailable(next24.map((entry) => entry.precipitation));
  const maxRainProbability = maxAvailable(
    next24.map((entry) => entry.probability),
  );
  const currentPrecipitation = isNumber(forecast?.current?.precipitation)
    ? forecast.current.precipitation
    : null;

  const daily = flood?.daily;
  const riverTimes = daily?.time ?? [];
  const todayIndex = getTodayIndex(riverTimes);
  const currentDischarge = valueAt(daily?.river_discharge, todayIndex);
  const tomorrowDischarge = valueAt(
    daily?.river_discharge,
    Math.min(todayIndex + 1, Math.max(riverTimes.length - 1, 0)),
  );
  const dischargeChange =
    isNumber(currentDischarge) && isNumber(tomorrowDischarge)
      ? ((tomorrowDischarge - currentDischarge) /
          Math.max(Math.abs(currentDischarge), 0.01)) *
        100
      : null;
  const uncertaintyLow = valueAt(daily?.river_discharge_p25, todayIndex);
  const uncertaintyHigh = valueAt(daily?.river_discharge_p75, todayIndex);
  const uncertaintySpread =
    isNumber(uncertaintyLow) && isNumber(uncertaintyHigh)
      ? uncertaintyHigh - uncertaintyLow
      : null;
  const riskLevel = classifyPotential(
    next24Rain,
    dischargeChange,
    currentPrecipitation,
  );

  const reasons: string[] = [];
  if (isNumber(next24Rain)) {
    reasons.push(
      `${next24Rain.toFixed(1)} mm of precipitation is forecast during the next 24 hours.`,
    );
  }
  if (isNumber(dischargeChange)) {
    const direction =
      dischargeChange > 5
        ? "rising"
        : dischargeChange < -5
          ? "decreasing"
          : "stable";
    reasons.push(
      `Nearby modeled river discharge is ${direction} (${dischargeChange >= 0 ? "+" : ""}${dischargeChange.toFixed(1)}%).`,
    );
  }
  if (isNumber(uncertaintyLow) && isNumber(uncertaintyHigh)) {
    reasons.push(
      `The ensemble range is ${uncertaintyLow.toFixed(1)}–${uncertaintyHigh.toFixed(1)} m³/s.`,
    );
  }
  if (!reasons.length) {
    reasons.push("Current observations are delayed. Try again shortly or select a saved location.");
  }

  return {
    past24Rain,
    next24Rain,
    maxRainProbability,
    currentPrecipitation,
    currentDischarge,
    tomorrowDischarge,
    dischargeChange,
    uncertaintySpread,
    uncertaintyLow,
    uncertaintyHigh,
    uncertaintyLabel: uncertaintyLabel(
      uncertaintySpread,
      currentDischarge,
    ),
    riskLevel,
    reasons,
    rainChart: nextSevenDays.map((entry) => ({
      label: formatHour(entry.time),
      precipitation: entry.precipitation,
      probability: entry.probability,
    })),
    riverChart: riverTimes.map((date, index) => ({
      date: formatDay(date),
      discharge: valueAt(daily?.river_discharge, index),
      mean: valueAt(daily?.river_discharge_mean, index),
      median: valueAt(daily?.river_discharge_median, index),
      maximum: valueAt(daily?.river_discharge_max, index),
      p25: valueAt(daily?.river_discharge_p25, index),
      p75: valueAt(daily?.river_discharge_p75, index),
    })),
  };
}

export function formatMetric(
  value: NullableNumber,
  unit: string,
  maximumFractionDigits = 1,
) {
  if (!isNumber(value)) return "Not reported";
  return `${value.toLocaleString("en-PH", { maximumFractionDigits })}${unit ? ` ${unit}` : ""}`;
}

export function locationLabel(location: LocationOption) {
  return [location.name, location.admin2, location.admin1]
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index)
    .join(", ");
}
