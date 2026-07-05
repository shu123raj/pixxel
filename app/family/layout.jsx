// File Path: app/family/layout.jsx
// SEO metadata for /family
// NOTE: page.jsx ek client component hai ("use client"), isliye
// metadata is server layout se export hota hai — Next.js ka sahi tarika.
import { buildMetadata, getPageJsonLd } from "@/lib/seo";

const seo = {
  "title": "Family Photo Editor — Enhance & Restore with AI",
  "description": "Make family memories shine with Pixxel's AI. Enhance group photos, fix lighting, restore old family pictures, and get everyone looking their best in one click.",
  "path": "/family",
  "keywords": [
    "family photo editing",
    "restore old photos",
    "group photo enhancer",
    "photo restoration AI"
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
