import { LegalSection } from "@/presentation/components/legal/legal-section";

const SECTIONS = [
  {
    heading: "1. Acceptance of Terms",
    paragraphs: [
      'By accessing or using the Service, you agree to be bound by these Terms. If you don’t agree, don’t use the Service.',
    ],
  },
  {
    heading: "2. What This Service Does",
    paragraphs: [
      "Handwriting Scanner lets you photograph or upload a handwritten page, crop it in your own browser, and have it transcribed into editable text using Google's Gemini AI. You can then edit the result and export it as a PDF. Every step happens in your browser except the transcription itself, which is processed by Google's Gemini API.",
    ],
  },
  {
    heading: "3. Who Can Use This",
    paragraphs: [
      "You must be at least 18 years old to use the Service. By using it, you confirm that you meet this requirement.",
    ],
  },
  {
    heading: "4. Acceptable Use",
    paragraphs: ["You agree to use the Service only for lawful purposes. You agree not to scan:"],
    list: [
      "Government IDs, passports, or other identity documents",
      "Financial account numbers, card details, or banking information",
      "Medical or health records",
      "Any other person's personal information without their consent",
      "Anything illegal, infringing, or that you don't have the right to share",
    ],
  },
  {
    heading: "5. Third-Party AI Processing",
    paragraphs: [
      "Photos you submit are sent to Google's Gemini API for transcription. By using the Service, you acknowledge this and agree to be bound by Google's own terms governing that processing, currently at ai.google.dev/gemini-api/terms. We do not control Google's systems and are not responsible for their availability, accuracy, or performance.",
    ],
  },
  {
    heading: "6. Accounts and Saved Scans",
    paragraphs: [
      "Using the Service requires signing in with a Google account. Your photos are never stored on our servers. Transcribing a page doesn't store anything either — only if you explicitly save a scan is its transcribed text stored on our server, tied to your account, until you delete it or delete your account. See our Privacy Policy for full details.",
    ],
  },
  {
    heading: '7. "As Is" — No Warranty',
    paragraphs: [
      'The Service is provided "as is" and "as available," without warranties of any kind, express or implied — including accuracy of transcription, fitness for a particular purpose, or uninterrupted availability. Transcription is performed by AI and can contain errors. Always review the output before relying on it.',
    ],
  },
  {
    heading: "8. Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by law, the Operator is not liable for any indirect, incidental, special, or consequential damages, or any loss of data, arising from your use of the Service — including damages arising from the actions of third-party providers such as Google. Nothing here limits liability that cannot be limited under applicable law.",
    ],
  },
  {
    heading: "9. Your Content",
    paragraphs: [
      "You retain all rights to the photos and text you submit. You are solely responsible for ensuring you have the right to submit whatever content you scan.",
    ],
  },
  {
    heading: "10. Changes to the Service or These Terms",
    paragraphs: [
      "We may change, suspend, or discontinue the Service, or update these Terms, at any time. Continuing to use the Service after a change means you accept the update.",
    ],
  },
  {
    heading: "11. Governing Law",
    paragraphs: [
      "These Terms are governed by the laws of [your jurisdiction], without regard to conflict-of-law principles.",
    ],
  },
  {
    heading: "12. Contact",
    paragraphs: ["Questions about these Terms: [your contact email]"],
  },
];

export const TermsContent = () => (
  <>
    <h1 className="mb-1 text-2xl font-semibold text-slate-900">Terms of Service</h1>
    <p className="mb-6 text-sm text-slate-500">
      Governs your use of Handwriting Scanner (the &quot;Service&quot;), operated by [your name or
      business name] (&quot;we&quot;, &quot;us&quot;, the &quot;Operator&quot;).
    </p>
    {SECTIONS.map((section) => (
      <LegalSection key={section.heading} {...section} />
    ))}
  </>
);
