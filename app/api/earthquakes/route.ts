export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year"));
  const minMagnitude = Number(searchParams.get("minMagnitude"));
  const currentYear = new Date().getUTCFullYear();

  if (!Number.isInteger(year) || year < 1900 || year > currentYear || !Number.isFinite(minMagnitude) || minMagnitude < 0 || minMagnitude > 10) {
    return Response.json({ error: "Invalid earthquake filters" }, { status: 400 });
  }

  const start = `${year}-01-01T00:00:00Z`;
  const end = year === currentYear ? new Date().toISOString() : `${year + 1}-01-01T00:00:00Z`;
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

  const ttl = year === currentYear ? 600 : 86400;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/geo+json, application/json" },
      next: { revalidate: ttl },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`USGS status ${response.status}`);
    const payload = await response.json();
    return Response.json(
      {
        ...payload,
        hazardlens: { source: "provider", servedAt: new Date().toISOString() },
      },
      { headers: { "Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=86400` } },
    );
  } catch {
    return Response.json({ error: "Earthquake records are temporarily delayed" }, { status: 503 });
  }
}
