// File Path: app/demo/layout.jsx
// SEO metadata for /demo
// NOTE: page.jsx ek client component hai ("use client"), isliye
// metadata is server layout se export hota hai — Next.js ka sahi tarika.
import { buildMetadata, getPageJsonLd } from "@/lib/seo";

const seo = {
  "title": "Live Demo — Try the AI Photo Editor Free",
  "description": "See Pixxel in action: portrait enhancement, background removal, and color correction. Try our AI photo editing tools live in your browser — free, no download required.",
  "path": "/demo",
  "keywords": [
    "photo editor demo",
    "try AI photo editor",
    "free photo editing online"
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
