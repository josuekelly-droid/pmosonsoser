import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations/review";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Anti-spam honeypot
    if (parsed.data.honeypot) {
      return NextResponse.json({ ok: true }); // feint
    }

    const review = await prisma.review.create({
      data: {
        name: parsed.data.name.trim(),
        role: parsed.data.role?.trim() || null,
        city: parsed.data.city?.trim() || null,
        rating: parsed.data.rating,
        text: parsed.data.text.trim(),
        isApproved: true, // auto-approbation, modération admin possible
      },
    });

    return NextResponse.json({ ok: true, id: review.id }, { status: 201 });
  } catch (error) {
    console.error("[/api/reviews POST]", error);
    return NextResponse.json(
      { error: "Erreur serveur, réessayez plus tard" },
      { status: 500 }
    );
  }
}