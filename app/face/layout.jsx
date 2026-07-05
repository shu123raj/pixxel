// File Path: app/face/layout.jsx
// SEO metadata for /face
// NOTE: page.jsx ek client component hai ("use client"), isliye
// metadata is server layout se export hota hai — Next.js ka sahi tarika.
import { buildMetadata, getPageJsonLd } from "@/lib/seo";

const seo = {
  "title": "AI Face Retouch — Portrait Photo Editor Online",
  "description": "Retouch portraits naturally with Pixxel's AI face editor. Smooth skin, enhance features, and perfect every selfie or portrait while keeping it authentic.",
  "path": "/face",
  "keywords": [
    "AI face retouch",
    "portrait editor",
    "face enhancement",
    "selfie editor",
    "AI portrait retouching"
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
