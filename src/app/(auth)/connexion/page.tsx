import type { Metadata } from "next";
import { Suspense } from "react";
import { constructMetadata } from "@/lib/seo";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = constructMetadata({
  title: "Connexion",
  description: "Connectez-vous à votre compte PM Osons Oser.",
  pathname: "/connexion",
});

export default function ConnexionPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}