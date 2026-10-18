import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    // Désactive l'optimisation d'image de Next.js pour toutes les images.
    // Les images seront chargées directement depuis leur source, ce qui
    // permet d'utiliser n'importe quelle URL externe.
    unoptimized: true,
  },
};

export default nextConfig;