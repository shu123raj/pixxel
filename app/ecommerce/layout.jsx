// File Path: app/ecommerce/layout.jsx
// SEO metadata for /ecommerce
// NOTE: page.jsx ek client component hai ("use client"), isliye
// metadata is server layout se export hota hai — Next.js ka sahi tarika.
import { buildMetadata, getPageJsonLd } from "@/lib/seo";

const seo = {
  "title": "E-commerce Product Photo Editor — AI Retouching",
  "description": "Turn product shots into sales-ready images with Pixxel's AI. Clean backgrounds, perfect lighting, and marketplace-ready product photos for Amazon, Shopify and more.",
  "path": "/ecommerce",
  "keywords": [
    "product photo editing",
    "ecommerce photo editor",
    "amazon product images",
    "white background product photo"
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
