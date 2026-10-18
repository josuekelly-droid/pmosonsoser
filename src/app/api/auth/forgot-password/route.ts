import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { generateSecureToken, EXPIRY } from "@/lib/codes";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { success } = await rateLimiters.forgotPassword.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Trop de demandes. Réessayez dans une heure." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email } });

    // On renvoie toujours ok pour éviter l'énumération d'emails
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    // Invalider les anciens tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Créer un nouveau token
    const token = generateSecureToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + EXPIRY.PASSWORD_RESET),
      },
    });

    try {
      await sendPasswordResetEmail(email, user.name || "", token);
    } catch (err) {
      console.error("[forgot-password] email failed", err);
    }

    return NextResponse.json({
      ok: true,
      message: "Si l'email existe, un lien vous a été envoyé.",
    });
  } catch (error) {
    console.error("[/api/auth/forgot-password]", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}