import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { sendPasswordChangedEmail } from "@/lib/email";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { success } = await rateLimiters.resetPassword.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans une heure." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors.password?.[0] || "Données invalides" },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "Lien invalide ou expiré. Refaites une demande." },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashed },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    try {
      await sendPasswordChangedEmail(
        resetToken.user.email,
        resetToken.user.name || ""
      );
    } catch (err) {
      console.error("[reset-password] email failed", err);
    }

    return NextResponse.json({
      ok: true,
      message: "Mot de passe modifié. Vous pouvez vous connecter.",
    });
  } catch (error) {
    console.error("[/api/auth/reset-password]", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}