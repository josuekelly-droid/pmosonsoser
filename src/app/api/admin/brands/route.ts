import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const brandSchema = z.object({
  name: z.string().min(2, "Nom requis").max(60),
  logo: z.string().url("URL invalide").optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json({ brands });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = brandSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const name = parsed.data.name.trim();

    // Vérifier si la marque existe déjà
    const existing = await prisma.brand.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Cette marque existe déjà." }, { status: 409 });
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        logo: parsed.data.logo || null,
      },
    });

    revalidatePath("/admin/marques");
    revalidatePath("/admin/produits");

    return NextResponse.json({ ok: true, brand }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/brands]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}