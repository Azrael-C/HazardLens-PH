export type EarthquakeFeature = {
  id: string;
  type: "Feature";
  properties: {
    mag: number | null;
    place: string | null;
    time: number | null;
    updated: number | null;
    url: string | null;
    felt: number | null;
    cdi: number | null;
    mmi: number | null;
    alert: string | null;
    status: string | null;
    tsunami: number | null;
    sig: number | null;
    magType: string | null;
    type: string | null;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number, number];
  };
};

export type EarthquakeResponse = {
  type: "FeatureCollection";
  metadata: {
    generated: number;
    title: string;
    count: number;
    status: number;
  };
  features: EarthquakeFeature[];
};

export type DepthFilter = "all" | "shallow" | "intermediate" | "deep";

export const FIRST_EARTHQUAKE_YEAR = 1900;

export function markerRadius(magnitude: number | null) {
  if (magnitude === null) return 5;
  return Math.max(5, Math.min(26, (magnitude - 1) * 3.5));
}

export function depthGroup(depth: number) {
  if (depth < 70) return "Shallow";
  if (depth <= 300) return "Intermediate";
  return "Deep";
}

export function depthColor(depth: number) {
  if (depth < 70) return "#fbbf24";
  if (depth <= 300) return "#38bdf8";
  return "#a78bfa";
}

export function matchesDepth(depth: number, filter: DepthFilter) {
  if (filter === "shallow") return depth < 70;
  if (filter === "intermediate") return depth >= 70 && depth <= 300;
  if (filter === "deep") return depth > 300;
  return true;
}

export function formatEarthquakeTime(time: number | null) {
  if (time === null) return "Data unavailable";
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(time));
}

export async function getEarthquakes(
  year: number,
  minMagnitude: number,
  signal?: AbortSignal,
) {
  const currentYear = new Date().getUTCFullYear();
  const start = `${year}-01-01T00:00:00Z`;
  const end =
    year === currentYear
      ? new Date().toISOString()
      : `${year + 1}-01-01T00:00:00Z`;
  const url = new URL("https://earthquake.usgs.gov/fdsnws/event/1/query");

  url.searchParams.set("format", "geojson");
  url.searchParams.set("starttime", start);
  url.searchParams.set("endtime", end);
  url.searchParams.set("minlatitude", "3");
  url.searchParams.set("maxlatitude", "23");
  url.searchParams.set("minlongitude", "115");
  url.searchParams.set("maxlongitude", "130");
  url.searchParams.set("minmagnitude", String(minMagnitude));
  url.searchParams.set("eventtype", "earthquake");
  url.searchParams.set("orderby", "time");
  url.searchParams.set("limit", "5000");

  const response = await fetch(url.toString(), {
    cache: "no-store",
    headers: { Accept: "application/geo+json, application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`USGS request failed with status ${response.status}`);
  }

  return (await response.json()) as EarthquakeResponse;
}
