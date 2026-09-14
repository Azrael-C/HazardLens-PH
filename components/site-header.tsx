"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Activity, Menu, Radar, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/explorer", label: "Flood Explorer" },
  { href: "/earthquakes", label: "Earthquakes" },
  { href: "/methodology", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className="sticky top-0 z-[1000] border-b border-border bg-[#07111f]"
      onKeyDown={(event) => {
        if (event.key === "Escape") setMenuOpen(false);
      }}
    >
      <div className="relative mx-auto max-w-[1800px] px-4 sm:px-6">
        <div className="flex min-h-16 items-center gap-4">
          <Link
            href="/"
            className="flex min-w-fit items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="HazardLens PH dashboard"
            onClick={() => setMenuOpen(false)}
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
            className="ml-auto hidden items-center gap-1 rounded-xl border border-border bg-[#0c1c2d] p-1 md:flex"
            aria-label="Primary navigation"
          >
            {links.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-sky-400/10 text-sky-300"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1.5 text-xs font-medium text-emerald-300 lg:flex">
            <Activity className="size-3.5" aria-hidden="true" />
            Public APIs
          </div>

          <button
            type="button"
            className="ml-auto grid size-10 place-items-center rounded-xl border border-border bg-[#0c1c2d] text-slate-200 transition-colors hover:border-sky-400/40 hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {menuOpen && (
          <nav
            id="mobile-navigation"
            className="absolute inset-x-4 top-[calc(100%+0.65rem)] rounded-2xl border border-border bg-[#0c1c2d] p-2 shadow-2xl shadow-black/40 sm:inset-x-6 md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="grid gap-1">
              {links.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-xl px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "bg-sky-400/10 text-sky-300"
                        : "text-slate-300 hover:bg-white/5 hover:text-white",
                    )}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-2 border-t border-border px-4 pt-3 pb-2 text-xs font-medium text-emerald-300">
              <Activity className="size-3.5" aria-hidden="true" />
              Connected to public data APIs
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
