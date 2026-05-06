import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Allow all well-behaved crawlers ────────────────────────
      {
        userAgent: "*",
        allow: [
          "/",
          "/wholesale/home",
          "/promotions",
          "/signin",
          "/signup",
        ],
        disallow: [
          "/api/",
          "/_next/",
          "/account",
          "/cart",
          "/history/",
          "/exclude/",
          "/checkout/",
          "/admin/",
        ],
      },

      // ── Block known scraper bots ───────────────────────────────
      {
        userAgent: [
          "AhrefsBot",
          "SemrushBot",
          "DotBot",
          "MJ12bot",
          "BLEXBot",
          "DataForSeoBot",
        ],
        disallow: "/",
      },
    ],
    sitemap: "https://www.govimart.com/sitemap.xml",
  };
}