import fallback from "@/data/fallback-hazards.json";

type Service = "events" | "flood" | "forecast" | "geocode" | "radar";

const cacheSeconds: Record<Service, number> = {
  events: 900,
  flood: 900,
  forecast: 600,
  geocode: 86400,
  radar: 300,
};

function validCoordinates(value: string | null, min: number, max: number) {
  if (!value) return false;
  const numbers = value.split(",").map(Number);
  return numbers.length <= 20 && numbers.every((number) => Number.isFinite(number) && number >= min && number <= max);
}

function upstreamUrl(service: Service, searchParams: URLSearchParams) {
  if (service === "radar") {
    return "https://api.rainviewer.com/public/weather-maps.json";
  }

  if (service === "events") {
    const url = new URL("https://eonet.gsfc.nasa.gov/api/v3/events/geojson");
    url.searchParams.set("category", "severeStorms,floods");
    url.searchParams.set("status", "open");
    url.searchParams.set("days", "45");
    url.searchParams.set("limit", "100");
    return url.toString();
  }

  if (service === "geocode") {
    const query = searchParams.get("q")?.trim() ?? "";
    if (query.length < 2 || query.length > 80) throw new Error("Invalid search query");
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", query);
    url.searchParams.set("count", "8");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");
    url.searchParams.set("countryCode", "PH");
    return url.toString();
  }

  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");
  if (!validCoordinates(latitude, -90, 90) || !validCoordinates(longitude, -180, 180)) {
    throw new Error("Invalid coordinates");
  }

  if (service === "forecast") {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", latitude!);
    url.searchParams.set("longitude", longitude!);
    if (searchParams.get("mode") === "snapshot") {
      url.searchParams.set("current", "precipitation");
      url.searchParams.set("hourly", "precipitation");
      url.searchParams.set("forecast_hours", "24");
    } else {
      url.searchParams.set("current", "precipitation,rain,showers,weather_code");
      url.searchParams.set("hourly", "precipitation_probability,precipitation,rain,showers");
      url.searchParams.set("past_days", "1");
      url.searchParams.set("forecast_days", "7");
    }
    url.searchParams.set("timezone", "Asia/Manila");
    return url.toString();
  }

  const url = new URL("https://flood-api.open-meteo.com/v1/flood");
  url.searchParams.set("latitude", latitude!);
  url.searchParams.set("longitude", longitude!);
  if (searchParams.get("mode") === "snapshot") {
    url.searchParams.set("daily", "river_discharge");
    url.searchParams.set("past_days", "1");
    url.searchParams.set("forecast_days", "2");
  } else {
    url.searchParams.set("daily", "river_discharge,river_discharge_mean,river_discharge_median,river_discharge_max,river_discharge_p25,river_discharge_p75");
    url.searchParams.set("past_days", "7");
    url.searchParams.set("forecast_days", "7");
  }
  url.searchParams.set("timezone", "Asia/Manila");
  return url.toString();
}

function manilaHour(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date).replace(" ", "T");
}

function manilaDay(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function demoForecast() {
  const start = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const time = Array.from({ length: 192 }, (_, index) => manilaHour(new Date(start.getTime() + index * 60 * 60 * 1000)));
  const precipitation = time.map((_, index) => fallback.rainfallMm[index % fallback.rainfallMm.length]);
  const probability = time.map((_, index) => fallback.rainProbability[index % fallback.rainProbability.length]);
  return {
    current: { time: manilaHour(new Date()), precipitation: precipitation[24], rain: precipitation[24], showers: 0, weather_code: 61 },
    hourly: { time, precipitation, precipitation_probability: probability, rain: precipitation, showers: precipitation.map(() => 0) },
    hourly_units: { precipitation: "mm", precipitation_probability: "%" },
  };
}

function demoFlood(latitude: number, longitude: number) {
  const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const time = Array.from({ length: 15 }, (_, index) => manilaDay(new Date(start.getTime() + index * 24 * 60 * 60 * 1000)));
  const scale = 0.82 + (Math.abs(latitude + longitude) % 25) / 100;
  const river = fallback.riverDischarge.map((value) => Number((value * scale).toFixed(2)));
  return {
    latitude,
    longitude,
    daily: {
      time,
      river_discharge: river,
      river_discharge_mean: river.map((value) => Number((value * 0.94).toFixed(2))),
      river_discharge_median: river.map((value) => Number((value * 0.91).toFixed(2))),
      river_discharge_max: river.map((value) => Number((value * 1.24).toFixed(2))),
      river_discharge_p25: river.map((value) => Number((value * 0.78).toFixed(2))),
      river_discharge_p75: river.map((value) => Number((value * 1.12).toFixed(2))),
    },
    daily_units: { river_discharge: "m³/s" },
  };
}

function withStatus(payload: unknown, source: "provider" | "demo", message?: string) {
  if (!payload || Array.isArray(payload) || typeof payload !== "object") return payload;
  return {
    ...payload,
    hazardlens: {
      source,
      servedAt: new Date().toISOString(),
      message,
    },
  };
}

function demoPayload(service: Service, searchParams: URLSearchParams) {
  if (service === "forecast" && searchParams.get("mode") !== "snapshot") return demoForecast();
  if (service === "flood" && searchParams.get("mode") !== "snapshot") {
    return demoFlood(Number(searchParams.get("latitude")), Number(searchParams.get("longitude")));
  }
  if (service === "geocode") return { results: [] };
  if (service === "events") return { features: [] };
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get("service") as Service | null;
  if (!service || !(service in cacheSeconds)) {
    return Response.json({ error: "Unsupported service" }, { status: 400 });
  }

  try {
    const response = await fetch(upstreamUrl(service, searchParams), {
      headers: { Accept: "application/json" },
      next: { revalidate: cacheSeconds[service] },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error(`Upstream status ${response.status}`);
    const payload = await response.json();

    if (service === "flood" && searchParams.get("mode") !== "snapshot") {
      const values = payload?.daily?.river_discharge;
      if (!Array.isArray(values) || !values.some((value) => typeof value === "number")) {
        throw new Error("River data not available for these coordinates");
      }
    }

    return Response.json(withStatus(payload, "provider"), {
      headers: { "Cache-Control": `public, s-maxage=${cacheSeconds[service]}, stale-while-revalidate=3600` },
    });
  } catch {
    const fallbackPayload = demoPayload(service, searchParams);
    if (fallbackPayload) {
      return Response.json(withStatus(fallbackPayload, "demo", "Live provider data is delayed. Showing labeled demonstration data."), {
        headers: { "Cache-Control": "no-store" },
      });
    }
    return Response.json({ error: "Data is temporarily delayed" }, { status: 503 });
  }
}
