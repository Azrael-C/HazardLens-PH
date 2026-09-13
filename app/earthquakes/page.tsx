import type { Metadata } from "next";
import { EarthquakeWorkspace } from "@/components/earthquake-workspace";

export const metadata: Metadata = {
  title: "Earthquake Monitor",
  description: "Explore recorded earthquakes around the Philippines by year, magnitude, and depth.",
};

export default function EarthquakesPage() {
  return <EarthquakeWorkspace />;
}
