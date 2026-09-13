"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Radar } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/explorer", label: "Flood Explorer" },
  { href: "/earthquakes", label: "Earthquakes" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-[1000] border-b border-border/80 bg-[#07111f]/94 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-[1800px] items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex min-w-fit items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="HazardLens PH dashboard"
        >
          <span className="grid size-10 place-items-center rounded-xl border border-sky-400/25 bg-sky-400/10 text-sky-300">
            <Radar className="size-6" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-semibold tracking-tight text-slate-50">
              HazardLens PH
            </span>
            <span className="hidden text-xs text-slate-400 sm:block">
              Philippine hazard intelligence
            </span>
          </span>
        </Link>

        <nav
          className="ml-auto flex min-w-0 items-center gap-1 overflow-x-auto sm:ml-8 sm:justify-center"
          aria-label="Primary navigation"
        >
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-sky-400/10 text-sky-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                )}
              >
                {link.label}
                {active && (
                  <span
                    className="absolute inset-x-3 -bottom-[0.55rem] h-0.5 rounded-full bg-sky-400"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1.5 text-xs font-medium text-emerald-300 lg:flex">
          <Activity className="size-3.5" aria-hidden="true" />
          Public APIs
        </div>
      </div>
    </header>
  );
}
