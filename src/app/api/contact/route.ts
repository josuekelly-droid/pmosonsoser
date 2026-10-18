import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/email";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  subject: z.string().min(3, "Sujet requis"),
  message: z.string().min(10, "Message trop court"),
  website: z.string().optional(), // Honeypot
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { success } = await rateLimiters.forgotPassword.limit(ip); // réutilise un limiteur
    if (!success) return NextResponse.json({ error: "Trop de tentatives." }, { status: 429 });

    const body = await req.json();
    if (body.website) return NextResponse.json({ ok: true }); // Honeypot

    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides." }, { status: 400 });

    // Envoie l'email à l'admin (process.env.EMAIL_USER)
    await sendContactEmail(parsed.data.name, parsed.data.email, parsed.data.subject, parsed.data.message);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[CONTACT]", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}