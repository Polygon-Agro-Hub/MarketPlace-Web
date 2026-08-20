// app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "@/components/main-layout/clientlayoutwrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ─────────────────────────────────────────────────────────────────────────────
const SITE_URL = "https://www.govimart.com";
const SITE_NAME = "GoviMart";
const SITE_DESCRIPTION =
  "GoviMart – Sri Lanka's #1 online fresh grocery store. Order farm-fresh vegetables, fruits, spices, cereals, pulses & mushrooms online. Build a custom cart, choose any quantity, and get fast doorstep delivery across Sri Lanka. 100% fresh. Order now!";
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:
      "Polygon",
    template: "%s | GoviMart Sri Lanka",
  },

  description: SITE_DESCRIPTION,

  keywords: [
    // ── Brand ───────────────────────────────────────────────────────────────
    "GoviMart",
    "Govimart.com",
    "GoviMart Sri Lanka",
    "GoviMart online grocery",
    "GoviMart delivery",

    // ── Product / category ──────────────────────────────────────────────────
    "fresh vegetables online Sri Lanka",
    "buy fresh vegetables Sri Lanka",
    "fresh fruits online Sri Lanka",
    "buy fruits online Sri Lanka",
    "organic vegetables Sri Lanka",
    "organic fruits Sri Lanka",
    "fresh spices Sri Lanka",
    "buy spices online Sri Lanka",
    "Ceylon spices online",
    "cereals and pulses Sri Lanka",
    "buy dhal online Sri Lanka",
    "buy lentils online Sri Lanka",
    "rice and pulses online Sri Lanka",
    "fresh mushrooms Sri Lanka",
    "buy mushrooms online Sri Lanka",
    "button mushrooms Sri Lanka",
    "oyster mushrooms Sri Lanka",
    "green leaves vegetables Sri Lanka",
    "leafy greens delivery Sri Lanka",
    "tropical fruits Sri Lanka",

    // ── Location-based ──────────────────────────────────────────────────────
    "online grocery Sri Lanka",
    "grocery delivery Sri Lanka",
    "home delivery vegetables Colombo",
    "vegetable delivery Colombo",
    "online grocery Colombo",
    "fresh produce delivery Colombo",
    "grocery delivery Kandy",
    "vegetable delivery Gampaha",
    "grocery delivery Negombo",
    "grocery delivery Galle",
    "vegetable delivery Western Province",
    "online grocery shop near me Sri Lanka",
    "supermarket delivery Sri Lanka",

    // ── Long-tail / voice search ─────────────────────────────────────────────
    "where to buy fresh vegetables online in Sri Lanka",
    "best online grocery store in Sri Lanka",
    "order vegetables online and get home delivery Sri Lanka",
    "how to buy fresh fruits online Sri Lanka",
    "fresh vegetable home delivery Sri Lanka",
    "same day grocery delivery Sri Lanka",
    "next day vegetable delivery Sri Lanka",
    "order fresh produce online Sri Lanka",
    "customisable grocery cart Sri Lanka",
    "build your own grocery cart online",
    "buy any quantity vegetables online Sri Lanka",
    "wholesale vegetables online Sri Lanka",
    "bulk vegetable order Sri Lanka",

    // ── Competitor / alternative ─────────────────────────────────────────────
    "online vegetable shop Sri Lanka",
    "online grocery store Sri Lanka",
    "fresh food delivery app Sri Lanka",
    "grocery app Sri Lanka",
    "grocery ecommerce Sri Lanka",
    "e-grocery Sri Lanka",

    // ── Occasion / use-case ──────────────────────────────────────────────────
    "fresh vegetables for restaurants Sri Lanka",
    "office pantry grocery delivery Sri Lanka",
    "weekly vegetable subscription Sri Lanka",
    "monthly grocery order Sri Lanka",
    "fresh produce for events Sri Lanka",
    "avurudu grocery Sri Lanka",
    "New Year vegetable delivery Sri Lanka",
  ],

  authors: [{ name: "GoviMart", url: SITE_URL }],
  creator: "GoviMart",
  publisher: "Polygon Holdings (Pvt) Ltd",
  category: "Shopping",

  alternates: { canonical: "/" },

  // ── Open Graph — WhatsApp / Facebook / LinkedIn link previews ─────────────
  openGraph: {
    type: "website",
    locale: "en_LK",
    url: SITE_URL,
    siteName: SITE_NAME,
    title:
      "GoviMart | Fresh Vegetables, Fruits & Groceries – Home Delivery Sri Lanka",
    description:
      "Shop the freshest vegetables, fruits, spices, cereals, pulses & mushrooms online at GoviMart. Build your own custom grocery cart with any quantity and get reliable home delivery anywhere in Sri Lanka. Fresh from the farm to your door – every order, every time.",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`, // place a 1200×630px image at /public/og-image.jpg
        width: 1200,
        height: 630,
        alt: "GoviMart – Fresh Vegetables, Fruits & Groceries Delivered to Your Door in Sri Lanka",
        type: "image/jpeg",
      },
    ],
  },

  // ── Twitter / X card ─────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: "@govimart",
    title:
      "GoviMart | Fresh Vegetables & Fruits – Doorstep Delivery Sri Lanka",
    description:
      "Sri Lanka's freshest online grocery store. Custom cart, any quantity — vegetables, fruits, spices, cereals & mushrooms delivered to your door. Order at GoviMart today!",
    images: [`${SITE_URL}/og-image.jpg`],
  },

  // ── Robots ────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── PWA ───────────────────────────────────────────────────────────────────
  applicationName: SITE_NAME,
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  manifest: "/manifest.json",

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },

  verification: {
    google: "PASTE_YOUR_GOOGLE_SEARCH_CONSOLE_CODE_HERE",
  },
};

export const viewport: Viewport = {
  themeColor: "#3E206D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-LK">
      <head>
        {/* ── JSON-LD: Organization ─────────────────────────────────────────
            Powers Google's Knowledge Panel — the branded info box that
            appears on the right side when someone searches "GoviMart".      */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: "GoviMart",
              legalName: "Polygon Holdings (Pvt) Ltd",
              url: SITE_URL,
              logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/logo.png`,
                width: 150,
                height: 60,
              },
              description: SITE_DESCRIPTION,
              telephone: "+94770111999",
              address: {
                "@type": "PostalAddress",
                streetAddress: "No. 14, Sir Baron Jayathilaka Mawatha",
                addressLocality: "Colombo",
                postalCode: "00100",
                addressCountry: "LK",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+94770111999",
                contactType: "customer service",
                areaServed: "LK",
                availableLanguage: ["English", "Sinhala", "Tamil"],
              },
              sameAs: [
                "https://www.facebook.com/p/Govimart-61582676188251/",
                "https://www.instagram.com/govimart/",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: SITE_URL,
              name: "GoviMart",
              description: SITE_DESCRIPTION,
              publisher: { "@id": `${SITE_URL}/#organization` },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${SITE_URL}/?search={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
              inLanguage: "en-LK",
            }),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "GroceryStore",
              "@id": `${SITE_URL}/#store`,
              name: "GoviMart",
              image: `${SITE_URL}/og-image.jpg`,
              url: SITE_URL,
              telephone: "+94770111999",
              priceRange: "LKR",
              currenciesAccepted: "LKR",
              paymentAccepted:
                "Cash, Credit Card, Debit Card, Visa, Mastercard",
              description:
                "GoviMart is Sri Lanka's premier online fresh produce marketplace. Order fresh vegetables, fruits, spices, cereals, pulses, and mushrooms online with fast doorstep delivery island-wide.",
              address: {
                "@type": "PostalAddress",
                streetAddress: "No. 46/42, Nawam Mawatha",
                addressLocality: "Colombo",
                postalCode: "00200",
                addressCountry: "LK",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: "6.9271",
                longitude: "79.8612",
              },
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],
                opens: "06:00",
                closes: "22:00",
              },
              areaServed: { "@type": "Country", name: "Sri Lanka" },
              makesOffer: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Product",
                    name: "Fresh Vegetables",
                    category: "Groceries",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Product",
                    name: "Fresh Fruits",
                    category: "Groceries",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Product",
                    name: "Fresh Spices",
                    category: "Groceries",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Product",
                    name: "Cereals & Pulses",
                    category: "Groceries",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Product",
                    name: "Fresh Mushrooms",
                    category: "Groceries",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}