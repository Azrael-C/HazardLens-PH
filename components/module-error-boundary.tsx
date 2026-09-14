"use client";

import { Component, ReactNode } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

type Props = {
  children: ReactNode;
  title: string;
};

type State = {
  failed: boolean;
};

export class ModuleErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="grid min-h-56 place-items-center rounded-2xl border border-amber-400/25 bg-amber-400/8 p-6 text-center">
        <div>
          <TriangleAlert className="mx-auto size-7 text-amber-300" aria-hidden="true" />
          <p className="mt-3 font-semibold text-slate-100">{this.props.title} is temporarily unavailable</p>
          <p className="mt-1 text-sm text-slate-400">The rest of HazardLens remains usable.</p>
          <button
            type="button"
            onClick={() => this.setState({ failed: false })}
            className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-amber-300/25 px-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/10"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Reload module
          </button>
        </div>
      </div>
    );
  }
}
