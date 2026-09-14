"use client";

import { useEffect, useRef, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import {
  LocationOption,
  NASA_PRECIPITATION_TILES,
  NationalSnapshot,
  RadarFrame,
  SAVED_LOCATIONS,
  TrackedEvent,
  formatMetric,
} from "@/lib/hazardlens";

type FloodMapProps = {
  location: LocationOption;
  riskLevel: string;
  showRadar: boolean;
  showRiver: boolean;
  showMarkers: boolean;
  showNationalSnapshot: boolean;
  showTrackedEvents: boolean;
  showSatelliteRain: boolean;
  nationalSnapshot: NationalSnapshot[];
  trackedEvents: TrackedEvent[];
  radarHost: string | null;
  radarFrame: RadarFrame | null;
  radarOpacity: number;
  onMapClick: (location: LocationOption) => void;
};

function ViewController({
  location,
  nationalViewVersion,
}: {
  location: LocationOption;
  nationalViewVersion: number;
}) {
  const map = useMap();
  const firstLocation = useRef(true);

  useEffect(() => {
    if (firstLocation.current) {
      firstLocation.current = false;
      return;
    }
    map.flyTo([location.latitude, location.longitude], 8, {
      duration: 1.1,
    });
  }, [location, map]);

  useEffect(() => {
    if (!nationalViewVersion) return;
    map.fitBounds(
      [
        [4.5, 116.2],
        [21.2, 126.8],
      ],
      { padding: [24, 24], animate: true },
    );
  }, [map, nationalViewVersion]);

  return null;
}

function MapClick({
  onMapClick,
}: {
  onMapClick: (location: LocationOption) => void;
}) {
  useMapEvents({
    click(event) {
      onMapClick({
        id: `${event.latlng.lat.toFixed(4)}-${event.latlng.lng.toFixed(4)}`,
        name: "Selected map point",
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
        admin1: "Philippines",
      });
    },
  });

  return null;
}

function riskColor(level: string) {
  if (level === "Data unavailable") return "#94a3b8";
  if (level === "High") return "#f87171";
  if (level === "Elevated") return "#fbbf24";
  if (level === "Guarded") return "#fb923c";
  return "#2dd4bf";
}

export default function FloodMap({
  location,
  riskLevel,
  showRadar,
  showRiver,
  showMarkers,
  showNationalSnapshot,
  showTrackedEvents,
  showSatelliteRain,
  nationalSnapshot,
  trackedEvents,
  radarHost,
  radarFrame,
  radarOpacity,
  onMapClick,
}: FloodMapProps) {
  const selectedColor = riskColor(riskLevel);
  const [nationalViewVersion, setNationalViewVersion] = useState(0);

  return (
    <div className="relative h-full min-h-[430px] w-full overflow-hidden rounded-2xl">
      <MapContainer
        center={[location.latitude, location.longitude]}
        zoom={8}
        minZoom={5}
        maxZoom={15}
        maxBounds={[
          [3, 113],
          [23, 130],
        ]}
        className="z-0"
        scrollWheelZoom
      >
        <TileLayer
          className="map-tiles"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showSatelliteRain && (
          <TileLayer
            attribution='Imagery: <a href="https://www.earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs">NASA GIBS</a>'
            url={NASA_PRECIPITATION_TILES}
            opacity={0.56}
            maxNativeZoom={6}
          />
        )}

        {showRadar && radarHost && radarFrame && (
          <TileLayer
            key={radarFrame.path}
            attribution='<a href="https://www.rainviewer.com/">RainViewer</a>'
            url={`${radarHost}${radarFrame.path}/256/{z}/{x}/{y}/2/1_0.png`}
            opacity={radarOpacity}
            maxNativeZoom={7}
          />
        )}

        {showMarkers &&
          SAVED_LOCATIONS.map((saved) => (
            <CircleMarker
              key={saved.id}
              center={[saved.latitude, saved.longitude]}
              radius={5}
              pathOptions={{
                color: "#7dd3fc",
                fillColor: "#38bdf8",
                fillOpacity: 0.7,
                weight: 2,
              }}
            >
              <Popup>
                <strong>{saved.name}</strong>
                <br />
                Saved location
              </Popup>
            </CircleMarker>
          ))}

        {showNationalSnapshot &&
          nationalSnapshot.map((snapshot) => {
            const color = riskColor(snapshot.riskLevel);
            const radius = Math.min(
              14,
              6 + (snapshot.next24Rain === null ? 0 : snapshot.next24Rain / 12),
            );

            return (
              <CircleMarker
                key={snapshot.id}
                center={[snapshot.latitude, snapshot.longitude]}
                radius={radius}
                pathOptions={{
                  color: "#07111f",
                  fillColor: color,
                  fillOpacity: 0.88,
                  weight: 2,
                }}
                eventHandlers={{ click: () => onMapClick(snapshot) }}
              >
                <Popup>
                  <strong>{snapshot.name}</strong>
                  <br />
                  {snapshot.riskLevel} model-based potential
                  <br />
                  Next 24h rain: {formatMetric(snapshot.next24Rain, "mm")}
                  <br />
                  River discharge: {formatMetric(snapshot.currentDischarge, "m³/s")}
                  <br />
                  <span className="text-xs">Open-Meteo national sample</span>
                </Popup>
              </CircleMarker>
            );
          })}

        {showTrackedEvents &&
          trackedEvents.map((event) => (
            <CircleMarker
              key={event.id}
              center={[event.latitude, event.longitude]}
              radius={10}
              pathOptions={{
                color: "#f0abfc",
                fillColor: "#a855f7",
                fillOpacity: 0.42,
                weight: 3,
              }}
            >
              <Popup>
                <strong>{event.title}</strong>
                <br />
                {event.category} · NASA EONET
                {event.date && (
                  <>
                    <br />
                    {new Intl.DateTimeFormat("en-PH", {
                      dateStyle: "medium",
                      timeZone: "Asia/Manila",
                    }).format(new Date(event.date))}
                  </>
                )}
                {event.sourceUrl && (
                  <>
                    <br />
                    <a href={event.sourceUrl} target="_blank" rel="noreferrer">
                      Open source report
                    </a>
                  </>
                )}
              </Popup>
            </CircleMarker>
          ))}

        {showRiver && (
          <CircleMarker
            center={[location.latitude, location.longitude]}
            radius={23}
            pathOptions={{
              color: selectedColor,
              fillColor: selectedColor,
              fillOpacity: 0.12,
              weight: 2,
            }}
          />
        )}

        <CircleMarker
          center={[location.latitude, location.longitude]}
          radius={8}
          pathOptions={{
            color: "#07111f",
            fillColor: selectedColor,
            fillOpacity: 1,
            weight: 3,
          }}
        >
          <Popup>
            <strong>{location.name}</strong>
            <br />
            {riskLevel} model-based potential
          </Popup>
        </CircleMarker>

        <ViewController
          location={location}
          nationalViewVersion={nationalViewVersion}
        />
        <MapClick onMapClick={onMapClick} />
      </MapContainer>

      <button
        type="button"
        onClick={() => setNationalViewVersion((value) => value + 1)}
        className="absolute left-14 top-3 z-[500] rounded-lg border border-sky-300/25 bg-[#07111f]/92 px-3 py-2 text-xs font-semibold text-sky-100 shadow-lg backdrop-blur transition hover:bg-[#102338] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
      >
        National view
      </button>

      <div className="pointer-events-none absolute bottom-8 left-3 right-3 z-[500] max-w-md rounded-xl border border-border/80 bg-[#07111f]/94 p-3 shadow-xl backdrop-blur sm:right-auto">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
          Potential
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-300">
          {[
            ["#2dd4bf", "Low"],
            ["#fb923c", "Guarded"],
            ["#fbbf24", "Elevated"],
            ["#f87171", "High"],
            ["#d946ef", "NASA event"],
          ].map(([color, label]) => (
            <span key={label} className="flex items-center gap-1">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              {label}
            </span>
          ))}
        </div>
        {showRadar && (
          <div className="mt-3 border-t border-border/70 pt-2">
            <div className="flex items-center justify-between text-[0.68rem] text-slate-400">
              <span>Radar reflectivity</span>
              <span>dBZ</span>
            </div>
            <div
              className="mt-1 h-2 rounded-full"
              style={{
                background: "linear-gradient(90deg, #67e8f9, #22c55e, #facc15, #f97316, #ef4444, #a855f7)",
              }}
            />
            <div className="mt-1 flex justify-between text-[0.62rem] text-slate-500">
              <span>Light</span>
              <span>Moderate</span>
              <span>Intense</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
