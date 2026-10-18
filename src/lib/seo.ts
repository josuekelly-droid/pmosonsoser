import type { Metadata } from "next";

export const siteConfig = {
  name: "PM Osons Oser",
  shortName: "PM OSONS OSER",
  description:
    "Plateforme e-commerce premium pour la vente de motos, tricycles, pièces détachées et lubrifiants au Bénin. Apsonic, Honda, TVS, Haojue, Dayang.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://pm-osons-oser.com",
  ogImage: "/logo/pm-osons-oser-1.jpg",
  locale: "fr-BJ",
  keywords: [
    "motos Bénin",
    "tricycles Bénin",
    "pièces détachées motos",
    "lubrifiants motos",
    "Apsonic Bénin",
    "Honda Bénin",
    "TVS Bénin",
    "Haojue Bénin",
    "Dayang Bénin",
    "PM Osons Oser",
  ],
  author: {
    name: "Parfait Sènan AGBLONON",
  },
};

type SeoProps = {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  pathname?: string;
} & Omit<Metadata, "title" | "description">;

export function constructMetadata({
  title,
  description,
  image,
  noIndex = false,
  pathname,
  ...rest
}: SeoProps = {}): Metadata {
  const url = pathname ? `${siteConfig.url}${pathname}` : siteConfig.url;

  return {
    title: title
      ? title
      : {
          default: `${siteConfig.name} — Motos, Tricycles, Pièces & Lubrifiants`,
          template: `%s | ${siteConfig.name}`,
        },
    description: description || siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [siteConfig.author],
    creator: siteConfig.author.name,
    publisher: siteConfig.name,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url,
      title: title || siteConfig.name,
      description: description || siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: image || siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title || siteConfig.name,
      description: description || siteConfig.description,
      images: [image || siteConfig.ogImage],
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/logo/pm-osons-oser-1.jpg",
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    ...rest,
  };
}