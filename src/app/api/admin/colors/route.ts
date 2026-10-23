import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { colorSchema } from "@/lib/validations/color";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const colors = await prisma.color.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json({ colors });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = colorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.color.findUnique({
      where: { name: parsed.data.name.trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "Cette couleur existe déjà." }, { status: 409 });
    }

    const color = await prisma.color.create({
      data: {
        name: parsed.data.name.trim(),
        hex: parsed.data.hex.toUpperCase(),
      },
    });

    revalidatePath("/admin/couleurs");
    revalidatePath("/admin/produits");

    return NextResponse.json({ ok: true, color }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/colors]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}