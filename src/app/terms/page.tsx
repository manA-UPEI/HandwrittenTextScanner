import type { Metadata } from "next";
import { LegalPageLayout } from "@/presentation/components/legal/legal-page-layout";
import { TermsContent } from "@/presentation/components/legal/terms-content";

export const metadata: Metadata = { title: "Terms of Service — Handwriting Scanner" };

export default function TermsPage() {
  return (
    <LegalPageLayout seeAlso={{ href: "/privacy", label: "Privacy Policy" }}>
      <TermsContent />
    </LegalPageLayout>
  );
}
