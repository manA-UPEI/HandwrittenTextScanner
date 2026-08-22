import type { Metadata } from "next";
import { LegalPageLayout } from "@/presentation/components/legal/legal-page-layout";
import { PrivacyContent } from "@/presentation/components/legal/privacy-content";

export const metadata: Metadata = { title: "Privacy Policy — Handwriting Scanner" };

export default function PrivacyPage() {
  return (
    <LegalPageLayout seeAlso={{ href: "/terms", label: "Terms of Service" }}>
      <PrivacyContent />
    </LegalPageLayout>
  );
}
