import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email("Email invalide"),
  website: z.string().optional(), // Honeypot anti-bot
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    // On utilise le rate limiter "register" pour éviter le spam
    const { success } = await rateLimiters.register.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Trop de tentatives." }, { status: 429 });
    }

    const body = await req.json();
    
    // Anti-bot Honeypot
    if (body.website) {
      return NextResponse.json({ ok: true }); 
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }

    const cleanEmail = parsed.data.email.toLowerCase().trim();

    // Vérifier si l'email est déjà inscrit
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      // On renvoie ok pour ne pas révéler si l'email existe ou non (sécurité)
      return NextResponse.json({ ok: true, message: "Déjà inscrit." });
    }

    await prisma.newsletterSubscriber.create({
      data: { email: cleanEmail },
    });

    return NextResponse.json({ ok: true, message: "Inscription réussie." });
  } catch (error) {
    console.error("[POST /api/newsletter]", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}