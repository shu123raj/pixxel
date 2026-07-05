// File Path: app/pixxel-os/layout.jsx
// SEO metadata for /pixxel-os
// NOTE: page.jsx ek client component hai ("use client"), isliye
// metadata is server layout se export hota hai — Next.js ka sahi tarika.
import { buildMetadata, getPageJsonLd } from "@/lib/seo";

const seo = {
  "title": "Pixxel OS — AI Photo Editing on Every Device",
  "description": "Pixxel OS brings AI photo editing to desktop and every device. Sync your workflow anywhere with the Pixxel cloud engine, built for professional creators.",
  "path": "/pixxel-os",
  "keywords": [
    "Pixxel OS",
    "desktop photo editor",
    "cross-device photo editing",
    "cloud photo editor"
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
