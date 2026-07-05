// File Path: app/landscape/layout.jsx
// SEO metadata for /landscape
// NOTE: page.jsx ek client component hai ("use client"), isliye
// metadata is server layout se export hota hai — Next.js ka sahi tarika.
import { buildMetadata, getPageJsonLd } from "@/lib/seo";

const seo = {
  "title": "AI Landscape Photo Editor — Enhance Nature Shots",
  "description": "Enhance landscape photos with Pixxel's AI: richer skies, vivid colors, sharper detail and perfect exposure for mountains, oceans, and every outdoor scene.",
  "path": "/landscape",
  "keywords": [
    "landscape photo editing",
    "nature photo enhancer",
    "AI landscape enhancement",
    "outdoor photo editor"
  ]
};

export const metadata = buildMetadata(seo);

export default function Layout({ children }) {
  return (
    <>
      {/* JSON-LD Structured Data for this page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getPageJsonLd(seo)) }}
      />
      {children}
    </>
  );
}
