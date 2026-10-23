import type { Metadata } from "next";

export const siteConfig = {
  name: "PM Osons Oser",
  shortName: "PM OSONS OSER",
  description:
    "Plateforme e-commerce premium pour la vente de motos, tricycles, pièces détachées, machines agricoles et lubrifiants au Bénin. Apsonic, Honda, TVS, Haojue, Dayang, Fenghao.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://pmosonsoser.com",
  ogImage: "/logo/pm-osons-oser-1.jpg",
  // Note : OG locale utilise un underscore (fr_BJ), pas un tiret
  locale: "fr_BJ",
  keywords: [
    // Marques
    "Apsonic Bénin",
    "Honda Bénin",
    "TVS Bénin",
    "Haojue Bénin",
    "Dayang Bénin",
    "Fenghao Bénin",
    "Bajaj Bénin",
    // Catégories
    "motos Bénin",
    "tricycles Bénin",
    "pièces détachées motos Bénin",
    "lubrifiants motos Bénin",
    "machines agricoles Bénin",
    "motoculteurs Bénin",
    "pompes agricoles Bénin",
    "tronçonneuses Bénin",
    // Intention d'achat
    "acheter moto Bénin",
    "acheter tricycle Bénin",
    "moto pas cher Bénin",
    "moto Cotonou",
    "tricycle Cotonou",
    "pièces motos Cotonou",
    // Longue traîne
    "livraison moto Bénin",
    "moto Mobile Money Bénin",
    "magasin moto Cotonou",
    "revendeur moto Bénin",
    "grossiste moto Bénin",
    "pièces d'origine moto Bénin",
    // Marque
    "PM Osons Oser",
    "PM Osons Oser Bénin",
  ],
  author: {
    name: "Parfait Sènan AGBLONON",
    url: "https://pmosonsoser.com",
  },
  creator: {
    name: "Kelly Josué AKPLOGAN",
    url: "https://kja-studio-labs.com",
  },
  socials: {
    facebook: "https://facebook.com/pmosonsoser",
    instagram: "https://instagram.com/pmosonsoser",
  },
  contact: {
    email: "pmosonsoser@gmail.com",
    phone: "+229 01 96 98 71 09",
    address: {
      city: "Cotonou",
      region: "Littoral",
      country: "BJ",
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || "",
  },
};

type SeoProps = {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  pathname?: string;
  // Nouveautés
  type?: "website" | "article" | "product";
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  priceAmount?: number;
  priceCurrency?: string;
} & Omit<Metadata, "title" | "description">;

export function constructMetadata({
  title,
  description,
  image,
  noIndex = false,
  pathname,
  type = "website",
  keywords,
  publishedTime,
  modifiedTime,
  author,
  priceAmount,
  priceCurrency = "XOF",
  ...rest
}: SeoProps = {}): Metadata {
  // Construction de l'URL canonique (sans slash final)
  const cleanPath = pathname?.replace(/\/$/, "") || "";
  const url = cleanPath ? `${siteConfig.url}${cleanPath}` : siteConfig.url;

  // Image OG avec URL absolue
  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${siteConfig.url}${image}`
    : `${siteConfig.url}${siteConfig.ogImage}`;

  // Titre final
  const finalTitle = title
    ? title
    : `${siteConfig.name} — Motos, Tricycles, Pièces, Machines Agricoles & Lubrifiants`;

  // Description finale
  const finalDescription = description || siteConfig.description;

  // Keywords fusionnés
  const finalKeywords = keywords
    ? [...keywords, ...siteConfig.keywords.slice(0, 10)]
    : siteConfig.keywords;

  return {
    // === BASE ===
    title: title
      ? title
      : {
          default: finalTitle,
          template: `%s | ${siteConfig.name}`,
        },
    description: finalDescription,
    keywords: finalKeywords,
    authors: [
      { name: siteConfig.author.name, url: siteConfig.author.url },
      { name: siteConfig.creator.name, url: siteConfig.creator.url },
    ],
    creator: siteConfig.creator.name,
    publisher: siteConfig.name,
    generator: "Next.js",
    applicationName: siteConfig.name,
    category: "E-commerce",
    classification: "Motos, Tricycles, Pièces détachées, Lubrifiants, Machines agricoles",
    referrer: "origin-when-cross-origin",

    // === URL & CANONIQUE ===
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
      languages: {
        "fr-BJ": url,
      },
    },

    // === OPEN GRAPH ===
    openGraph: {
      type: type === "product" ? "website" : type,
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.name,
      title: title || siteConfig.name,
      description: finalDescription,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title || siteConfig.name,
          type: "image/jpeg",
        },
      ],
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : undefined,
      }),
      ...(type === "product" &&
        priceAmount && {
          // Note : Next.js n'expose pas OG product nativement, on le met en other
        }),
    },

    // === TWITTER / X ===
    twitter: {
      card: "summary_large_image",
      site: "@pmosonsoser",
      creator: "@pmosonsoser",
      title: title || siteConfig.name,
      description: finalDescription,
      images: [imageUrl],
    },

    // === FAVICONS ===
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: [
        { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        {
          rel: "mask-icon",
          url: "/icons/maskable-512x512.png",
        },
      ],
    },

    // === PWA ===
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: siteConfig.name,
      statusBarStyle: "default",
    },
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },

    // === ROBOTS ===
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            "max-image-preview": "none",
          },
        }
      : {
          index: true,
          follow: true,
          nocache: false,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },

    // === VÉRIFICATION SEARCH CONSOLE ===
    verification: {
      google: siteConfig.verification.google || undefined,
      other: {
        ...(siteConfig.verification.bing && {
          "msvalidate.01": siteConfig.verification.bing,
        }),
        ...(siteConfig.verification.yandex && {
          "yandex-verification": siteConfig.verification.yandex,
        }),
      },
    },

    // === AUTRES MÉTADONNÉES ===
    other: {
      // Géolocalisation
      "geo.region": "BJ-LI",
      "geo.placename": "Cotonou",
      "geo.position": "6.36536;2.41833",
      "ICBM": "6.36536, 2.41833",
      // Mobile
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "apple-mobile-web-app-title": siteConfig.name,
      // Microsoft
      "msapplication-TileColor": "#1A1A1A",
      "msapplication-tap-highlight": "no",
      // Prix (pour products)
      ...(type === "product" && priceAmount
        ? {
            "product:price:amount": String(priceAmount),
            "product:price:currency": priceCurrency,
          }
        : {}),
      ...(type === "article" && publishedTime
        ? { "article:published_time": publishedTime }
        : {}),
    },

    ...rest,
  };
}