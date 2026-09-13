"use client";

import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import {
  EarthquakeFeature,
  depthColor,
  depthGroup,
  formatEarthquakeTime,
  markerRadius,
} from "@/lib/earthquakes";

type EarthquakeMapProps = {
  earthquakes: EarthquakeFeature[];
  selectedId: string | null;
  onSelect: (earthquake: EarthquakeFeature) => void;
};

function MapView({ selected, resetVersion }: { selected: EarthquakeFeature | null; resetVersion: number }) {
  const map = useMap();

  useEffect(() => {
    if (!selected) return;
    const [longitude, latitude] = selected.geometry.coordinates;
    map.flyTo([latitude, longitude], Math.max(map.getZoom(), 7), { duration: 0.8 });
  }, [map, selected]);

  useEffect(() => {
    if (!resetVersion) return;
    map.fitBounds(
      [
        [3.2, 115.2],
        [22.8, 129.8],
      ],
      { animate: true, padding: [20, 20] },
    );
  }, [map, resetVersion]);

  return null;
}

export default function EarthquakeMap({ earthquakes, selectedId, onSelect }: EarthquakeMapProps) {
  const [resetVersion, setResetVersion] = useState(0);
  const selected = earthquakes.find((earthquake) => earthquake.id === selectedId) ?? null;

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-2xl sm:h-[620px]">
      <MapContainer
        center={[12.8797, 121.774]}
        zoom={5}
        minZoom={4}
        maxZoom={14}
        maxBounds={[
          [1, 112],
          [25, 133],
        ]}
        preferCanvas
        scrollWheelZoom
        className="z-0 h-full w-full"
      >
        <TileLayer
          className="map-tiles"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {earthquakes.map((earthquake) => {
          const [longitude, latitude, depth] = earthquake.geometry.coordinates;
          const magnitude = earthquake.properties.mag;
          const radius = markerRadius(magnitude);
          const color = depthColor(depth);
          const active = earthquake.id === selectedId;

          return (
            <CircleMarker
              key={earthquake.id}
              center={[latitude, longitude]}
              radius={active ? radius + 3 : radius}
              pathOptions={{
                color: active ? "#f8fafc" : "#07111f",
                fillColor: color,
                fillOpacity: active ? 0.95 : 0.72,
                opacity: 0.95,
                weight: active ? 3 : 1.5,
              }}
              eventHandlers={{ click: () => onSelect(earthquake) }}
            >
              <Tooltip sticky direction="top" opacity={0.98}>
                <div className="min-w-48 space-y-1 text-xs">
                  <p className="font-semibold text-slate-50">
                    M {magnitude?.toFixed(1) ?? "Data unavailable"}
                  </p>
                  <p>{earthquake.properties.place ?? "Location unavailable"}</p>
                  <p>Depth: {Number.isFinite(depth) ? `${depth.toFixed(1)} km` : "Data unavailable"}</p>
                  <p>Time: {formatEarthquakeTime(earthquake.properties.time)}</p>
                  <p>Display radius: {radius.toFixed(1)} px</p>
                </div>
              </Tooltip>

              <Popup>
                <div className="min-w-56 space-y-1.5">
                  <strong className="block text-sm">
                    M {magnitude?.toFixed(1) ?? "Data unavailable"} · {earthquake.properties.place ?? "Location unavailable"}
                  </strong>
                  <span className="block text-xs text-slate-300">{formatEarthquakeTime(earthquake.properties.time)}</span>
                  <span className="block text-xs text-slate-300">
                    {depthGroup(depth)} · {depth.toFixed(1)} km deep
                  </span>
                  <span className="block text-xs text-slate-300">
                    {latitude.toFixed(3)}, {longitude.toFixed(3)}
                  </span>
                  {earthquake.properties.url && (
                    <a
                      href={earthquake.properties.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block pt-1 text-xs font-semibold text-sky-300"
                    >
                      View USGS event
                    </a>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        <MapView selected={selected} resetVersion={resetVersion} />
      </MapContainer>

      <button
        type="button"
        onClick={() => setResetVersion((value) => value + 1)}
        className="absolute left-14 top-3 z-[500] rounded-lg border border-sky-300/25 bg-[#07111f]/92 px-3 py-2 text-xs font-semibold text-sky-100 shadow-lg backdrop-blur transition hover:bg-[#102338] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
      >
        National view
      </button>

      <div className="pointer-events-none absolute bottom-8 left-3 z-[500] max-w-[calc(100%-1.5rem)] rounded-xl border border-border/80 bg-[#07111f]/92 p-3 shadow-xl backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">Depth</p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-slate-300">
          {[
            ["#fbbf24", "Shallow <70 km"],
            ["#38bdf8", "Intermediate"],
            ["#a78bfa", "Deep >300 km"],
          ].map(([color, label]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-slate-400">Circle size represents magnitude, not an impact area.</p>
      </div>
    </div>
  );
}
