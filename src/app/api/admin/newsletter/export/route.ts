import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
    select: { email: true, createdAt: true },
  });

  // Génération du CSV
  const header = "Email,Date d'inscription\n";
  const rows = subscribers
    .map((s) => `${s.email},${s.createdAt.toISOString()}`)
    .join("\n");

  const csv = header + rows;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-pm-osons-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}