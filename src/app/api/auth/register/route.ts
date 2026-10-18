import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { generateSixDigitCode, EXPIRY } from "@/lib/codes";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    /* ---- Rate limit ---- */
    const ip = getClientIp(req);
    const { success } = await rateLimiters.register.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans une heure." },
        { status: 429 }
      );
    }

    /* ---- Validation ---- */
    const body = await req.json();
    
    // 🍯 SÉCURITÉ HONEYPOT : Si le champ invisible "website" est rempli, c'est un bot.
    // On simule un succès pour ne pas l'alerter, mais on ne fait RIEN en base.
    if (body.website && body.website.length > 0) {
      console.warn(`[SECURITY] Bot détecté sur l'inscription (IP: ${ip})`);
      return NextResponse.json(
        { ok: true, message: "Compte créé. Vérifiez votre email." },
        { status: 201 }
      );
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, phone, password, typeCompte } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    /* ---- Vérifier doublon ---- */
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé." },
        { status: 409 }
      );
    }

    /* ---- Hash password ---- */
    const hashed = await bcrypt.hash(password, 12);

    /* ---- Créer user + code en transaction ---- */
    const code = generateSixDigitCode();

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: cleanEmail,
          phone,
          password: hashed,
          typeCompte,
          role: "CLIENT",
          statutValidation: typeCompte === "B2B" ? "EN_ATTENTE" : "VALIDE",
        },
      });

      await tx.verificationCode.create({
        data: {
          userId: newUser.id,
          code,
          type: "EMAIL_VERIFICATION",
          expiresAt: new Date(Date.now() + EXPIRY.EMAIL_CODE),
        },
      });

      return newUser;
    });

    /* ---- Envoyer email (hors transaction) ---- */
    try {
      await sendVerificationEmail(cleanEmail, name, code);
    } catch (emailError) {
      console.error("[register] email failed", emailError);
    }

    return NextResponse.json(
      {
        ok: true,
        email: cleanEmail,
        message: "Compte créé. Vérifiez votre email pour le code.",
        needsVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[/api/auth/register]", error);
    return NextResponse.json(
      { error: "Erreur serveur. Réessayez dans un instant." },
      { status: 500 }
    );
  }
}