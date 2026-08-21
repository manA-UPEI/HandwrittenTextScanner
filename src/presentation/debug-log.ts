/**
 * TEMPORARY diagnostic tool — not part of the app's real architecture.
 * A tiny pub/sub log so DebugPanel can show what's happening directly on
 * a phone screen, with no dev tools or remote inspector required. Delete
 * this file and its two call sites once the iOS capture issue is found.
 */
type Listener = (lines: string[]) => void;

let lines: string[] = [];
let listeners: Listener[] = [];

export const logDebug = (message: string): void => {
  const timestamp = new Date().toISOString().slice(11, 23);
  lines = [...lines, `${timestamp} ${message}`].slice(-80);
  listeners.forEach((listener) => listener(lines));
};

export const subscribeDebug = (listener: Listener): (() => void) => {
  listeners = [...listeners, listener];
  listener(lines);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};
