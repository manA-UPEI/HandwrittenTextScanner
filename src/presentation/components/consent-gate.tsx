"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/presentation/components/ui/button";
import { PRIVACY_POINTS } from "@/presentation/components/privacy-notice";

interface ConsentGateProps {
  onAccept: () => void;
}

/**
 * A one-time, blocking disclaimer shown before first use — see
 * useConsentGate for how "first use" is tracked. Covers the same privacy
 * points as PrivacyNotice, plus what PrivacyNotice doesn't: a warning
 * against scanning sensitive documents and a no-liability disclaimer.
 * Requires an explicit checkbox, not just a dismiss button, since this is
 * meant to be a real acknowledgment rather than a banner someone reflexively
 * clicks past.
 */
export const ConsentGate = ({ onAccept }: ConsentGateProps) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 text-sm text-slate-700">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Before you start</h2>

        <p className="mb-2 font-medium text-slate-900">How your photo is handled</p>
        <ul className="mb-4 list-disc space-y-1 pl-5">
          {PRIVACY_POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
          <p className="font-medium">Don&apos;t scan sensitive documents</p>
          <p className="mt-1">
            Avoid IDs, passports, financial account details, medical records, or anyone
            else&apos;s personal information. Treat this like any other third-party AI
            tool — assume anything you scan could be seen by the service processing it.
          </p>
        </div>

        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-700">
          <p className="font-medium text-slate-900">No warranty</p>
          <p className="mt-1">
            This app is provided as-is, with no guarantees. Its creator and operator are
            not responsible for any loss, damage, or misuse resulting from data you submit
            here or from how a third-party AI provider handles it. Use it at your own risk.
          </p>
        </div>

        <label className="mb-4 flex items-start gap-2">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="mt-1"
          />
          <span>
            I have read this and agree to the{" "}
            <Link
              href="/terms"
              target="_blank"
              className="text-sky-700 underline hover:no-underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="text-sky-700 underline hover:no-underline"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        <Button onClick={onAccept} disabled={!agreed} className="w-full">
          Continue
        </Button>
      </div>
    </div>
  );
};
