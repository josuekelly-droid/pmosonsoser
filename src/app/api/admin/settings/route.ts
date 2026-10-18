import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validations/admin";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let settings = await prisma.settings.findUnique({ where: { id: "global" } });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: "global" } });
  }
  return NextResponse.json({ ok: true, settings });
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const settings = await prisma.settings.upsert({
      where: { id: "global" },
      create: {
        id: "global",
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        facebook: data.facebook || null,
        instagram: data.instagram || null,
        whatsapp: data.whatsapp || null,
        baseFee: data.baseFee,
        pricePerKm: data.pricePerKm,
        freeDeliveryThreshold: data.freeDeliveryThreshold,
        maxRadiusKm: data.maxRadiusKm,
        bankName: data.bankName || null,
        bankIban: data.bankIban || null,
        bankHolder: data.bankHolder || null,
        wuFirstName: data.wuFirstName || null,
        wuLastName: data.wuLastName || null,
        wuCity: data.wuCity || null,
        wuCountry: data.wuCountry || null,
      },
      update: {
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        facebook: data.facebook || null,
        instagram: data.instagram || null,
        whatsapp: data.whatsapp || null,
        baseFee: data.baseFee,
        pricePerKm: data.pricePerKm,
        freeDeliveryThreshold: data.freeDeliveryThreshold,
        maxRadiusKm: data.maxRadiusKm,
        bankName: data.bankName || null,
        bankIban: data.bankIban || null,
        bankHolder: data.bankHolder || null,
        wuFirstName: data.wuFirstName || null,
        wuLastName: data.wuLastName || null,
        wuCity: data.wuCity || null,
        wuCountry: data.wuCountry || null,
      },
    });

    revalidatePath("/admin/parametres");
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    console.error("[PATCH /api/admin/settings]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}