// File Path: app/wildlife/layout.jsx
// SEO metadata for /wildlife
// NOTE: page.jsx ek client component hai ("use client"), isliye
// metadata is server layout se export hota hai — Next.js ka sahi tarika.
import { buildMetadata, getPageJsonLd } from "@/lib/seo";

const seo = {
  "title": "Wildlife Photo Editor — AI Enhancement Tools",
  "description": "Bring wildlife photos to life with Pixxel's AI. Sharpen fur and feathers, fix low light, reduce noise and make every animal shot gallery-worthy.",
  "path": "/wildlife",
  "keywords": [
    "wildlife photo editing",
    "animal photo enhancer",
    "AI noise reduction",
    "nature photography editing"
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
