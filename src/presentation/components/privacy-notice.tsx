/** Shared with ConsentGate so the two never drift apart on wording. */
export const PRIVACY_POINTS = [
  "Your photo is sent to Google's Gemini AI so it can read the handwriting. On this app's current setup, Google may also use it to improve their own AI models.",
  "Nothing is saved on our end: no accounts, no database, no copy of your photo or text kept anywhere.",
  "Location and other hidden photo data are stripped out automatically before anything is sent.",
  "The finished PDF is created on your device and stays there — it's never uploaded.",
];

/** A plain-language explanation of how a photo is handled, shown before capture. */
export const PrivacyNotice = () => (
  <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
    <p className="mb-2 font-medium">How your photo is handled</p>
    <ul className="list-disc space-y-1 pl-5">
      {PRIVACY_POINTS.map((point) => (
        <li key={point}>{point}</li>
      ))}
    </ul>
  </div>
);
