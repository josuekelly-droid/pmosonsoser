import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const brand = await prisma.brand.upsert({
    where: { name: "Bajaj" },
    update: {},
    create: { name: "Bajaj" },
  });
  console.log("✅ Marque créée :", brand.name, "| ID:", brand.id);
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());