"use client";

import { useEffect, useState } from "react";
import { logDebug, subscribeDebug } from "@/presentation/debug-log";

/**
 * TEMPORARY diagnostic overlay — shows the debug log directly on screen
 * so it's readable on a phone with no dev tools attached. Also catches
 * anything our own code doesn't: uncaught exceptions and unhandled
 * promise rejections, which would otherwise fail completely silently on
 * mobile Safari. Remove this component (and its one usage in
 * scanner-screen.tsx) once the iOS capture issue is resolved.
 */
export const DebugPanel = () => {
  const [lines, setLines] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeDebug(setLines);

    const onError = (event: ErrorEvent) => logDebug(`window error: ${event.message}`);
    const onRejection = (event: PromiseRejectionEvent) =>
      logDebug(`unhandled rejection: ${String(event.reason)}`);

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    logDebug("debug panel mounted");

    return () => {
      unsubscribe();
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  // Fixed to a top corner and collapsed by default so it never sits over
  // the step buttons — tap to expand, and it grows downward from there
  // rather than covering anything below it.
  return (
    <div className="fixed top-2 right-2 z-50">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="rounded-full bg-black/80 px-3 py-1 font-mono text-[10px] text-lime-300"
      >
        DEBUG ({lines.length}) {expanded ? "▲" : "▼"}
      </button>
      {expanded && (
        <div className="mt-1 max-h-64 w-72 max-w-[80vw] overflow-y-auto rounded-lg bg-black/90 p-2 font-mono text-[10px] leading-tight text-lime-300">
          {lines.length === 0 && <p>waiting for events…</p>}
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
};
