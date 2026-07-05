// File Path: app/background/layout.jsx
// SEO metadata for /background
// NOTE: page.jsx ek client component hai ("use client"), isliye
// metadata is server layout se export hota hai — Next.js ka sahi tarika.
import { buildMetadata, getPageJsonLd } from "@/lib/seo";

const seo = {
  "title": "AI Background Remover & Editor — Remove BG Free",
  "description": "Remove and change photo backgrounds instantly with Pixxel's AI background remover. Get clean cutouts, transparent backgrounds, and studio-quality results in one click.",
  "path": "/background",
  "keywords": [
    "background remover",
    "remove background from image",
    "AI background eraser",
    "transparent background maker",
    "change photo background online"
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
