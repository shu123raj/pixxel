// File Path: app/sky/layout.jsx
// SEO metadata for /sky
// NOTE: page.jsx ek client component hai ("use client"), isliye
// metadata is server layout se export hota hai — Next.js ka sahi tarika.
import { buildMetadata, getPageJsonLd } from "@/lib/seo";

const seo = {
  "title": "AI Sky Replacement — Change Photo Sky Online",
  "description": "Swap dull skies for dramatic sunsets, blue skies or starry nights with Pixxel's AI sky replacement. Automatic masking and realistic relighting in seconds.",
  "path": "/sky",
  "keywords": [
    "sky replacement",
    "change sky in photo",
    "AI sky editor",
    "sunset sky photo"
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
