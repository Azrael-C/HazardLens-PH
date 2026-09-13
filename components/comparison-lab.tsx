"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, LoaderCircle, RefreshCw } from "lucide-react";
import { LocationSearch } from "@/components/location-search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Analysis,
  DEFAULT_LOCATION,
  LocationOption,
  buildAnalysis,
  formatMetric,
  getFloodForecast,
  getForecast,
} from "@/lib/hazardlens";

type ComparedData = {
  analysis: Analysis;
  hasForecast: boolean;
  hasFlood: boolean;
};

async function loadLocation(location: LocationOption): Promise<ComparedData> {
  const [forecast, flood] = await Promise.allSettled([
    getForecast(location),
    getFloodForecast(location),
  ]);
  const forecastValue = forecast.status === "fulfilled" ? forecast.value : null;
  const floodValue = flood.status === "fulfilled" ? flood.value : null;

  if (!forecastValue && !floodValue) {
    throw new Error("Neither forecast nor river data could be retrieved.");
  }

  return {
    analysis: buildAnalysis(forecastValue, floodValue),
    hasForecast: Boolean(forecastValue),
    hasFlood: Boolean(floodValue),
  };
}

function trendLabel(analysis: Analysis) {
  if (analysis.dischargeChange === null) return "Data unavailable";
  const value = analysis.dischargeChange;
  const state = value > 5 ? "Rising" : value < -5 ? "Decreasing" : "Stable";
  return `${state} (${value >= 0 ? "+" : ""}${value.toFixed(1)}%)`;
}

export function ComparisonLab() {
  const [left, setLeft] = useState<LocationOption>(DEFAULT_LOCATION);
  const [right, setRight] = useState<LocationOption | null>(null);
  const [leftData, setLeftData] = useState<ComparedData | null>(null);
  const [rightData, setRightData] = useState<ComparedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    const rightRequest = right ? loadLocation(right) : Promise.resolve(null);

    void Promise.allSettled([loadLocation(left), rightRequest]).then(
      ([leftResult, rightResult]) => {
        if (!active) return;
        setLeftData(leftResult.status === "fulfilled" ? leftResult.value : null);
        setRightData(
          rightResult.status === "fulfilled" ? rightResult.value : null,
        );

        const rightFailed = right !== null && rightResult.status === "rejected";

        if (leftResult.status === "rejected" || rightFailed) {
          setError(
            "Some comparison data could not be retrieved. Available values are shown.",
          );
        }
        setLoading(false);
      },
    );

    return () => {
      active = false;
    };
  }, [left, right, retry]);

  const rows = useMemo(
    () => [
      {
        label: "Flood potential",
        left: leftData?.analysis.riskLevel ?? "Data unavailable",
        right: right
          ? rightData?.analysis.riskLevel ?? "Data unavailable"
          : "—",
      },
      {
        label: "Next 24-hour rainfall",
        left: formatMetric(leftData?.analysis.next24Rain ?? null, "mm"),
        right: right
          ? formatMetric(rightData?.analysis.next24Rain ?? null, "mm")
          : "—",
      },
      {
        label: "Current river discharge",
        left: formatMetric(leftData?.analysis.currentDischarge ?? null, "m³/s"),
        right: right
          ? formatMetric(rightData?.analysis.currentDischarge ?? null, "m³/s")
          : "—",
      },
      {
        label: "River trend",
        left: leftData ? trendLabel(leftData.analysis) : "Data unavailable",
        right: right
          ? rightData
            ? trendLabel(rightData.analysis)
            : "Data unavailable"
          : "—",
      },
      {
        label: "Forecast uncertainty",
        left: leftData?.analysis.uncertaintyLabel ?? "Data unavailable",
        right: right
          ? rightData?.analysis.uncertaintyLabel ?? "Data unavailable"
          : "—",
      },
    ],
    [leftData, right, rightData],
  );

  function selectLeft(location: LocationOption) {
    setLoading(true);
    setError(null);
    setLeft(location);
  }

  function selectRight(location: LocationOption) {
    setLoading(true);
    setError(null);
    setRight(location);
  }

  function retryComparison() {
    setLoading(true);
    setError(null);
    setRetry((value) => value + 1);
  }

  return (
    <section className="mx-auto max-w-[1500px] px-3 pb-8 sm:px-5">
      <article className="panel rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
              Comparison laboratory
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">
              Compare two Philippine locations
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Compare the same rainfall and modeled river indicators side by side.
              Missing API values remain clearly marked as unavailable.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-sky-400/20 bg-sky-400/8 px-3 py-1.5 text-xs font-medium text-sky-200">
            <ArrowRightLeft className="size-3.5" aria-hidden="true" />
            Live comparison
          </span>
        </div>

        <div className="mt-6 grid items-center gap-3 lg:grid-cols-[1fr_auto_1fr]">
          <LocationSearch value={left} onSelect={selectLeft} compact />
          <ArrowRightLeft className="mx-auto hidden size-5 text-slate-500 lg:block" aria-hidden="true" />
          <LocationSearch value={right} onSelect={selectRight} compact />
        </div>

        {error && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-amber-400/25 bg-amber-400/8 px-4 py-3 text-sm text-amber-100">
            <span>{error}</span>
            <button
              type="button"
              onClick={retryComparison}
              className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-amber-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        <div className="mt-5 overflow-hidden rounded-xl border border-border/80">
          {loading ? (
            <div className="grid min-h-72 place-items-center bg-[#091827]/70">
              <div className="text-center text-sm text-slate-400">
                <LoaderCircle className="mx-auto mb-3 size-6 animate-spin text-sky-300" />
                Comparing live API values…
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#091827]">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[32%] text-slate-400">Metric</TableHead>
                  <TableHead className="text-sky-200">{left.name}</TableHead>
                  <TableHead className="text-teal-200">
                    {right?.name ?? "Select a location"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.label} className="border-border/70 hover:bg-white/[0.025]">
                    <TableCell className="font-medium text-slate-300">{row.label}</TableCell>
                    <TableCell className="font-mono text-sm text-slate-100">{row.left}</TableCell>
                    <TableCell className="font-mono text-sm text-slate-100">{row.right}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </article>
    </section>
  );
}
