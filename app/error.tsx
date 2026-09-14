"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-2xl place-items-center px-4 py-12 text-center">
      <div className="panel w-full rounded-3xl p-8">
        <TriangleAlert className="mx-auto size-9 text-amber-300" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-semibold text-slate-50">This view could not finish loading</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Your other HazardLens pages are still available. Try loading this view again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-sky-400/25 bg-sky-400/10 px-4 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/15"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </button>
      </div>
    </main>
  );
}
