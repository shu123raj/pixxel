// File Path: app/hdr/layout.jsx
// SEO metadata for /hdr
// NOTE: page.jsx ek client component hai ("use client"), isliye
// metadata is server layout se export hota hai — Next.js ka sahi tarika.
import { buildMetadata, getPageJsonLd } from "@/lib/seo";

const seo = {
  "title": "AI HDR Photo Effect — Enhance Dynamic Range",
  "description": "Give photos stunning HDR depth with Pixxel's AI. Balance shadows and highlights, boost detail and color, and create dramatic high-dynamic-range images instantly.",
  "path": "/hdr",
  "keywords": [
    "HDR photo editor",
    "AI HDR effect",
    "dynamic range enhancement",
    "HDR photography online"
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
