import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🔧 Correction des slugs (suppression des doublons de marque)...\n");

  const products = await prisma.product.findMany({
    include: { brand: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`📦 ${products.length} produits à traiter\n`);

  let updated = 0;
  let unchanged = 0;

  for (const product of products) {
    // 🎯 Détection intelligente :
    // Si la marque est déjà dans le nom du produit, on ne l'ajoute pas
    const brandInName = product.name.toLowerCase().includes(product.brand.name.toLowerCase());

    const baseText = brandInName
      ? product.name              // La marque est déjà dans le nom
      : `${product.brand.name} ${product.name}`; // Ajouter la marque

    const baseSlug = slugify(baseText);

    // Vérifier unicité
    let finalSlug = baseSlug;
    let counter = 1;

    while (
      await prisma.product.findFirst({
        where: { slug: finalSlug, id: { not: product.id } },
      })
    ) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Mettre à jour seulement si le slug change
    if (finalSlug !== product.slug) {
      await prisma.product.update({
        where: { id: product.id },
        data: { slug: finalSlug },
      });
      console.log(`✅ [FIX] ${product.name}`);
      console.log(`      ${product.slug} → ${finalSlug}\n`);
      updated++;
    } else {
      unchanged++;
    }
  }

  console.log("=".repeat(60));
  console.log(`🎉 Terminé !`);
  console.log(`   ✅ Corrigés : ${updated}`);
  console.log(`   ⏭️  Inchangés : ${unchanged}`);
  console.log("=".repeat(60));
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });