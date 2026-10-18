import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const INPUT_LOGO = 'public/logo/pm-osons-oser-1.jpg';
const OUTPUT_DIR = 'public/icons';

// Tailles standards pour PWA, Android et iOS
const SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 }, // iOS
  { name: 'icon-192x192.png', size: 192 },     // Android standard
  { name: 'icon-384x384.png', size: 384 },     // Android HD
  { name: 'icon-512x512.png', size: 512 },     // PWA Splash
  { name: 'maskable-512x512.png', size: 512, padding: 0.1 }, // Android Adaptive
];

async function generateIcons() {
  // 1. Créer le dossier de sortie s'il n'existe pas
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('🎨 Génération des icônes à partir de', INPUT_LOGO);

  for (const { name, size, padding = 0 } of SIZES) {
    const outputPath = path.join(OUTPUT_DIR, name);
    
    let pipeline = sharp(INPUT_LOGO);

    if (padding > 0) {
      // Pour les icônes "maskable" (Android), on ajoute une marge de sécurité
      // Le logo est réduit et centré sur un fond noir (couleur de la marque)
      const innerSize = Math.round(size * (1 - padding * 2));
      const resizedLogo = await pipeline
        .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();

      pipeline = sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 26, g: 26, b: 26, alpha: 1 }, // #1A1A1A (brand-black)
        },
      }).composite([{ input: resizedLogo, gravity: 'center' }]);
    } else {
      // Icônes normales : on redimensionne simplement en gardant les proportions
      pipeline = pipeline.resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 } // Fond blanc pour les favicons
      });
    }

    await pipeline.png().toFile(outputPath);
    console.log(`✅ ${name} (${size}x${size})`);
  }

  console.log('\n🎉 Toutes les icônes ont été générées dans', OUTPUT_DIR);
}

generateIcons().catch((err) => {
  console.error('❌ Erreur lors de la génération :', err);
  process.exit(1);
});