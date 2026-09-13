"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, MapPin, Search } from "lucide-react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  LocationOption,
  locationLabel,
  searchPhilippineLocations,
} from "@/lib/hazardlens";

type LocationSearchProps = {
  value: LocationOption | null;
  onSelect: (location: LocationOption) => void;
  compact?: boolean;
};

export function LocationSearch({
  value,
  onSelect,
  compact = false,
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2 || normalized === value?.name) {
      return;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const locations = await searchPhilippineLocations(normalized);
        if (!active) return;
        setResults(locations);
      } catch {
        if (!active) return;
        setResults([]);
        setError("Unable to search locations. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    }, 450);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, value?.name]);

  return (
    <div className="relative w-full">
      <Combobox
        items={results}
        value={value}
        itemToStringLabel={(location: LocationOption | null) =>
          location ? locationLabel(location) : ""
        }
        isItemEqualToValue={(left: LocationOption, right: LocationOption | null) =>
          left?.id === right?.id
        }
        onInputValueChange={(inputValue) => {
          setQuery(inputValue);
          const normalized = inputValue.trim();
          if (normalized.length < 2 || normalized === value?.name) {
            setResults([]);
            setLoading(false);
            setError(null);
          }
        }}
        onValueChange={(location) => {
          if (location) onSelect(location as LocationOption);
        }}
      >
        <ComboboxInput
          aria-label="Search a Philippine city or municipality"
          placeholder="Search a Philippine city or municipality"
          className={
            compact
              ? "location-combobox h-10 w-full border-border/80 bg-[#0a1928]"
              : "location-combobox h-12 w-full border-sky-300/25 bg-[#0a1928] shadow-[0_0_30px_rgba(56,189,248,0.08)]"
          }
          showClear
          showTrigger={false}
        >
          <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">
            {loading ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="size-4" aria-hidden="true" />
            )}
          </span>
        </ComboboxInput>
        <ComboboxContent className="border border-border bg-[#102338]">
          <ComboboxEmpty>
            {error ??
              (query.trim().length < 2
                ? "Type at least two letters."
                : loading
                  ? "Searching…"
                  : "Location not found.")}
          </ComboboxEmpty>
          <ComboboxList>
            {results.map((location, index) => (
              <ComboboxItem
                key={location.id}
                value={location}
                index={index}
                className="min-h-11 rounded-lg px-3 text-slate-100 data-highlighted:bg-sky-400/12"
              >
                <MapPin className="size-4 text-sky-300" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {location.name}
                  </span>
                  <span className="block truncate text-xs text-slate-400">
                    {[location.admin2, location.admin1]
                      .filter(Boolean)
                      .join(", ") || "Philippines"}
                  </span>
                </span>
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
