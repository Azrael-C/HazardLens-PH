import type { Metadata } from "next";
import { ComparisonLab } from "@/components/comparison-lab";
import { FloodWorkspace } from "@/components/flood-workspace";

export const metadata: Metadata = {
  title: "Flood Explorer",
};

export default function ExplorerPage() {
  return (
    <>
      <FloodWorkspace />
      <ComparisonLab />
    </>
  );
}
