"use client";

import { useSyncExternalStore } from "react";

/** Bumped whenever the disclaimer's terms materially change, so returning
 *  users are asked to re-confirm rather than being grandfathered in. */
export const CONSENT_STORAGE_KEY = "handwriting-scanner:consent-accepted-v1";

/** localStorage's own "storage" event only fires in *other* tabs — this
 *  is dispatched locally so accept() updates this tab's snapshot too. */
const CONSENT_CHANGED_EVENT = "handwriting-scanner:consent-changed";

export type ConsentStatus = "checking" | "needed" | "accepted";

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CONSENT_CHANGED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CONSENT_CHANGED_EVENT, onStoreChange);
  };
};

const getSnapshot = (): ConsentStatus =>
  window.localStorage.getItem(CONSENT_STORAGE_KEY) === "true" ? "accepted" : "needed";

/** Server has no localStorage — "checking" renders nothing until the
 *  client snapshot resolves, which is what avoids a hydration mismatch. */
const getServerSnapshot = (): ConsentStatus => "checking";

/**
 * Tracks whether the user has confirmed the first-run disclaimer. There's
 * no account or backend to store this against, so localStorage is the
 * only durable place it can live.
 */
export const useConsentGate = () => {
  const status = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const accept = () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "true");
    window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
  };

  return { status, accept };
};
