import type { Metadata } from "next";
import { Suspense } from "react";
import { constructMetadata } from "@/lib/seo";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = constructMetadata({
  title: "Créer un compte",
  description: "Rejoignez PM Osons Oser : particuliers et professionnels.",
  pathname: "/inscription",
});

export default function InscriptionPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}