// File Path: app/pricing/layout.jsx
// SEO metadata for /pricing
// NOTE: page.jsx ek client component hai ("use client"), isliye
// metadata is server layout se export hota hai — Next.js ka sahi tarika.
import { buildMetadata, getPageJsonLd } from "@/lib/seo";

const seo = {
  "title": "Pricing & Plans — Free AI Photo Editor",
  "description": "Simple Pixxel pricing: start free, upgrade for pro AI editing tools. Compare desktop, cross-device and perpetual license plans and pick what fits your workflow.",
  "path": "/pricing",
  "keywords": [
    "photo editor pricing",
    "AI photo editor free plan",
    "Pixxel plans"
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
