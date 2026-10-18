import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCodeSchema } from "@/lib/validations/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { success } = await rateLimiters.verify.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans 15 minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = verifyCodeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors.code?.[0] || "Données invalides" },
        { status: 400 }
      );
    }

    const { email, code } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Cet email est déjà vérifié.", alreadyVerified: true },
        { status: 400 }
      );
    }

    /* ---- Chercher le code valide ---- */
    const verification = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code,
        type: "EMAIL_VERIFICATION",
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Code invalide ou expiré." },
        { status: 400 }
      );
    }

    /* ---- Valider email + marquer code utilisé ---- */
    await prisma.$transaction([
      prisma.verificationCode.update({
        where: { id: verification.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
    ]);

    /* ---- Email de bienvenue ---- */
    try {
      await sendWelcomeEmail(cleanEmail, user.name || "");
    } catch (err) {
      console.error("[verify-email] welcome email failed", err);
    }

    return NextResponse.json({ ok: true, message: "Compte vérifié avec succès." });
  } catch (error) {
    console.error("[/api/auth/verify-email]", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}