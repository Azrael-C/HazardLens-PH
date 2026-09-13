"use client";

import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Analysis } from "@/lib/hazardlens";

type DataChartsProps = {
  analysis: Analysis;
  timeWindow: "24h" | "3d" | "7d";
  locationName: string;
};

const riverConfig = {
  discharge: {
    label: "River discharge",
    color: "#2dd4bf",
  },
  maximum: {
    label: "Maximum estimate",
    color: "#38bdf8",
  },
  p75: {
    label: "75th percentile",
    color: "#1d4f6e",
  },
} satisfies ChartConfig;

const rainConfig = {
  precipitation: {
    label: "Precipitation",
    color: "#38bdf8",
  },
  probability: {
    label: "Rain probability",
    color: "#fbbf24",
  },
} satisfies ChartConfig;

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="grid h-[270px] place-items-center rounded-xl border border-dashed border-border bg-[#091827]/65 px-6 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}

export function DataCharts({
  analysis,
  timeWindow,
  locationName,
}: DataChartsProps) {
  const rainLimit = timeWindow === "24h" ? 4 : timeWindow === "3d" ? 12 : 28;
  const riverLimit = timeWindow === "24h" ? 3 : timeWindow === "3d" ? 5 : 8;
  const rainData = analysis.rainChart.slice(0, rainLimit);
  const riverData = analysis.riverChart.slice(-riverLimit);

  return (
    <section className="grid gap-4 xl:grid-cols-2" aria-label="Forecast charts">
      <article className="panel rounded-2xl p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              River Discharge Forecast
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Modeled river data near {locationName}
            </p>
          </div>
          <span className="rounded-full border border-teal-400/20 bg-teal-400/8 px-2.5 py-1 text-xs text-teal-300">
            m³/s
          </span>
        </div>

        {riverData.some((entry) => entry.discharge !== null) ? (
          <ChartContainer
            config={riverConfig}
            className="h-[270px] w-full aspect-auto"
          >
            <AreaChart data={riverData} margin={{ left: 0, right: 12, top: 12 }}>
              <defs>
                <linearGradient id="riverFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#26384d" strokeOpacity={0.7} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={42}
                tickFormatter={(value) => Number(value).toFixed(0)}
              />
              <ChartTooltip
                cursor={{ stroke: "#38bdf8", strokeOpacity: 0.35 }}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex w-full min-w-40 justify-between gap-4">
                        <span className="text-slate-400">
                          {riverConfig[String(name) as keyof typeof riverConfig]
                            ?.label ?? String(name)}
                        </span>
                        <span className="font-mono font-medium text-slate-100">
                          {Number(value).toFixed(1)} m³/s
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="discharge"
                stroke="#2dd4bf"
                strokeWidth={2.5}
                fill="url(#riverFill)"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="maximum"
                stroke="#38bdf8"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                connectNulls
              />
              <ReferenceLine x={riverData[0]?.date} stroke="#94a3b8" strokeDasharray="3 5" />
            </AreaChart>
          </ChartContainer>
        ) : (
          <EmptyChart message="River data unavailable for this location." />
        )}
      </article>

      <article className="panel rounded-2xl p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Rainfall Outlook
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Forecast precipitation sampled every six hours
            </p>
          </div>
          <span className="rounded-full border border-sky-400/20 bg-sky-400/8 px-2.5 py-1 text-xs text-sky-300">
            millimeters
          </span>
        </div>

        {rainData.some((entry) => entry.precipitation !== null) ? (
          <ChartContainer
            config={rainConfig}
            className="h-[270px] w-full aspect-auto"
          >
            <ComposedChart data={rainData} margin={{ left: 0, right: 12, top: 12 }}>
              <CartesianGrid vertical={false} stroke="#26384d" strokeOpacity={0.7} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                yAxisId="rain"
                tickLine={false}
                axisLine={false}
                width={36}
                tickFormatter={(value) => Number(value).toFixed(0)}
              />
              <YAxis
                yAxisId="chance"
                orientation="right"
                domain={[0, 100]}
                hide
              />
              <ChartTooltip
                cursor={{ fill: "#38bdf8", fillOpacity: 0.06 }}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex w-full min-w-40 justify-between gap-4">
                        <span className="text-slate-400">
                          {rainConfig[String(name) as keyof typeof rainConfig]
                            ?.label ?? String(name)}
                        </span>
                        <span className="font-mono font-medium text-slate-100">
                          {Number(value).toFixed(1)}
                          {name === "probability" ? "%" : " mm"}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Bar
                yAxisId="rain"
                dataKey="precipitation"
                fill="#38bdf8"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
              <Line
                yAxisId="chance"
                type="monotone"
                dataKey="probability"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </ComposedChart>
          </ChartContainer>
        ) : (
          <EmptyChart message="Rainfall data is temporarily unavailable." />
        )}
      </article>
    </section>
  );
}
