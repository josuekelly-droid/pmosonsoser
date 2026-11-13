import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pmosonsoser.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",         
          "/compte/",         
          "/api/",
          "/panier",           
          "/checkout",         
          "/commande/",
          "/connexion",        
          "/inscription",      
          "/verifier-email",   
          "/mot-de-passe-oublie",
          "/nouveau-mot-de-passe",
          "/recherche",
        ],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}