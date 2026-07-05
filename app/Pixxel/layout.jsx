// File Path: app/Pixxel/layout.jsx
// SEO metadata for /Pixxel
// NOTE: page.jsx ek client component hai ("use client"), isliye
// metadata is server layout se export hota hai — Next.js ka sahi tarika.
import { buildMetadata, getPageJsonLd } from "@/lib/seo";

const seo = {
  "title": "About Pixxel — The AI Photo Editing Platform",
  "description": "Discover Pixxel: the all-in-one AI photo editing platform. Learn about our AI tools for retouching, background removal, sky replacement and more.",
  "path": "/Pixxel",
  "keywords": [
    "about Pixxel",
    "AI photo editing platform",
    "Pixxel editor"
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
