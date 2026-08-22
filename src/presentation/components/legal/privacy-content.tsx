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
      "The photo you capture or upload — held only long enough to process your transcription request.",
      "The resulting transcribed text — held only long enough to show it back to you.",
      "A technical identifier derived from your network address, used briefly to prevent abuse (rate limiting). It isn't linked to any account, since none exists.",
    ],
    paragraphs: [
      "We do not collect your name, email, or any account information — there is no account system.",
    ],
  },
  {
    heading: "3. What We Don't Do",
    list: [
      "We do not store your photos or transcriptions on our servers.",
      "We do not use tracking or advertising cookies.",
      "We do not sell or share your data with anyone besides the AI provider described below, which is required to provide the transcription feature itself.",
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
      "We retain nothing after your session ends — there is no database. Your photo and transcribed text exist only in your browser's memory and, briefly, in the request sent to Google's API. The finished PDF is generated in your browser and is never uploaded anywhere.",
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
      "Because we don't store any data, there's generally nothing on our end to delete, correct, or export on your behalf. For anything Google retains as described in Section 4, your rights are governed by Google's own policies and applicable law (e.g. GDPR, CCPA) — contact Google directly for requests relating to their processing.",
    ],
  },
  {
    heading: "9. Security",
    paragraphs: [
      "Data in transit is encrypted (HTTPS). Because we don't store data at rest, there's no database on our end that could be breached.",
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
