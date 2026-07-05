// File Path: app/bokeh/layout.jsx
// SEO metadata for /bokeh
// NOTE: page.jsx ek client component hai ("use client"), isliye
// metadata is server layout se export hota hai — Next.js ka sahi tarika.
import { buildMetadata, getPageJsonLd } from "@/lib/seo";

const seo = {
  "title": "AI Bokeh Effect — Blur Photo Background Online",
  "description": "Add dreamy DSLR-style bokeh and background blur to any photo with Pixxel's AI. Create professional portrait depth-of-field effects online — no camera lens needed.",
  "path": "/bokeh",
  "keywords": [
    "bokeh effect online",
    "blur background",
    "AI depth of field",
    "portrait blur",
    "photo background blur"
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
