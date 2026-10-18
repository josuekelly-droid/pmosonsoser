import type { Metadata } from "next";
import { Suspense } from "react";
import { constructMetadata } from "@/lib/seo";
import { ResetForm } from "@/components/auth/reset-form";

export const metadata: Metadata = constructMetadata({
  title: "Nouveau mot de passe",
  pathname: "/nouveau-mot-de-passe",
  noIndex: true,
});

export default function NouveauMotDePassePage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}