// File Path: app/skin/layout.jsx
// SEO metadata for /skin
// NOTE: page.jsx ek client component hai ("use client"), isliye
// metadata is server layout se export hota hai — Next.js ka sahi tarika.
import { buildMetadata, getPageJsonLd } from "@/lib/seo";

const seo = {
  "title": "AI Skin Retouching — Smooth Skin Photo Editor",
  "description": "Get flawless, natural-looking skin with Pixxel's AI skin retouching. Remove blemishes, even skin tone, and smooth texture without the plastic look.",
  "path": "/skin",
  "keywords": [
    "skin retouching",
    "blemish remover",
    "AI skin smoothing",
    "skin editor online"
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
