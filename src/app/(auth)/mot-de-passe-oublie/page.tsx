import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = constructMetadata({
  title: "Mot de passe oublié",
  pathname: "/mot-de-passe-oublie",
});

export default function MotDePasseOubliePage() {
  return <ForgotForm />;
}