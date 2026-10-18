import type { Metadata } from "next";
import { Suspense } from "react";
import { constructMetadata } from "@/lib/seo";
import { VerifyForm } from "@/components/auth/verify-form";

export const metadata: Metadata = constructMetadata({
  title: "Vérifier mon email",
  pathname: "/verifier-email",
  noIndex: true,
});

export default function VerifierEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}