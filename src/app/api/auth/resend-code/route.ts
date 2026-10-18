import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateSixDigitCode, EXPIRY } from "@/lib/codes";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { success } = await rateLimiters.resendCode.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Trop de demandes. Réessayez dans une heure." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // On renvoie ok pour ne pas révéler l'existence du compte
      return NextResponse.json({ ok: true });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Cet email est déjà vérifié." },
        { status: 400 }
      );
    }

    // Invalider les anciens codes non utilisés
    await prisma.verificationCode.updateMany({
      where: {
        userId: user.id,
        type: "EMAIL_VERIFICATION",
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    // Créer un nouveau code
    const code = generateSixDigitCode();
    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        type: "EMAIL_VERIFICATION",
        expiresAt: new Date(Date.now() + EXPIRY.EMAIL_CODE),
      },
    });

    try {
      await sendVerificationEmail(email, user.name || "", code);
    } catch (err) {
      console.error("[resend-code] email failed", err);
    }

    return NextResponse.json({ ok: true, message: "Nouveau code envoyé." });
  } catch (error) {
    console.error("[/api/auth/resend-code]", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}