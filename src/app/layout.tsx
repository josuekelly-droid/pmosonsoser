import type { Metadata, Viewport } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { constructMetadata, siteConfig } from "@/lib/seo";
import { Providers } from "@/components/providers";
import { PWARegister } from "@/components/shared/pwa-register";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Intégration des métadonnées PWA et Favicons
export const metadata: Metadata = {
  ...constructMetadata(),
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PM Osons Oser",
  },
  
  // AJOUT DES FAVICONS ICI
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#1A1A1A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo/pm-osons-oser-1.jpg`,
    image: `${siteConfig.url}/logo/pm-osons-oser-1.jpg`,
    currenciesAccepted: "XOF",
    paymentAccepted: "Mobile Money, Western Union, Virement bancaire",
    address: { "@type": "PostalAddress", addressCountry: "BJ" },
  };

  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${bebasNeue.variable} font-sans antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Enregistrement du Service Worker pour la PWA */}
        <PWARegister />

        {/* SessionProvider NextAuth */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}