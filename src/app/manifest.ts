// app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GoviMart – Fresh Groceries Sri Lanka",
    short_name: "GoviMart",
    description:
      "Sri Lanka's #1 online fresh grocery store. Order farm-fresh vegetables, fruits, spices, cereals, pulses & mushrooms with fast doorstep delivery island-wide.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3E206D",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}