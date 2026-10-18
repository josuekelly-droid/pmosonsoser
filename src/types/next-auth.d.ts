import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CLIENT" | "ADMIN";
      typeCompte: "B2C" | "B2B" | "PREMIUM";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "CLIENT" | "ADMIN";
    typeCompte?: "B2C" | "B2B" | "PREMIUM";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "CLIENT" | "ADMIN";
    typeCompte?: "B2C" | "B2B" | "PREMIUM";
  }
}