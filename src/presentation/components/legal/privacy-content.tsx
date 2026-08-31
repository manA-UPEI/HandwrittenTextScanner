import { LegalSection } from "@/presentation/components/legal/legal-section";

const SECTIONS = [
  {
    heading: "1. Overview",
    paragraphs: [
      "This policy explains, in plain language, what data Handwriting Scanner touches, where it goes, and what we do (and deliberately don't do) with it.",
    ],
  },
  {
    heading: "2. What We Collect",
    list: [
      "Your Google account's email address and account id, used to sign you in and to identify which saved scans belong to you.",
      "The photo you capture or upload — held only long enough to process your transcription request, then discarded. It is never written to our servers.",
      "The resulting transcribed text — shown back to you, and additionally stored on our server, tied to your account, only for scans you explicitly choose to save.",
      "A technical identifier derived from your network address, used briefly to prevent abuse (rate limiting).",
    ],
    paragraphs: [
      "We do not collect any personal information beyond what your Google account provides for sign-in.",
    ],
  },
  {
    heading: "3. What We Don't Do",
    list: [
      "We do not store your photos on our servers, ever — only the transcribed text of scans you explicitly save.",
      "We do not use tracking or advertising cookies.",
      "We do not sell or share your data with anyone besides the providers required to operate the Service: Google (for sign-in and transcription, described below) and our hosting/database providers.",
    ],
  },
  {
    heading: "4. Third-Party Processing: Google Gemini",
    paragraphs: [
      "To transcribe your handwriting, your photo is sent to Google's Gemini API — the only third party your data is sent to. Google's own terms govern what they do with it. As of this writing:",
    ],
    list: [
      "On Google's free tier, Google may use submitted content to improve their products.",
      "On a paid tier (active billing), Google states it does not use submitted content to train its models.",
    ],
  },
  {
    heading: "5. Photo Metadata",
    paragraphs: [
      "Before your photo is sent anywhere, it's re-encoded in your browser — a step that strips embedded metadata such as GPS location.",
    ],
  },
  {
    heading: "6. Data Retention",
    paragraphs: [
      "Your photo exists only in your browser's memory and, briefly, in the request sent to Google's API — it is never written to our servers. Transcribed text is likewise ephemeral unless you explicitly save a scan, in which case it's stored on our server, tied to your account, until you delete it from \"My Scans\" or delete your account. The finished PDF is generated in your browser and is never uploaded anywhere.",
    ],
  },
  {
    heading: "7. Children's Privacy",
    paragraphs: [
      "The Service is not directed at children and isn't intended for use by anyone under 18. We do not knowingly collect data from children.",
    ],
  },
  {
    heading: "8. Your Rights",
    paragraphs: [
      "You can delete any saved scan yourself, at any time, from \"My Scans\" — this removes it from our server immediately and permanently. To request deletion of your account data entirely, or for anything Google retains as described in Section 4, contact us at [your contact email], or Google directly for requests relating to their own processing.",
    ],
  },
  {
    heading: "9. Security",
    paragraphs: [
      "Data in transit is encrypted (HTTPS). Saved scans are stored under your account id, scoped so one account can never read or delete another's saved scans.",
    ],
  },
  {
    heading: "10. Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. Continuing to use the Service after a change means you accept the update.",
    ],
  },
  {
    heading: "11. Contact",
    paragraphs: ["Questions about this Privacy Policy: [your contact email]"],
  },
];

export const PrivacyContent = () => (
  <>
    <h1 className="mb-1 text-2xl font-semibold text-slate-900">Privacy Policy</h1>
    <p className="mb-6 text-sm text-slate-500">
      Explains what happens to your data when you use Handwriting Scanner.
    </p>
    {SECTIONS.map((section) => (
      <LegalSection key={section.heading} {...section} />
    ))}
  </>
);
