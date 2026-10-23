import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "Nom requis").max(60),
  slug: z.string().min(2).max(60).optional(),
});

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const name = parsed.data.name.trim();
    const slug = parsed.data.slug?.trim() || slugify(name);

    // Vérifier si la catégorie existe déjà (nom ou slug)
    const existing = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Une catégorie avec ce nom ou ce slug existe déjà." },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: { name, slug },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/produits");

    return NextResponse.json({ ok: true, category }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/categories]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}