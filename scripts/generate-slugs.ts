import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Convertit un texte en slug URL-friendly
 * Ex: "Apsonic AP110-2" → "apsonic-ap110-2"
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9]+/g, "-")     // Remplace tout caractère non alphanumérique par un tiret
    .replace(/(^-|-$)/g, "");        // Supprime les tirets en début/fin
}

async function main() {
  console.log("🚀 Génération des slugs pour les produits...\n");

  // 1. Récupérer tous les produits avec leur marque
  const products = await prisma.product.findMany({
    include: { brand: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`📦 ${products.length} produits à traiter\n`);

  let updated = 0;
  let skipped = 0;

  // 2. Pour chaque produit, générer et attribuer un slug unique
  for (const product of products) {
    // Skip si le slug existe déjà
    if (product.slug) {
      console.log(`⏭️  [SKIP] ${product.name} → ${product.slug} (déjà défini)`);
      skipped++;
      continue;
    }

    // Générer le slug de base : "marque nom-du-produit"
    const baseSlug = slugify(`${product.brand.name} ${product.name}`);

    // 3. Vérifier l'unicité (au cas où deux produits auraient le même nom)
    let finalSlug = baseSlug;
    let counter = 1;

    while (
      await prisma.product.findFirst({
        where: {
          slug: finalSlug,
          id: { not: product.id },
        },
      })
    ) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 4. Mettre à jour le produit
    await prisma.product.update({
      where: { id: product.id },
      data: { slug: finalSlug },
    });

    console.log(`✅ [OK]   ${product.name} → ${finalSlug}`);
    updated++;
  }

  console.log("\n" + "=".repeat(60));
  console.log(`🎉 Terminé !`);
  console.log(`   ✅ Mis à jour : ${updated}`);
  console.log(`   ⏭️  Déjà définis : ${skipped}`);
  console.log(`   📦 Total : ${products.length}`);
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