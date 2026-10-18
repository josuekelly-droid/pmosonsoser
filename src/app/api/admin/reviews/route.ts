import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "all"; // all | approved | pending

  const where: any = {};
  if (status === "approved") where.isApproved = true;
  if (status === "pending") where.isApproved = false;

  const reviews = await prisma.review.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 200,
    select: {
      id: true,
      name: true,
      role: true,
      city: true,
      rating: true,
      text: true,
      isApproved: true,
      isFeatured: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, reviews });
}