import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  if (!q) return NextResponse.json({ results: [] });

  const [products, orders, users] = await Promise.all([
    prisma.product.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 3,
      include: { brand: true },
    }),
    prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: q, mode: "insensitive" } },
          { customerName: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 3,
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 3,
    }),
  ]);

  const results = [
    ...products.map((p) => ({
      type: "product" as const,
      id: p.id,
      title: p.name,
      subtitle: `${p.brand.name} · ${formatPrice(p.priceB2C)}`,
      href: `/admin/produits/${p.id}`,
    })),
    ...orders.map((o) => ({
      type: "order" as const,
      id: o.id,
      title: o.orderNumber,
      subtitle: `${o.customerName} · ${formatPrice(o.total)}`,
      href: `/admin/commandes/${o.id}`,
    })),
    ...users.map((u) => ({
      type: "user" as const,
      id: u.id,
      title: u.name || "Sans nom",
      subtitle: u.email,
      href: `/admin/utilisateurs`,
    })),
  ];

  return NextResponse.json({ results });
}