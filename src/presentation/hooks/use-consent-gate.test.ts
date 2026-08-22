import { afterEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { CONSENT_STORAGE_KEY, useConsentGate } from "@/presentation/hooks/use-consent-gate";

afterEach(() => {
  window.localStorage.clear();
});

describe("useConsentGate", () => {
  it("resolves to needed when no prior consent is stored", async () => {
    const { result } = renderHook(() => useConsentGate());

    await waitFor(() => expect(result.current.status).toBe("needed"));
  });

  it("resolves to accepted when consent was already stored", async () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "true");

    const { result } = renderHook(() => useConsentGate());

    await waitFor(() => expect(result.current.status).toBe("accepted"));
  });

  it("persists acceptance so a future check resolves to accepted", async () => {
    const { result } = renderHook(() => useConsentGate());
    await waitFor(() => expect(result.current.status).toBe("needed"));

    act(() => result.current.accept());

    expect(result.current.status).toBe("accepted");
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe("true");
  });
});
